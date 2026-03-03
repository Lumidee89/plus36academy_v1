import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

// ── Shared helper ─────────────────────────────────────────────────────────────
async function completePayment(paymentId: string, providerRef?: string) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'COMPLETED',
      ...(providerRef ? { providerRef } : {}),
    },
  })

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

  return { payment, enrollment }
}

// ── POST — called by the frontend after Paystack callback ─────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Verify POST body:', body)

    const { reference, trxref, paymentId } = body
    const ref = reference || trxref

    if (!paymentId && !ref) {
      return errorResponse('reference or paymentId is required', 400)
    }

    // Find the payment record
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
      console.error('Payment not found:', { paymentId, ref })
      return errorResponse('Payment not found', 404)
    }

    // Already completed - idempotent
    if (payment.status === 'COMPLETED') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
      })
      return successResponse({ payment, enrollment, alreadyCompleted: true })
    }

    const result = await completePayment(payment.id, ref || paymentId)

    return successResponse(
      { ...result, message: 'Payment verified and enrollment completed' },
      'Success'
    )
  } catch (error) {
    console.error('Verify POST error:', error)
    return errorResponse('Internal server error: ' + (error as Error).message, 500)
  }
}

// ── GET — check payment status ────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    const paymentId = searchParams.get('paymentId')

    if (!reference && !paymentId) {
      return errorResponse('reference or paymentId is required', 400)
    }

    let payment = null

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          course: { select: { id: true, title: true } },
          user: { select: { name: true, email: true } },
        },
      })
    }
    if (!payment && reference) {
      payment = await prisma.payment.findFirst({
        where: { OR: [{ id: reference }, { providerRef: reference }] },
        include: {
          course: { select: { id: true, title: true } },
          user: { select: { name: true, email: true } },
        },
      })
    }

    if (!payment) return errorResponse('Payment not found', 404)

    return successResponse({ status: payment.status, payment })
  } catch (error) {
    console.error('Verify GET error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// ── PUT — Paystack server-side webhook ────────────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.event === 'charge.success') {
      const { reference, metadata } = body.data
      const paymentId = metadata?.paymentId

      let payment = paymentId
        ? await prisma.payment.findUnique({ where: { id: paymentId } })
        : await prisma.payment.findFirst({ where: { providerRef: reference } })

      if (!payment) return errorResponse('Payment not found', 404)
      await completePayment(payment.id, reference)
    }

    return successResponse(null, 'Webhook received')
  } catch (error) {
    console.error('Webhook error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}
