// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import type { User } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId, isActive: true },
    })

    return user as User | null
  } catch {
    return null
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return { error: 'Unauthorized', user: null }
  }
  return { error: null, user }
}

export async function requireRole(request: NextRequest, roles: string[]) {
  const { error, user } = await requireAuth(request)
  if (error || !user) return { error: error || 'Unauthorized', user: null }
  if (!roles.includes(user.role)) return { error: 'Forbidden', user: null }
  return { error: null, user }
}
