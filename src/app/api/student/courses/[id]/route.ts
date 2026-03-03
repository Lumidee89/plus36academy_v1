import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const courseId = params.id

    // First check if the student is enrolled in this course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    })

    if (!enrollment) {
      return errorResponse('You are not enrolled in this course', 403)
    }

    // Get course details with modules and materials
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            materials: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                duration: true,
                isFree: true,
                order: true,
                // Don't send fileUrl or videoUrl yet until student accesses the material
              },
            },
          },
        },
      },
    })

    if (!course) {
      return errorResponse('Course not found', 404)
    }

    // Get progress for each material
    const progresses = await prisma.progress.findMany({
      where: {
        enrollmentId: enrollment.id,
      },
      select: {
        materialId: true,
        completed: true,
      },
    })

    // Create a map of completed materials
    const completedMap = new Map(
      progresses.map(p => [p.materialId, p.completed])
    )

    // Calculate overall progress
    let totalMaterials = 0
    let completedMaterials = 0

    // Add completion status to materials and count totals
    const modulesWithProgress = course.modules.map(module => ({
      ...module,
      materials: module.materials.map(material => {
        totalMaterials++
        const completed = completedMap.get(material.id) || false
        if (completed) completedMaterials++
        return {
          ...material,
          completed,
        }
      }),
    }))

    const progress = totalMaterials > 0 
      ? Math.round((completedMaterials / totalMaterials) * 100) 
      : 0

    return successResponse({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        level: course.level,
        tutor: course.tutor,
      },
      modules: modulesWithProgress,
      progress,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.createdAt,
      },
    })
  } catch (error) {
    console.error('Get student course error:', error)
    return errorResponse('Internal server error', 500)
  }
}