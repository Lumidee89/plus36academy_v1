import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    // Must be a logged-in user
    const { error, user } = await requireAuth(request)
    if (error || !user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    console.log('test-verify body:', body)

    const { paymentId, reference, trxref } = body
    const ref = reference || trxref

    if (!paymentId && !ref) {
      return errorResponse('paymentId or reference is required', 400)
    }

    // Find payment
    let payment = null

    if (paymentId) {
      payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    }
    if (!payment && ref) {
      payment = await prisma.payment.findFirst({
        where: { OR: [{ id: ref }, { providerRef: ref }] },
      })
    }

    if (!payment) {
      console.error('test-verify: payment not found', { paymentId, ref })
      return errorResponse('Payment not found', 404)
    }

    // Security: ensure this payment belongs to the requesting user
    if (payment.userId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    // Already completed — return success (idempotent)
    if (payment.status === 'COMPLETED') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      })
      return successResponse({ payment, enrollment, alreadyCompleted: true }, 'Already enrolled')
    }

    // Mark payment complete
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        providerRef: ref || paymentId,
      },
    })

    // Create / reactivate enrollment
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: payment.userId, courseId: payment.courseId },
      },
      update: { status: 'ACTIVE', updatedAt: new Date() },
      create: {
        userId: payment.userId,
        courseId: payment.courseId,
        status: 'ACTIVE',
        progress: 0,
      },
    })

    console.log('test-verify: enrollment created for user', payment.userId, 'course', payment.courseId)

    return successResponse(
      { payment: updatedPayment, enrollment },
      'Payment verified and enrollment completed successfully'
    )
  } catch (error) {
    console.error('test-verify error:', error)
    return errorResponse('Internal server error: ' + (error as Error).message, 500)
  }
}
