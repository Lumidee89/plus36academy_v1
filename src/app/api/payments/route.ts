import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

const initiatePaymentSchema = z.object({
  courseId: z.string(),
  provider: z.enum(['paystack', 'stripe']).default('paystack'),
})

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request)
    if (error || !user) return errorResponse('Unauthorized', 401)

    const body = await request.json()
    const validation = initiatePaymentSchema.safeParse(body)
    if (!validation.success) return errorResponse(validation.error.errors[0].message)

    const { courseId, provider } = validation.data

    const course = await prisma.course.findUnique({
      where: { id: courseId, status: 'PUBLISHED' },
    })
    if (!course) return errorResponse('Course not found', 404)

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    })
    if (existingEnrollment) return errorResponse('Already enrolled in this course', 409)

    // If free course, enroll directly
    if (course.price === 0) {
      const [enrollment] = await prisma.$transaction([
        prisma.enrollment.create({
          data: { userId: user.id, courseId },
        }),
        prisma.payment.create({
          data: {
            userId: user.id,
            courseId,
            amount: 0,
            currency: course.currency,
            status: 'COMPLETED',
            provider: 'free',
          },
        }),
      ])
      return successResponse({ enrollment, isFree: true }, 'Enrolled successfully')
    }

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        courseId,
        amount: course.price,
        currency: course.currency,
        status: 'PENDING',
        provider,
      },
    })

    // ==========================================
    // PAYSTACK INTEGRATION
    // ==========================================
    // const Paystack = require('paystack-api')(process.env.PAYSTACK_SECRET_KEY)
    // const paystackResponse = await Paystack.transaction.initialize({
    //   email: user.email,
    //   amount: course.price * 100, // Paystack uses kobo
    //   currency: course.currency,
    //   reference: payment.id,
    //   metadata: { courseId, userId: user.id, paymentId: payment.id },
    //   callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
    // })
    // return successResponse({ paymentId: payment.id, authorizationUrl: paystackResponse.data.authorization_url })

    // ==========================================
    // STRIPE INTEGRATION
    // ==========================================
    // import Stripe from 'stripe'
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: course.currency.toLowerCase(),
    //       product_data: { name: course.title, images: [course.thumbnail || ''] },
    //       unit_amount: Math.round(course.price * 100),
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}`,
    //   metadata: { courseId, userId: user.id, paymentId: payment.id },
    // })
    // return successResponse({ paymentId: payment.id, checkoutUrl: session.url })

    // Return everything the frontend (PaystackPop.setup) needs
    return successResponse({
      paymentId: payment.id,
      amount: course.price,
      currency: course.currency,
      email: user.email,
      metadata: {
        paymentId: payment.id,
        courseId,
        userId: user.id,
      },
    })
  } catch (error) {
    console.error('Payment error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request)
    if (error || !user) return errorResponse('Unauthorized', 401)

    const payments = await prisma.payment.findMany({
      where: user.role === 'ADMIN' ? {} : { userId: user.id },
      include: {
        course: { select: { id: true, title: true, thumbnail: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(payments)
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
