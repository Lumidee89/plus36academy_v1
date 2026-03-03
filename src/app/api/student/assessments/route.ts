import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // Get all courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      select: {
        courseId: true,
      },
    })

    const courseIds = enrollments.map(e => e.courseId)

    if (courseIds.length === 0) {
      return successResponse([])
    }

    // Get all published assessments for those courses
    const assessments = await (prisma as any).assessment.findMany({
      where: {
        courseId: {
          in: courseIds,
        },
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
          },
        },
        attempts: {
          where: {
            studentId: user.id,
          },
          orderBy: {
            startedAt: 'desc', // Changed from createdAt to startedAt
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format the response to include attempt status
    const formattedAssessments = assessments.map((assessment: any) => ({
      ...assessment,
      questions: assessment.questions,
      attempts: assessment.attempts.map((attempt: any) => ({
        id: attempt.id,
        score: attempt.score,
        passed: attempt.passed,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
        startedAt: attempt.startedAt,
      })),
    }))

    return successResponse(formattedAssessments)
  } catch (error) {
    console.error('Get student assessments error:', error)
    return errorResponse('Internal server error', 500)
  }
}