// src/app/api/users/stats/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, getUserFromRequest } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireAuth(request)
    if (error || !user) return errorResponse('Unauthorized', 401)

    // Admin stats - comprehensive platform overview
    if (user.role === 'ADMIN') {
      const [
        totalStudents,
        totalTutors,
        totalCourses,
        publishedCourses,
        totalRevenue,
        activeEnrollments,
        completedEnrollments,
        pendingCourses,
        pendingTutors,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'TUTOR' } }),
        prisma.course.count(),
        prisma.course.count({ where: { status: 'PUBLISHED' } }),
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
        prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
        prisma.course.count({ where: { status: 'PENDING' } }),
        prisma.user.count({ 
          where: { 
            role: 'TUTOR',
            isVerified: false,
            isActive: true,
          } 
        }),
      ])

      return successResponse({
        totalStudents,
        totalTutors,
        totalCourses,
        publishedCourses,
        totalRevenue: totalRevenue._sum.amount || 0,
        activeEnrollments,
        completedEnrollments,
        pendingCourses,
        pendingTutors,
      })
    }

    // Tutor stats
    if (user.role === 'TUTOR') {
      const [
        totalCourses,
        publishedCourses,
        pendingCourses,
        totalStudents,
        totalRevenue,
        averageRating,
      ] = await Promise.all([
        prisma.course.count({ where: { tutorId: user.id } }),
        prisma.course.count({ where: { tutorId: user.id, status: 'PUBLISHED' } }),
        prisma.course.count({ where: { tutorId: user.id, status: 'PENDING' } }),
        prisma.enrollment.count({
          where: { course: { tutorId: user.id } },
        }),
        prisma.payment.aggregate({
          where: { course: { tutorId: user.id }, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.review.aggregate({
          where: { course: { tutorId: user.id } },
          _avg: { rating: true },
        }),
      ])

      // Get recent enrollments count (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentEnrollments = await prisma.enrollment.count({
        where: {
          course: { tutorId: user.id },
          createdAt: { gte: thirtyDaysAgo },
        },
      })

      return successResponse({
        totalCourses,
        publishedCourses,
        pendingCourses,
        totalStudents,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageRating: averageRating._avg.rating || 0,
        recentEnrollments,
      })
    }

    // Student stats
    if (user.role === 'STUDENT') {
      const [
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        totalSpent,
        certificatesEarned,
      ] = await Promise.all([
        prisma.enrollment.count({ where: { userId: user.id } }),
        prisma.enrollment.count({ where: { userId: user.id, status: 'COMPLETED' } }),
        prisma.enrollment.count({ 
          where: { 
            userId: user.id, 
            status: 'ACTIVE',
            progress: { gt: 0, lt: 100 }
          } 
        }),
        prisma.payment.aggregate({
          where: { userId: user.id, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.enrollment.count({ 
          where: { 
            userId: user.id, 
            status: 'COMPLETED',
            completedAt: { not: null }
          } 
        }),
      ])

      // Get courses by category
      const categoryDistribution = await prisma.enrollment.groupBy({
        by: ['courseId'],
        where: { userId: user.id },
        _count: true,
      })

      return successResponse({
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        totalSpent: totalSpent._sum.amount || 0,
        certificatesEarned,
        completionRate: totalEnrolled > 0 
          ? Math.round((completedCourses / totalEnrolled) * 100) 
          : 0,
      })
    }

    // Fallback for any other roles
    return successResponse({})
    
  } catch (error) {
    console.error('Get stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}