import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN', 'STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            tutorId: true,
          },
        },
        module: true,
        questions: {
          orderBy: { order: 'asc' },
          // Don't send correct answers to students
          select: user.role === 'STUDENT' ? {
            id: true,
            text: true,
            type: true,
            points: true,
            options: true,
            order: true,
          } : {
            id: true,
            text: true,
            type: true,
            points: true,
            options: true,
            correctAnswer: true,
            explanation: true,
            order: true,
          },
        },
        attempts: {
          where: user.role === 'STUDENT' ? { studentId: user.id } : {},
          orderBy: { submittedAt: 'desc' },
        },
      },
    })

    if (!assessment) {
      return errorResponse('Assessment not found', 404)
    }

    // Check permissions
    if (user.role === 'STUDENT') {
      // Check if student is enrolled
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId: assessment.courseId,
        },
      })
      if (!enrollment) {
        return errorResponse('You are not enrolled in this course', 403)
      }
    } else if (user.role === 'TUTOR') {
      if (assessment.course.tutorId !== user.id) {
        return errorResponse('Forbidden', 403)
      }
    }

    return successResponse(assessment)
  } catch (error) {
    console.error('Get assessment error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const { isPublished, title, description, timeLimit, passingScore } = body

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: { course: true },
    })

    if (!assessment) return errorResponse('Assessment not found', 404)
    if (user.role !== 'ADMIN' && assessment.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const updated = await prisma.assessment.update({
      where: { id: params.id },
      data: {
        title,
        description,
        timeLimit,
        passingScore,
        isPublished,
      },
    })

    return successResponse(updated)
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

    const assessment = await prisma.assessment.findUnique({
      where: { id: params.id },
      include: { course: true },
    })

    if (!assessment) return errorResponse('Assessment not found', 404)
    if (user.role !== 'ADMIN' && assessment.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await prisma.assessment.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Assessment deleted successfully' })
  } catch (error) {
    console.error('Delete assessment error:', error)
    return errorResponse('Internal server error', 500)
  }
}