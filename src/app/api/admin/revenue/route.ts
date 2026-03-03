import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'

    // Calculate date ranges
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    // Get all completed payments
    const [totalRevenue, periodRevenue, pendingRevenue, refundedRevenue] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'REFUNDED' },
        _sum: { amount: true },
      }),
    ])

    // Calculate growth (compare with previous period)
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    const previousRevenue = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
      _sum: { amount: true },
    })

    const currentAmount = periodRevenue._sum.amount || 0
    const previousAmount = previousRevenue._sum.amount || 0
    const growth = previousAmount > 0 ? ((currentAmount - previousAmount) / previousAmount) * 100 : 0

    // Get daily revenue for current period
    const dailyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      _sum: { amount: true },
      orderBy: { createdAt: 'asc' },
    })

    const revenue = {
      total: totalRevenue._sum.amount || 0,
      monthly: currentAmount,
      weekly: 0, // Calculate separately if needed
      daily: 0,
      pending: pendingRevenue._sum.amount || 0,
      refunded: refundedRevenue._sum.amount || 0,
      growth: Math.round(growth * 10) / 10,
      dailyBreakdown: dailyRevenue.map(d => ({
        date: d.createdAt,
        amount: d._sum.amount || 0,
      })),
    }

    return successResponse(revenue)
  } catch (error) {
    console.error('Get revenue error:', error)
    return errorResponse('Internal server error', 500)
  }
}