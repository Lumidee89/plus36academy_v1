import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'

    // Calculate date ranges
    const now = new Date()
    const startDate = new Date()
    const lastMonthStart = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        lastMonthStart.setDate(now.getDate() - 14)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        lastMonthStart.setMonth(now.getMonth() - 2)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        lastMonthStart.setFullYear(now.getFullYear() - 2)
        break
      case 'all':
        startDate.setFullYear(2000) // Very old date to get all
        lastMonthStart.setFullYear(1999)
        break
    }

    // Get tutor's courses
    const tutorCourses = await prisma.course.findMany({
      where: { tutorId: user.id },
      select: { id: true },
    })
    const courseIds = tutorCourses.map(c => c.id)

    if (courseIds.length === 0) {
      return successResponse({
        total: 0,
        pending: 0,
        paid: 0,
        thisMonth: 0,
        lastMonth: 0,
        growth: 0,
        nextPayout: 0,
        nextPayoutDate: '',
      })
    }

    // Get all completed payments for tutor's courses
    const [totalEarnings, pendingEarnings, thisMonthEarnings, lastMonthEarnings] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          courseId: { in: courseIds },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          courseId: { in: courseIds },
          status: 'PENDING',
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          courseId: { in: courseIds },
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          courseId: { in: courseIds },
          status: 'COMPLETED',
          createdAt: {
            gte: lastMonthStart,
            lt: startDate,
          },
        },
        _sum: { amount: true },
      }),
    ])

    const total = totalEarnings._sum.amount || 0
    const pending = pendingEarnings._sum.amount || 0
    const thisMonth = thisMonthEarnings._sum.amount || 0
    const lastMonth = lastMonthEarnings._sum.amount || 0
    
    // Calculate growth percentage
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    // Calculate next payout (sum of pending payments that are eligible)
    const nextPayoutDate = new Date()
    nextPayoutDate.setDate(1) // First day of next month
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1)

    const earnings = {
      total,
      pending,
      paid: total - pending, // Assuming all non-pending are paid
      thisMonth,
      lastMonth,
      growth: Math.round(growth * 10) / 10,
      nextPayout: pending * 0.9, // Assuming 10% platform fee
      nextPayoutDate: nextPayoutDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
    }

    return successResponse(earnings)
  } catch (error) {
    console.error('Get tutor earnings error:', error)
    return errorResponse('Internal server error', 500)
  }
}