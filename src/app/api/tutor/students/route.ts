import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''

    // Get tutor's courses
    const tutorCourses = await prisma.course.findMany({
      where: { tutorId: user.id },
      select: { id: true },
    })
    const courseIds = tutorCourses.map(c => c.id)

    // If tutor has no courses, return empty response early
    if (courseIds.length === 0) {
      return paginatedResponse([], 0, page, limit)
    }

    // Build where clause for enrollments
    const where: any = {
      courseId: { in: courseIds },
      ...(courseId && { courseId }),
      ...(status && { status: status.toUpperCase() }), // Convert to uppercase for enum
    }

    // Add search condition
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    // Get total count
    const total = await prisma.enrollment.count({ where })

    // Get enrollments with user and course details
    const enrollments = await prisma.enrollment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            modules: {
              select: {
                id: true,
                materials: {
                  select: { id: true },
                },
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
    })

    // Format the response
    const students = enrollments.map(enrollment => {
      const totalMaterials = enrollment.course.modules.reduce(
        (sum, module) => sum + module.materials.length, 0
      )
      const completedMaterials = enrollment.progresses.filter(p => p.completed).length
      const progress = totalMaterials > 0 
        ? Math.round((completedMaterials / totalMaterials) * 100) 
        : 0

      return {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        avatar: enrollment.user.avatar,
        enrolledAt: enrollment.createdAt,
        lastActive: enrollment.updatedAt,
        progress,
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        completedModules: enrollment.progresses.filter(p => p.completed).length,
        totalModules: enrollment.course.modules.length,
        status: enrollment.status.toLowerCase(),
      }
    })

    // Use paginatedResponse instead of successResponse
    return paginatedResponse(students, total, page, limit)
    
  } catch (error) {
    console.error('Get tutor students error:', error)
    return errorResponse('Internal server error', 500)
  }
}