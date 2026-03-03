import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify that the user is a TUTOR or ADMIN
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) {
      return errorResponse(error || 'Unauthorized access', 403)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'published', 'draft', or 'all'

    // 2. Build the query filter
    const where: any = {}

    // Security check: Tutors should only see their own courses
    if (user.role === 'TUTOR') {
      where.tutorId = user.id
    }

    // Apply status filter if provided (and not 'all')
    if (status && status !== 'all') {
      where.status = status.toUpperCase() 
    }

    // 3. Fetch courses from Database
    const courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            enrollments: true, // Useful if you want to show student counts
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 4. Return the data using your successResponse helper
    return successResponse(courses, 'Courses fetched successfully')
  } catch (error) {
    console.error('[COURSES_GET_ERROR]:', error)
    return errorResponse('Internal server error', 500)
  }
}