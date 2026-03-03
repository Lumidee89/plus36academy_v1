import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // Get tutor's courses with payment data
    const courses = await prisma.course.findMany({
      where: { tutorId: user.id },
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
            createdAt: true,
          },
        },
      },
      orderBy: {
        payments: {
          _count: 'desc',
        },
      },
    })

    // Calculate earnings for each course
    const courseEarnings = courses.map(course => {
      const revenue = course.payments.reduce((sum, p) => sum + p.amount, 0)
      const sales = course.payments.length
      
      // Calculate growth (mock for now - would need historical data)
      const growth = Math.floor(Math.random() * 30) - 5

      return {
        id: course.id,
        title: course.title,
        price: course.price,
        currency: course.currency,
        enrollments: course._count.enrollments,
        sales,
        revenue,
        growth,
      }
    })

    // Sort by revenue
    courseEarnings.sort((a, b) => b.revenue - a.revenue)

    return successResponse(courseEarnings)
  } catch (error) {
    console.error('Get course earnings error:', error)
    return errorResponse('Internal server error', 500)
  }
}