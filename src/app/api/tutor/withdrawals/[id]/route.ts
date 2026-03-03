import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // This would be a real Prisma query
    // const withdrawal = await prisma.withdrawal.findFirst({
    //   where: {
    //     id: params.id,
    //     userId: user.id,
    //   },
    // })

    // Mock response
    const withdrawal = {
      id: params.id,
      amount: 25000,
      bankDetails: {
        accountName: 'John Doe',
        accountNumber: '0123456789',
        bankName: 'GTBank',
        swiftCode: 'GTBINGLA',
      },
      status: 'completed',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      transactionReference: 'TXN' + Math.random().toString(36).toUpperCase(),
      notes: 'Withdrawal completed successfully',
    }

    if (!withdrawal) {
      return errorResponse('Withdrawal not found', 404)
    }

    return successResponse(withdrawal)
  } catch (error) {
    console.error('Get withdrawal error:', error)
    return errorResponse('Internal server error', 500)
  }
}