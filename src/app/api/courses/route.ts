import { NextRequest } from 'next/server'
import { z } from 'zod'
import { CourseStatus } from '@prisma/client' 
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
    const status = searchParams.get('status') || ''
    const tutorId = searchParams.get('tutorId') || ''

    // Get the authenticated user
    const user = await getUserFromRequest(request)

    const where: Record<string, unknown> = {}

    // If user is a tutor, only show their courses
    if (user?.role === 'TUTOR') {
      where.tutorId = user.id
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
      ]
    }

    if (category) where.categoryId = category
    if (level) where.level = level

    console.log('Courses query where:', where)

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

    console.log(`Found ${courses.length} courses`)

    // Safe JSON parser function
    const safeJsonParse = (value: any): any[] => {
      if (!value) return []
      if (Array.isArray(value)) return value
      if (typeof value === 'string') {
        // Check if it's an empty string or looks like a simple string
        if (value === '' || value === '[]') return []
        try {
          return JSON.parse(value)
        } catch {
          // If it's not valid JSON, treat it as a single string item
          return [value]
        }
      }
      return []
    }

    const coursesWithRating = courses.map((course) => ({
      ...course,
      avgRating:
        course.reviews.length > 0
          ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
          : 0,
      reviews: undefined,
      // Safely parse JSON fields
      requirements: safeJsonParse(course.requirements),
      objectives: safeJsonParse(course.objectives),
      tags: safeJsonParse(course.tags),
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

    const categoryId = data.categoryId && data.categoryId.trim() !== '' 
      ? data.categoryId 
      : null
    
    const status = user.role === 'ADMIN' 
      ? 'PUBLISHED' 
      : 'PENDING'
    
      const courseData = {
      title: data.title,
      description: data.description,
      price: data.price,
      currency: data.currency,
      level: data.level,
      language: data.language,
      requirements: data.requirements?.length ? JSON.stringify(data.requirements) : '[]',
      objectives: data.objectives?.length ? JSON.stringify(data.objectives) : '[]',
      tags: data.tags?.length ? JSON.stringify(data.tags) : '[]',
      categoryId: categoryId,
      isFreemium: data.isFreemium,
      thumbnail: data.thumbnail,
      slug,
      status: status as CourseStatus,
      tutorId: user.id,
    }

    const course = await prisma.course.create({
      data: courseData,
    })

    // Parse back for response
    const formattedCourse = {
      ...course,
      requirements: course.requirements ? JSON.parse(course.requirements as string) : [],
      objectives: course.objectives ? JSON.parse(course.objectives as string) : [],
      tags: course.tags ? JSON.parse(course.tags as string) : [],
    }

    return successResponse(formattedCourse, 'Course created successfully. It will be reviewed by an admin.', 201)
  } catch (error) {
    console.error('Create course error:', error)
    return errorResponse('Internal server error', 500)
  }
}