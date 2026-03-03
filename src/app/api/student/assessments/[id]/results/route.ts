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
    const attemptId = request.nextUrl.searchParams.get('attemptId')

    // Get assessment details
    const assessment = await (prisma as any).assessment.findUnique({
      where: { id: assessmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!assessment) {
      return errorResponse('Assessment not found', 404)
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: assessment.courseId,
      },
    })

    if (!enrollment) {
      return errorResponse('You are not enrolled in this course', 403)
    }

    // Get attempts
    const where: any = {
      assessmentId,
      studentId: user.id,
    }

    if (attemptId) {
      where.id = attemptId
    }

    const attempts = await (prisma as any).assessmentAttempt.findMany({
      where,
      include: {
        questionAnswers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return successResponse({
      assessment,
      attempts,
    })
  } catch (error) {
    console.error('Get student results error:', error)
    return errorResponse('Internal server error', 500)
  }
}