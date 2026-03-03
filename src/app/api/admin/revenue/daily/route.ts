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

    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by day
    const dailyRevenue = payments.reduce((acc: any, payment) => {
      const date = payment.createdAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += payment.amount
      return acc
    }, {})

    // Format for chart
    const days = Object.keys(dailyRevenue).sort()
    const chartData = days.map(date => ({
      label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      date,
      amount: dailyRevenue[date],
    }))

    return successResponse(chartData)
  } catch (error) {
    console.error('Get daily revenue error:', error)
    return errorResponse('Internal server error', 500)
  }
}