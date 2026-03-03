import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api' // Add paginatedResponse import

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status') // ACTIVE, COMPLETED, etc.

    const where: any = {
      userId: user.id,
      ...(status && { status }),
    }

    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              tutor: {
                select: {
                  name: true,
                },
              },
            },
          },
          progresses: {
            select: {
              materialId: true,
              completed: true,
              completedAt: true,
            },
          },
        },
      }),
      prisma.enrollment.count({ where }),
    ])

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get total materials in the course
        const totalMaterials = await prisma.material.count({
          where: {
            module: {
              courseId: enrollment.courseId,
            },
          },
        })

        const completedMaterials = enrollment.progresses.filter(p => p.completed).length
        const progress = totalMaterials > 0 
          ? Math.round((completedMaterials / totalMaterials) * 100) 
          : 0

        return {
          id: enrollment.id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          status: enrollment.status,
          progress,
          createdAt: enrollment.createdAt,
          updatedAt: enrollment.updatedAt,
          completedAt: enrollment.completedAt,
          course: enrollment.course,
          totalMaterials,
          completedMaterials,
        }
      })
    )

    // Use paginatedResponse instead of successResponse
    return paginatedResponse(enrollmentsWithProgress, total, page, limit)
    
  } catch (error) {
    console.error('Get enrollments error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return errorResponse('Course ID is required', 400)
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId,
      },
    })

    if (existingEnrollment) {
      return errorResponse('Already enrolled in this course', 400)
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return errorResponse('Course not found', 404)
    }

    if (course.status !== 'PUBLISHED') {
      return errorResponse('Course is not available for enrollment', 400)
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        status: 'ACTIVE',
        progress: 0,
      },
    })

    return successResponse(enrollment, 'Successfully enrolled in course', 201)
  } catch (error) {
    console.error('Create enrollment error:', error)
    return errorResponse('Internal server error', 500)
  }
}