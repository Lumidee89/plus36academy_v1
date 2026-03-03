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

    const materialId = params.id

    // Get material details with course and module info
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        module: {
          include: {
            course: {
              include: {
                tutor: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!material) {
      return errorResponse('Material not found', 404)
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: material.module.courseId,
      },
    })

    if (!enrollment) {
      return errorResponse('You are not enrolled in this course', 403)
    }

    // Get or create progress for this material
    let progress = await prisma.progress.findUnique({
      where: {
        enrollmentId_materialId: {
          enrollmentId: enrollment.id,
          materialId: material.id,
        },
      },
    })

    // If no progress exists, create one
    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          enrollmentId: enrollment.id,
          materialId: material.id,
          completed: false,
          watchTime: 0,
        },
      })
    }

    // Get next and previous materials in the same module/course
    const allMaterials = await prisma.material.findMany({
      where: {
        module: {
          courseId: material.module.courseId,
        },
      },
      orderBy: [
        { module: { order: 'asc' } },
        { order: 'asc' },
      ],
      select: {
        id: true,
        title: true,
        module: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    const currentIndex = allMaterials.findIndex(m => m.id === materialId)
    const prevMaterial = currentIndex > 0 ? allMaterials[currentIndex - 1] : null
    const nextMaterial = currentIndex < allMaterials.length - 1 ? allMaterials[currentIndex + 1] : null

    // Debug log to check the video URL
    console.log('Material from DB:', {
      id: material.id,
      type: material.type,
      videoUrl: material.videoUrl,
      fileUrl: material.fileUrl,
    })

    // For video types, ensure we have a URL
    let videoUrl = material.videoUrl
    if (material.type === 'VIDEO' && !videoUrl && material.fileUrl) {
      // Fallback to fileUrl if videoUrl is empty
      videoUrl = material.fileUrl
      console.log('Using fileUrl as fallback for video:', videoUrl)
    }

    return successResponse({
      material: {
        id: material.id,
        title: material.title,
        description: material.description,
        type: material.type,
        content: material.content, // For TEXT type
        fileUrl: material.fileUrl, // For PDF/IMAGE types
        videoUrl: videoUrl, // For VIDEO/VIDEO_LINK types - using fallback if needed
        duration: material.duration,
        isFree: material.isFree,
      },
      module: {
        id: material.module.id,
        title: material.module.title,
        courseId: material.module.courseId,
      },
      course: {
        id: material.module.course.id,
        title: material.module.course.title,
        tutor: material.module.course.tutor,
      },
      progress: {
        completed: progress.completed,
        watchTime: progress.watchTime,
      },
      navigation: {
        prev: prevMaterial,
        next: nextMaterial,
      },
    })
  } catch (error) {
    console.error('Get material error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireRole(request, ['STUDENT'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const materialId = params.id
    const body = await request.json()
    const { action, watchTime } = body // action: 'complete', 'update_watch_time'

    // Get material to verify course
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: {
        module: {
          select: {
            courseId: true,
          },
        },
      },
    })

    if (!material) {
      return errorResponse('Material not found', 404)
    }

    // Find enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: material.module.courseId,
      },
    })

    if (!enrollment) {
      return errorResponse('You are not enrolled in this course', 403)
    }

    // Update progress based on action
    let updatedProgress
    if (action === 'complete') {
      updatedProgress = await prisma.progress.upsert({
        where: {
          enrollmentId_materialId: {
            enrollmentId: enrollment.id,
            materialId: material.id,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          enrollmentId: enrollment.id,
          materialId: material.id,
          completed: true,
          completedAt: new Date(),
        },
      })
    } else if (action === 'update_watch_time' && watchTime !== undefined) {
      updatedProgress = await prisma.progress.upsert({
        where: {
          enrollmentId_materialId: {
            enrollmentId: enrollment.id,
            materialId: material.id,
          },
        },
        update: {
          watchTime,
        },
        create: {
          enrollmentId: enrollment.id,
          materialId: material.id,
          watchTime,
          completed: false,
        },
      })
    }

    return successResponse({ progress: updatedProgress })
  } catch (error) {
    console.error('Update material progress error:', error)
    return errorResponse('Internal server error', 500)
  }
}