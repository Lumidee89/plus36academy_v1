import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const assessmentId = params.id

    // Get assessment details
    const assessment = await (prisma as any).assessment.findUnique({
      where: {
        id: assessmentId,
        isPublished: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            points: true,
            options: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    if (!assessment) {
      return errorResponse('Assessment not found', 404)
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: assessment.courseId,
      },
    })

    if (!enrollment) {
      return errorResponse('You are not enrolled in this course', 403)
    }

    // Get student's attempts for this assessment
    const attempts = await (prisma as any).assessmentAttempt.findMany({
      where: {
        assessmentId,
        studentId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return successResponse({
      ...assessment,
      attempts,
    })
  } catch (error) {
    console.error('Get student assessment error:', error)
    return errorResponse('Internal server error', 500)
  }
}