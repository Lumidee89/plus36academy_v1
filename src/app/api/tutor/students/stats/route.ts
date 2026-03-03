import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // Get tutor's courses
    const tutorCourses = await prisma.course.findMany({
      where: { tutorId: user.id },
      select: { id: true },
    })
    const courseIds = tutorCourses.map(c => c.id)

    // Get stats
    const [
      totalStudents,
      activeStudents,
      completedStudents,
      suspendedStudents,
      enrollmentsWithProgress,
    ] = await Promise.all([
      prisma.enrollment.count({
        where: { courseId: { in: courseIds } },
      }),
      prisma.enrollment.count({
        where: { 
          courseId: { in: courseIds },
          status: 'ACTIVE',
        },
      }),
      prisma.enrollment.count({
        where: { 
          courseId: { in: courseIds },
          status: 'COMPLETED',
        },
      }),
      prisma.enrollment.count({
        where: { 
          courseId: { in: courseIds },
          status: 'SUSPENDED',
        },
      }),
      prisma.enrollment.findMany({
        where: { courseId: { in: courseIds } },
        select: {
          progresses: {
            select: {
              completed: true,
            },
          },
          course: {
            select: {
              modules: {
                select: {
                  materials: {
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
      }),
    ])

    // Calculate average progress
    let totalProgress = 0
    let enrollmentsWithData = 0

    enrollmentsWithProgress.forEach(enrollment => {
      const totalMaterials = enrollment.course.modules.reduce(
        (sum, module) => sum + module.materials.length, 0
      )
      const completedMaterials = enrollment.progresses.filter(p => p.completed).length
      
      if (totalMaterials > 0) {
        const progress = (completedMaterials / totalMaterials) * 100
        totalProgress += progress
        enrollmentsWithData++
      }
    })

    const averageProgress = enrollmentsWithData > 0 
      ? Math.round(totalProgress / enrollmentsWithData) 
      : 0

    const stats = {
      totalStudents,
      activeStudents,
      completedStudents,
      suspendedStudents,
      averageProgress,
    }

    return successResponse(stats)
  } catch (error) {
    console.error('Get tutor students stats error:', error)
    return errorResponse('Internal server error', 500)
  }
}