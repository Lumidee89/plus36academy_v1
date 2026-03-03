import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { generateReceiptPDF } from '@/lib/receipt-generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) {
      return new Response(JSON.stringify({ error: error || 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const paymentId = params.id

    // Get payment details with course and student info
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
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
            tutor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return new Response(JSON.stringify({ error: 'Payment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify that the payment belongs to the authenticated user
    if (payment.userId !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Only allow receipt download for completed payments
    if (payment.status !== 'COMPLETED') {
      return new Response(JSON.stringify({ error: 'Receipt only available for completed payments' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF({
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      date: payment.createdAt,
      provider: payment.provider,
      providerRef: payment.providerRef || undefined,
      courseTitle: payment.course.title,
      tutorName: payment.course.tutor.name,
      studentName: payment.user.name,
      studentEmail: payment.user.email,
    })

    // Return PDF
    // convert Node Buffer to Uint8Array so Response accepts it as BodyInit
    const body = new Uint8Array(pdfBuffer as any)
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${payment.id.slice(0, 8)}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    console.error('Generate receipt error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}