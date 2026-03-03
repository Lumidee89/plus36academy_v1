import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

const moduleSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  courseId: z.string(),
  order: z.number().int().min(0),
})

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const validation = moduleSchema.safeParse(body)
    if (!validation.success) return errorResponse(validation.error.errors[0].message)

    // Verify tutor owns the course
    const course = await prisma.course.findUnique({
      where: { id: validation.data.courseId },
    })
    if (!course) return errorResponse('Course not found', 404)
    if (user.role === 'TUTOR' && course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const module = await prisma.module.create({
      data: validation.data,
    })

    return successResponse(module, 'Module created', 201)
  } catch (error) {
    console.error('Create module error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) return errorResponse('courseId is required')

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        materials: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return successResponse(modules)
  } catch (error) {
    console.error('Get modules error:', error)
    return errorResponse('Internal server error', 500)
  }
}