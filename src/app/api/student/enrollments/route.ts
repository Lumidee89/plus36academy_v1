import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status') // ACTIVE, COMPLETED

    // Build where clause
    const where: any = {
      userId: user.id,
    }

    if (status) {
      where.status = status
    }

    // Get enrollments with course details
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            include: {
              tutor: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  modules: true,
                },
              },
            },
          },
        },
      }),
      prisma.enrollment.count({ where }),
    ])

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get total materials in course
        const totalMaterials = await prisma.material.count({
          where: {
            module: {
              courseId: enrollment.courseId,
            },
          },
        })

        // Get completed materials
        const completedMaterials = await prisma.progress.count({
          where: {
            enrollmentId: enrollment.id,
            completed: true,
          },
        })

        const progress = totalMaterials > 0
          ? Math.round((completedMaterials / totalMaterials) * 100)
          : 0

        return {
          ...enrollment,
          progress,
        }
      })
    )

    return paginatedResponse(enrollmentsWithProgress, total, page, limit)
  } catch (error) {
    console.error('Get student enrollments error:', error)
    return errorResponse('Internal server error', 500)
  }
}