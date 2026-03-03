import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import { z } from 'zod'

const questionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']),
  points: z.number().int().min(1).default(1),
  options: z.any().optional(),
  correctAnswer: z.any(),
  explanation: z.string().optional(),
  order: z.number().int(),
})

const assessmentSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  type: z.enum(['TEST', 'EXAM']),
  courseId: z.string(),
  moduleId: z.string().optional(),
  timeLimit: z.number().int().min(1).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).default(1),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  questions: z.array(questionSchema),
})

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const validation = assessmentSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400)
    }

    const data = validation.data

    // Verify course belongs to tutor
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    })

    if (!course) return errorResponse('Course not found', 404)
    if (user.role !== 'ADMIN' && course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    // Create assessment with questions - PUBLISHED IMMEDIATELY
    const assessment = await (prisma as any).assessment.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        courseId: data.courseId,
        moduleId: data.moduleId,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
        shuffleQuestions: data.shuffleQuestions,
        showResults: data.showResults,
        isPublished: true, // Changed from false to true
        questions: {
          create: data.questions.map(q => ({
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
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    })

    return successResponse(assessment, 'Assessment created and published successfully', 201)
  } catch (error) {
    console.error('Create assessment error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const published = searchParams.get('published')

    const where: any = {}
    
    if (user.role === 'TUTOR') {
      where.course = { tutorId: user.id }
    }
    
    if (courseId) where.courseId = courseId
    if (published !== null) where.isPublished = published === 'true'

    const assessments = await (prisma as any).assessment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        module: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(assessments)
  } catch (error) {
    console.error('Get assessments error:', error)
    return errorResponse('Internal server error', 500)
  }
}