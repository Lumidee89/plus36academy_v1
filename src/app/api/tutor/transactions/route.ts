import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, getPaginationParams } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = getPaginationParams(searchParams)

    // Get tutor's courses
    const tutorCourses = await prisma.course.findMany({
      where: { tutorId: user.id },
      select: { id: true },
    })
    const courseIds = tutorCourses.map(c => c.id)

    if (courseIds.length === 0) {
      return successResponse([])
    }

    // Get payments for tutor's courses
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          courseId: { in: courseIds },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.payment.count({
        where: {
          courseId: { in: courseIds },
        },
      }),
    ])

    const transactions = payments.map(payment => ({
      id: payment.id,
      date: payment.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: payment.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      course: payment.course.title,
      student: payment.user.name,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status.toLowerCase(),
    }))

    return successResponse(transactions)
  } catch (error) {
    console.error('Get tutor transactions error:', error)
    return errorResponse('Internal server error', 500)
  }
}