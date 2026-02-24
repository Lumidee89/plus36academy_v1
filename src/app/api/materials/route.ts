// src/app/api/materials/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

const materialSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['PDF', 'IMAGE', 'TEXT', 'VIDEO', 'VIDEO_LINK']),
  fileUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  content: z.string().optional(),
  duration: z.number().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  order: z.number().int().min(0),
  isFree: z.boolean().default(false),
  moduleId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const validation = materialSchema.safeParse(body)
    if (!validation.success) return errorResponse(validation.error.errors[0].message)

    // Verify tutor owns the module's course
    const module = await prisma.module.findUnique({
      where: { id: validation.data.moduleId },
      include: { course: true },
    })
    if (!module) return errorResponse('Module not found', 404)
    if (user.role === 'TUTOR' && module.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const material = await prisma.material.create({
      data: validation.data,
    })

    return successResponse(material, 'Material added', 201)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')

    if (!moduleId) return errorResponse('moduleId is required')

    const materials = await prisma.material.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    })

    return successResponse(materials)
  } catch (error) {
    return errorResponse('Internal server error', 500)
  }
}
