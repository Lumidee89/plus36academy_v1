import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const assessmentId = params.id
    const { action, answers, timeSpent } = await request.json()

    // Get assessment details
    const assessment = await (prisma as any).assessment.findUnique({
      where: { id: assessmentId },
      include: {
        course: true,
        questions: true,
      },
    })

    if (!assessment) return errorResponse('Assessment not found', 404)
    if (!assessment.isPublished) return errorResponse('Assessment not available', 403)

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

    if (action === 'start') {
      // Check for existing in-progress attempt
      const existingAttempt = await (prisma as any).assessmentAttempt.findFirst({
        where: {
          assessmentId,
          studentId: user.id,
          status: 'in_progress',
        },
      })

      if (existingAttempt) {
        return successResponse({ attempt: existingAttempt })
      }

      // Check max attempts
      const attemptsCount = await (prisma as any).assessmentAttempt.count({
        where: {
          assessmentId,
          studentId: user.id,
        },
      })

      if (attemptsCount >= (assessment.maxAttempts || 1)) {
        return errorResponse('Maximum attempts reached', 400)
      }

      // Create new attempt
      const attempt = await (prisma as any).assessmentAttempt.create({
        data: {
          assessmentId,
          studentId: user.id,
          status: 'in_progress',
          startedAt: new Date(), // Explicitly set startedAt
        },
      })

      return successResponse({ attempt })
    }

    if (action === 'submit') {
      // Get current attempt
      const attempt = await (prisma as any).assessmentAttempt.findFirst({
        where: {
          assessmentId,
          studentId: user.id,
          status: 'in_progress',
        },
      })

      if (!attempt) {
        return errorResponse('No active attempt found', 404)
      }

      // Calculate score
      let totalPoints = 0
      let earnedPoints = 0
      const questionAnswers: { attemptId: any; questionId: any; answer: any; isCorrect: boolean | null; pointsEarned: number }[] = []

      for (const question of assessment.questions) {
        const studentAnswer = answers[question.id]
        totalPoints += question.points

        let isCorrect = false
        let pointsEarned = 0

        // Auto-grade based on question type
        if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE') {
          isCorrect = JSON.stringify(studentAnswer) === JSON.stringify(question.correctAnswer)
          pointsEarned = isCorrect ? question.points : 0
        } else if (question.type === 'SHORT_ANSWER') {
          // Simple string comparison (you might want to make this more sophisticated)
          const correct = String(question.correctAnswer).toLowerCase().trim()
          const answer = String(studentAnswer).toLowerCase().trim()
          isCorrect = correct === answer
          pointsEarned = isCorrect ? question.points : 0
        }
        // ESSAY questions need manual grading

        earnedPoints += pointsEarned

        questionAnswers.push({
          attemptId: attempt.id,
          questionId: question.id,
          answer: studentAnswer,
          isCorrect: question.type !== 'ESSAY' ? isCorrect : null,
          pointsEarned: question.type !== 'ESSAY' ? pointsEarned : 0,
        })
      }

      const percentageScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
      const passed = assessment.passingScore ? percentageScore >= assessment.passingScore : false

      // Update attempt
      const updatedAttempt = await (prisma as any).$transaction(async (tx: any) => {
        // Save all answers
        if (questionAnswers.length > 0) {
          await tx.studentAnswer.createMany({
            data: questionAnswers,
          })
        }

        // Update attempt
        return tx.assessmentAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'submitted',
            submittedAt: new Date(),
            score: percentageScore,
            passed,
            timeSpent,
            answers: answers, // Store raw answers as JSON
          },
        })
      })

      return successResponse({
        attempt: updatedAttempt,
        score: percentageScore,
        passed,
        totalPoints,
        earnedPoints,
      })
    }

    return errorResponse('Invalid action', 400)
  } catch (error) {
    console.error('Assessment attempt error:', error)
    return errorResponse('Internal server error', 500)
  }
}