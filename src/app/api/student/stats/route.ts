import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // Get all enrollments for the student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: user.id,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Calculate stats
    const totalEnrolled = enrollments.length
    
    // Get in-progress courses (active and progress < 100)
    const inProgress = enrollments.filter(e => 
      e.status === 'ACTIVE' && e.progress < 100
    ).length
    
    // Get completed courses
    const completed = enrollments.filter(e => 
      e.status === 'COMPLETED' || e.progress === 100
    ).length

    // Count certificates (completed courses that have certificates)
    const certificates = completed

    // Calculate total learning hours (from progress watch time)
    const progressRecords = await prisma.progress.findMany({
      where: {
        enrollment: {
          userId: user.id,
        },
      },
      select: {
        watchTime: true,
      },
    })

    const totalSeconds = progressRecords.reduce((sum, p) => sum + (p.watchTime || 0), 0)
    const totalHours = Math.round(totalSeconds / 3600 * 10) / 10 // Round to 1 decimal

    // Get learning streak (you'll need to implement this based on daily activity)
    // For now, we'll return a placeholder
    const streak = 0

    return successResponse({
      enrolled: totalEnrolled,
      inProgress,
      completed,
      certificates,
      totalHours,
      streak,
    })
  } catch (error) {
    console.error('Get student stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}