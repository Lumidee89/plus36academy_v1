import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

const materialSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  type: z.enum(['PDF', 'IMAGE', 'TEXT', 'VIDEO', 'VIDEO_LINK']),
  fileUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  fileSize: z.number().optional().nullable(),
  mimeType: z.string().optional().nullable(),
  order: z.number().int().min(0),
  isFree: z.boolean().default(false),
  moduleId: z.string(),
}).refine(data => {
  // Validate based on type
    if (data.type === 'VIDEO_LINK' && !data.videoUrl) {
      return false
    }
    if (['PDF', 'IMAGE', 'VIDEO'].includes(data.type) && !data.fileUrl) {
      return false
    }
    if (data.type === 'TEXT' && !data.content) {
      return false
    }
    return true
  }, {
    message: 'Required fields missing for the selected material type',
  })

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const body = await request.json()
    
    // Clean up empty strings
    const cleanedBody = {
      ...body,
      fileUrl: body.fileUrl || undefined,
      videoUrl: body.videoUrl || undefined,
      content: body.content || undefined,
      description: body.description || undefined,
    }
    
    const validation = materialSchema.safeParse(cleanedBody)
    if (!validation.success) {
      console.error('Validation error:', validation.error.errors)
      return errorResponse(validation.error.errors[0].message, 400)
    }

    const data = validation.data

    // Verify the module belongs to a course owned by the tutor
    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
      include: { 
        course: { 
          select: { 
            tutorId: true 
          } 
        } 
      },
    })

    if (!module) {
      return errorResponse('Module not found', 404)
    }

    if (user.role !== 'ADMIN' && module.course.tutorId !== user.id) {
      return errorResponse('You do not own this course', 403)
    }

    // For TEXT type, ensure content is provided
    if (data.type === 'TEXT' && !data.content) {
      return errorResponse('Content is required for text materials', 400)
    }

    const material = await prisma.material.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content, // This can now be very long
        fileUrl: data.fileUrl,
        videoUrl: data.videoUrl,
        duration: data.duration,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        order: data.order,
        isFree: data.isFree,
        moduleId: data.moduleId,
      },
    })

    return successResponse(material, 'Material created successfully', 201)
  } catch (error) {
    console.error('Create material error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')
    const all = searchParams.get('all')

    if (all === 'true') {
      // Get all materials for the tutor
      const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
      if (error || !user) return errorResponse(error || 'Forbidden', 403)

      const materials = await prisma.material.findMany({
        where: user.role === 'TUTOR' ? {
          module: {
            course: {
              tutorId: user.id
            }
          }
        } : {},
        include: {
          module: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      })
      return successResponse(materials)
    }

    if (!moduleId) return errorResponse('moduleId is required', 400)

    const materials = await prisma.material.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    })

    return successResponse(materials)
  } catch (error) {
    console.error('Get materials error:', error)
    return errorResponse('Internal server error', 500)
  }
}