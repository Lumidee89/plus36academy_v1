// src/app/api/enrollments/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request)
    if (error || !user) return errorResponse('Unauthorized', 401)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id

    // Admins can view any user's enrollments
    if (userId !== user.id && user.role !== 'ADMIN') {
      return errorResponse('Forbidden', 403)
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            tutor: { select: { id: true, name: true, avatar: true } },
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(enrollments)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
