import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const assessment = await (prisma as any).assessment.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    })

    if (!assessment) {
      return errorResponse('Assessment not found', 404)
    }

    // Check ownership
    const course = await prisma.course.findUnique({
      where: { id: assessment.courseId },
    })
    if (user.role !== 'ADMIN' && course?.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    // Ensure _count exists even if zero
    const responseData = {
      ...assessment,
      _count: assessment._count || { questions: 0, attempts: 0 }
    }

    return successResponse(responseData)
  } catch (error) {
    console.error('Get assessment error:', error)
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

    const body = await request.json()
    const { title, description, type, courseId, timeLimit, passingScore, maxAttempts, shuffleQuestions, showResults, isPublished, questions } = body

    // Check ownership
    const existingAssessment = await (prisma as any).assessment.findUnique({
      where: { id: params.id },
      include: { course: true },
    })

    if (!existingAssessment) {
      return errorResponse('Assessment not found', 404)
    }

    if (user.role !== 'ADMIN' && existingAssessment.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    // Update assessment and questions in transaction
    const updatedAssessment = await (prisma as any).$transaction(async (tx: any) => {
      // Delete existing questions
      await tx.question.deleteMany({
        where: { assessmentId: params.id },
      })

      // Update assessment
      const assessment = await tx.assessment.update({
        where: { id: params.id },
        data: {
          title,
          description,
          type,
          courseId,
          timeLimit,
          passingScore,
          maxAttempts,
          shuffleQuestions,
          showResults,
          isPublished,
          questions: {
            create: questions.map((q: any) => ({
              text: q.text,
              type: q.type,
              points: q.points,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              order: q.order,
            })),
          },
        },
        include: {
          questions: true,
          _count: {
            select: {
              questions: true,
              attempts: true,
            },
          },
        },
      })

      return assessment
    })

    return successResponse(updatedAssessment, 'Assessment updated successfully')
  } catch (error) {
    console.error('Update assessment error:', error)
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

    // Check ownership
    const assessment = await (prisma as any).assessment.findUnique({
      where: { id: params.id },
      include: { course: true },
    })

    if (!assessment) {
      return errorResponse('Assessment not found', 404)
    }

    if (user.role !== 'ADMIN' && assessment.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await (prisma as any).assessment.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Assessment deleted successfully' })
  } catch (error) {
    console.error('Delete assessment error:', error)
    return errorResponse('Internal server error', 500)
  }
}