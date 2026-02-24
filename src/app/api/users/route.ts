// src/app/api/users/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const role = searchParams.get('role') || ''
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          _count: { select: { enrollments: true, taughtCourses: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return paginatedResponse(users, total, page, limit)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
