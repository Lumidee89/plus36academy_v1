// src/app/api/materials/[id]/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: params.id },
    })
    if (!material) return errorResponse('Material not found', 404)
    return successResponse(material)
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

    const material = await prisma.material.findUnique({
      where: { id: params.id },
      include: { module: { include: { course: true } } },
    })
    if (!material) return errorResponse('Material not found', 404)
    if (user.role === 'TUTOR' && material.module.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const body = await request.json()
    const updated = await prisma.material.update({
      where: { id: params.id },
      data: body,
    })

    return successResponse(updated, 'Material updated')
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

    const material = await prisma.material.findUnique({
      where: { id: params.id },
      include: { module: { include: { course: true } } },
    })
    if (!material) return errorResponse('Material not found', 404)
    if (user.role === 'TUTOR' && material.module.course.tutorId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    await prisma.material.delete({ where: { id: params.id } })

    return successResponse(null, 'Material deleted')
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
