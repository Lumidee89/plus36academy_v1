// src/app/api/courses/route.ts
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole, getUserFromRequest } from '@/lib/auth'
import { successResponse, errorResponse, paginatedResponse, getPaginationParams } from '@/lib/api'

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  price: z.number().min(0),
  currency: z.string().default('NGN'),
  level: z.string().default('Beginner'),
  language: z.string().default('English'),
  requirements: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  isFreemium: z.boolean().default(false),
  thumbnail: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const level = searchParams.get('level') || ''
    const status = searchParams.get('status') || 'PUBLISHED'
    const tutorId = searchParams.get('tutorId') || ''

    // Check if requesting user is tutor/admin (can see their own drafts)
    const user = await getUserFromRequest(request)

    const where: Record<string, unknown> = {}

    if (user?.role === 'TUTOR') {
      where.tutorId = user.id
      if (status) where.status = status
    } else if (user?.role === 'ADMIN') {
      if (status) where.status = status
      if (tutorId) where.tutorId = tutorId
    } else {
      where.status = 'PUBLISHED'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ]
    }

    if (category) where.categoryId = category
    if (level) where.level = level

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tutor: { select: { id: true, name: true, avatar: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { enrollments: true, reviews: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.course.count({ where }),
    ])

    const coursesWithRating = courses.map((course) => ({
      ...course,
      avgRating:
        course.reviews.length > 0
          ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
          : 0,
      reviews: undefined,
    }))

    return paginatedResponse(coursesWithRating, total, page, limit)
  } catch (error) {
    console.error('Get courses error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const validation = createCourseSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse(validation.error.errors[0].message, 400)
    }

    const data = validation.data
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now()

    const course = await prisma.course.create({
      data: {
        ...data,
        slug,
        tutorId: user.id,
      },
    })

    return successResponse(course, 'Course created successfully', 201)
  } catch (error) {
    console.error('Create course error:', error)
    return errorResponse('Internal server error', 500)
  }
}
