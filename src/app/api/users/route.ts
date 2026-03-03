import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    // Only allow admins to view all users
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || '' // STUDENT, TUTOR, ADMIN
    const status = searchParams.get('status') || '' // ACTIVE, INACTIVE, PENDING
    const isVerified = searchParams.get('isVerified') // true/false

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.role = role
    }

    if (status === 'ACTIVE') {
      where.isActive = true
    } else if (status === 'INACTIVE') {
      where.isActive = false
    } else if (status === 'PENDING') {
      where.isVerified = false
      where.isActive = true
    }

    if (isVerified === 'true') {
      where.isVerified = true
    } else if (isVerified === 'false') {
      where.isVerified = false
    }

    console.log('Users query where:', where)

    // Fetch users with counts
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          phone: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Include counts for relevant relations
          _count: {
            select: {
              taughtCourses: true,
              enrollments: true,
              payments: true,
              reviews: true,
            }
          }
        },
      }),
      prisma.user.count({ where }),
    ])

    // Add additional computed fields
    const usersWithStats = users.map(user => ({
      ...user,
      totalCourses: user._count?.taughtCourses || 0,
      totalEnrollments: user._count?.enrollments || 0,
      totalPayments: user._count?.payments || 0,
      totalReviews: user._count?.reviews || 0,
    }))

    return paginatedResponse(usersWithStats, total, page, limit)
  } catch (error) {
    console.error('Get users error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Only allow admins to create users
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const { email, name, password, role, phone, bio, isVerified, isActive } = body

    if (!email || !name || !password) {
      return errorResponse('Missing required fields', 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return errorResponse('User with this email already exists', 400)
    }

    // Hash password
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'STUDENT',
        phone,
        bio,
        isVerified: isVerified || false,
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    })

    return successResponse(newUser, 'User created successfully', 201)
  } catch (error) {
    console.error('Create user error:', error)
    return errorResponse('Internal server error', 500)
  }
}