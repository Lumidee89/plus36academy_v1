// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400)
    }

    const { email, password } = validation.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    if (!user.isActive) {
      return errorResponse('Your account has been suspended', 403)
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return errorResponse('Invalid email or password', 401)
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const { password: _, ...userWithoutPassword } = user

    return successResponse(
      { user: userWithoutPassword, token },
      'Login successful'
    )
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}
