import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export const dynamic = 'force-dynamic' // Add this line
export const revalidate = 0 // Add this line

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // Get revenue grouped by course
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        _count: {
          select: {
            enrollments: true,
            payments: true,
          },
        },
        payments: {
          where: { status: 'COMPLETED' },
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        payments: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    const revenueByCourse = courses.map(course => {
      const revenue = course.payments.reduce((sum, p) => sum + p.amount, 0)
      const enrollments = course._count.enrollments
      
      // Calculate growth (mock for now - you'd need historical data)
      const growth = Math.floor(Math.random() * 30) - 5

      return {
        id: course.id,
        title: course.title,
        revenue,
        enrollments,
        price: course.price,
        currency: course.currency,
        growth,
      }
    })

    return successResponse(revenueByCourse)
  } catch (error) {
    console.error('Get revenue by course error:', error)
    return errorResponse('Internal server error', 500)
  }
}