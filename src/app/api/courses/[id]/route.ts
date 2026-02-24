// src/app/api/courses/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole, getUserFromRequest } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        tutor: { select: { id: true, name: true, avatar: true, bio: true } },
        category: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            materials: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                duration: true,
                order: true,
                isFree: true,
                // Only include URLs if enrolled or free
                fileUrl: user ? undefined : false,
                videoUrl: user ? undefined : false,
                content: user ? undefined : false,
              },
            },
          },
        },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { enrollments: true, reviews: true } },
      },
    })

    if (!course) return errorResponse('Course not found', 404)

    const avgRating =
      course.reviews.length > 0
        ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
        : 0

    // Check if user is enrolled
    let isEnrolled = false
    if (user) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
      })
      isEnrolled = !!enrollment
    }

    return successResponse({ ...course, avgRating, isEnrolled })
  } catch (error) {
    console.error('Get course error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const course = await prisma.course.findUnique({ where: { id: params.id } })
    if (!course) return errorResponse('Course not found', 404)

    if (user.role === 'TUTOR' && course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const body = await request.json()
    const updated = await prisma.course.update({
      where: { id: params.id },
      data: body,
    })

    return successResponse(updated, 'Course updated successfully')
  } catch (error) {
    console.error('Update course error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const course = await prisma.course.findUnique({ where: { id: params.id } })
    if (!course) return errorResponse('Course not found', 404)

    if (user.role === 'TUTOR' && course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await prisma.course.delete({ where: { id: params.id } })

    return successResponse(null, 'Course deleted successfully')
  } catch (error) {
    console.error('Delete course error:', error)
    return errorResponse('Internal server error', 500)
  }
}
