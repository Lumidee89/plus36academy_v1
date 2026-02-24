// src/app/api/courses/[id]/modules/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

const moduleSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  order: z.number().int().min(0),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modules = await prisma.module.findMany({
      where: { courseId: params.id },
      orderBy: { order: 'asc' },
      include: {
        materials: { orderBy: { order: 'asc' } },
      },
    })
    return successResponse(modules)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const course = await prisma.course.findUnique({ where: { id: params.id } })
    if (!course) return errorResponse('Course not found', 404)
    if (user.role === 'TUTOR' && course.tutorId !== user.id) return errorResponse('Forbidden', 403)

    const body = await request.json()
    const validation = moduleSchema.safeParse(body)
    if (!validation.success) return errorResponse(validation.error.errors[0].message)

    const module = await prisma.module.create({
      data: { ...validation.data, courseId: params.id },
    })

    return successResponse(module, 'Module created', 201)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}
