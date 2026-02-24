// src/app/api/payments/verify/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference') || searchParams.get('paymentId')

    if (!reference) return errorResponse('Reference is required')

    const payment = await prisma.payment.findFirst({
      where: { OR: [{ id: reference }, { providerRef: reference }] },
    })

    if (!payment) return errorResponse('Payment not found', 404)

    return successResponse({ status: payment.status, payment })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}

// Webhook - called by payment providers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // ==========================================
    // PAYSTACK WEBHOOK
    // ==========================================
    // const crypto = require('crypto')
    // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    //   .update(JSON.stringify(body)).digest('hex')
    // if (hash !== request.headers.get('x-paystack-signature')) {
    //   return errorResponse('Invalid signature', 401)
    // }
    //
    // if (body.event === 'charge.success') {
    //   const { reference, metadata } = body.data
    //   await handleSuccessfulPayment(metadata.paymentId, reference)
    // }

    // ==========================================
    // STRIPE WEBHOOK
    // ==========================================
    // import Stripe from 'stripe'
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const sig = request.headers.get('stripe-signature')!
    // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    //
    // if (event.type === 'checkout.session.completed') {
    //   const session = event.data.object as Stripe.Checkout.Session
    //   await handleSuccessfulPayment(session.metadata!.paymentId, session.payment_intent as string)
    // }

    // TEST mode - manually complete payment
    const { paymentId } = body
    if (paymentId) {
      await handleSuccessfulPayment(paymentId, `test_${Date.now()}`)
      return successResponse(null, 'Payment completed (test mode)')
    }

    return successResponse(null, 'Webhook received')
  } catch (error) {
    console.error('Webhook error:', error)
    return errorResponse('Webhook processing failed', 500)
  }
}

async function handleSuccessfulPayment(paymentId: string, providerRef: string) {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'COMPLETED', providerRef },
  })

  // Create enrollment
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: payment.userId, courseId: payment.courseId } },
    create: { userId: payment.userId, courseId: payment.courseId },
    update: { status: 'ACTIVE' },
  })
}
