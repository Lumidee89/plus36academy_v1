import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

// In a real application, you would have a Withdrawal model in your schema
// For now, we'll simulate with a mock database

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // This would be a real Prisma query with a Withdrawal model
    // const withdrawals = await prisma.withdrawal.findMany({
    //   where: { userId: user.id },
    //   orderBy: { createdAt: 'desc' },
    // })

    // Mock response for demonstration
    const mockWithdrawals = [
      {
        id: 'WD-' + (Date.now() - 7 * 24 * 60 * 60 * 1000),
        amount: 25000,
        bankDetails: {
          accountName: 'John Doe',
          accountNumber: '0123456789',
          bankName: 'GTBank',
        },
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        processedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
      },
      {
        id: 'WD-' + (Date.now() - 3 * 24 * 60 * 60 * 1000),
        amount: 15000,
        bankDetails: {
          accountName: 'John Doe',
          accountNumber: '0123456789',
          bankName: 'GTBank',
        },
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
      },
    ]

    return successResponse(mockWithdrawals)
  } catch (error) {
    console.error('Get withdrawals error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    const { amount, bankDetails, notes } = body

    // Validate amount
    if (!amount || amount < 1000) {
      return errorResponse('Minimum withdrawal amount is ₦1,000', 400)
    }

    // Validate bank details
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      return errorResponse('Please provide complete bank details', 400)
    }

    // Check if user has sufficient balance
    // This would require calculating from payments
    const tutorCourses = await prisma.course.findMany({
      where: { tutorId: user.id },
      select: { id: true },
    })
    const courseIds = tutorCourses.map(c => c.id)

    const totalEarnings = await prisma.payment.aggregate({
      where: {
        courseId: { in: courseIds },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    })

    const pendingWithdrawals = 0 // This would be calculated from a Withdrawal model
    const availableBalance = (totalEarnings._sum.amount || 0) - pendingWithdrawals

    if (amount > availableBalance) {
      return errorResponse('Insufficient balance', 400)
    }

    // Create withdrawal request
    // This would be a real Prisma create with a Withdrawal model
    // const withdrawal = await prisma.withdrawal.create({
    //   data: {
    //     userId: user.id,
    //     amount,
    //     bankDetails,
    //     notes,
    //     status: 'PENDING',
    //   },
    // })

    // Mock response
    const withdrawal = {
      id: 'WD-' + Date.now(),
      amount,
      bankDetails,
      notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    // In a real app, you'd also send an email notification to admin
    // await sendAdminNotification('new-withdrawal', { user, withdrawal })

    return successResponse(withdrawal, 'Withdrawal request submitted successfully', 201)
  } catch (error) {
    console.error('Create withdrawal error:', error)
    return errorResponse('Internal server error', 500)
  }
}