// src/app/api/auth/me/route.ts
import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return errorResponse('Unauthorized', 401)

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            taughtCourses: true,
          },
        },
      },
    })

    return successResponse(fullUser)
  } catch (error) {
    console.error('Me error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { name, bio, phone, avatar } = body

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name, bio, phone, avatar },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        isVerified: true,
        updatedAt: true,
      },
    })

    return successResponse(updated, 'Profile updated successfully')
  } catch (error) {
    console.error('Update profile error:', error)
    return errorResponse('Internal server error', 500)
  }
}
