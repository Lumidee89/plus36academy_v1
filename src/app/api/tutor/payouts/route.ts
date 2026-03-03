import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // In a real application, you would have a Payout model
    // For now, we'll generate mock payouts from payment data
    
    // Get tutor's courses
    const tutorCourses = await prisma.course.findMany({
      where: { tutorId: user.id },
      select: { id: true },
    })
    const courseIds = tutorCourses.map(c => c.id)

    if (courseIds.length === 0) {
      return successResponse([])
    }

    // Group payments by month to simulate payouts
    const payments = await prisma.payment.findMany({
      where: {
        courseId: { in: courseIds },
        status: 'COMPLETED',
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Group by month
    const payoutsByMonth = payments.reduce((acc: any, payment) => {
      const monthKey = payment.createdAt.toISOString().slice(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          count: 0,
        }
      }
      acc[monthKey].total += payment.amount
      acc[monthKey].count++
      return acc
    }, {})

    // Format payouts
    const payouts = Object.entries(payoutsByMonth)
      .map(([month, data]: [string, any]) => {
        const [year, monthNum] = month.split('-')
        const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          amount: data.total * 0.9, // Assuming 10% platform fee
          method: 'Bank Transfer',
          status: date < new Date() ? 'completed' : 'pending',
          transactions: data.count,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return successResponse(payouts)
  } catch (error) {
    console.error('Get payouts error:', error)
    return errorResponse('Internal server error', 500)
  }
}