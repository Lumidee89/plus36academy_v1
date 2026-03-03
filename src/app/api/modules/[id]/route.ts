import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        materials: {
          orderBy: { order: 'asc' },
        },
        course: true,
      },
    })
    if (!module) return errorResponse('Module not found', 404)
    return successResponse(module)
  } catch {
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

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: { course: true },
    })
    if (!module) return errorResponse('Module not found', 404)
    if (user.role === 'TUTOR' && module.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const body = await request.json()
    const updated = await prisma.module.update({
      where: { id: params.id },
      data: body,
    })

    return successResponse(updated, 'Module updated')
  } catch {
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

    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: { course: true },
    })
    if (!module) return errorResponse('Module not found', 404)
    if (user.role === 'TUTOR' && module.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    // This will cascade delete all materials due to onDelete: Cascade in schema
    await prisma.module.delete({ where: { id: params.id } })

    return successResponse(null, 'Module deleted')
  } catch {
    return errorResponse('Internal server error', 500)
  }
}