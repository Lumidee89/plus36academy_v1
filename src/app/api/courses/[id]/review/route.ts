import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'
import type { CourseStatus } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only admin can review courses
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { approved, feedback } = await request.json()

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        status: approved ? ('PUBLISHED' as CourseStatus) : ('REJECTED' as CourseStatus),
        // You could add a feedback field to your Course model if needed
      },
      include: {
        tutor: { select: { id: true, name: true, email: true } }
      }
    })

    // TODO: Send notification email to tutor about review result

    return successResponse(course, `Course ${approved ? 'approved' : 'rejected'} successfully`)
  } catch (error) {
    console.error('Course review error:', error)
    return errorResponse('Internal server error', 500)
  }
}