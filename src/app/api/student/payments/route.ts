import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Get payments for the student
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          userId: user.id,
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              tutor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.payment.count({
        where: {
          userId: user.id,
        },
      }),
    ])

    // Calculate summary stats
    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0)
    const completedPayments = payments.filter(p => p.status === 'COMPLETED').length
    const pendingPayments = payments.filter(p => p.status === 'PENDING').length

    return successResponse({
      payments,
      summary: {
        totalSpent,
        totalTransactions: total,
        completedPayments,
        pendingPayments,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get student payments error:', error)
    return errorResponse('Internal server error', 500)
  }
}