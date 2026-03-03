import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request)
    if (error || !user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400)
    }

    if (newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters long', 400)
    }

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!userWithPassword) {
      return errorResponse('User not found', 404)
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userWithPassword.password)
    if (!isValid) {
      return errorResponse('Current password is incorrect', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return successResponse(null, 'Password changed successfully')
  } catch (error) {
    console.error('Change password error:', error)
    return errorResponse('Internal server error', 500)
  }
}