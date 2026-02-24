// src/app/api/users/stats/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getUserFromRequest } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request)
    if (error || !user) return errorResponse('Unauthorized', 401)

    if (user.role === 'ADMIN') {
      const [
        totalStudents,
        totalTutors,
        totalCourses,
        totalRevenue,
        activeEnrollments,
        completedEnrollments,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'TUTOR' } }),
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
        prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      ])

      return successResponse({
        totalStudents,
        totalTutors,
        totalCourses,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeEnrollments,
        completedEnrollments,
      })
    }

    if (user.role === 'TUTOR') {
      const [
        totalCourses,
        publishedCourses,
        totalStudents,
        totalRevenue,
      ] = await Promise.all([
        prisma.course.count({ where: { tutorId: user.id } }),
        prisma.course.count({ where: { tutorId: user.id, status: 'PUBLISHED' } }),
        prisma.enrollment.count({
          where: { course: { tutorId: user.id } },
        }),
        prisma.payment.aggregate({
          where: { course: { tutorId: user.id }, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
      ])

      return successResponse({
        totalCourses,
        publishedCourses,
        totalStudents,
        totalRevenue: totalRevenue._sum.amount || 0,
      })
    }

    // Student stats
    const [enrolled, completed, inProgress] = await Promise.all([
      prisma.enrollment.count({ where: { userId: user.id } }),
      prisma.enrollment.count({ where: { userId: user.id, status: 'COMPLETED' } }),
      prisma.enrollment.count({ where: { userId: user.id, status: 'ACTIVE', progress: { gt: 0 } } }),
    ])

    return successResponse({ enrolled, completed, inProgress })
  } catch {
    return errorResponse('Internal server error', 500)
  }
}
