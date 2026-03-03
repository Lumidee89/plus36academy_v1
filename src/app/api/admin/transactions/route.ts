import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, getPaginationParams } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)
    const status = searchParams.get('status')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [transactions, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ])

    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      student: tx.user.name,
      studentEmail: tx.user.email,
      course: tx.course.title,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status.toLowerCase(),
      date: tx.createdAt,
      provider: tx.provider,
      providerRef: tx.providerRef,
    }))

    return successResponse(formattedTransactions)
  } catch (error) {
    console.error('Get transactions error:', error)
    return errorResponse('Internal server error', 500)
  }
}