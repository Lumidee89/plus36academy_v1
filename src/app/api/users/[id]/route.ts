import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only allow admins to view user details
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const userId = params.id

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Include related data
        taughtCourses: {
          select: {
            id: true,
            title: true,
            status: true,
            price: true,
            currency: true,
            createdAt: true,
            _count: {
              select: {
                enrollments: true,
                reviews: true,
              }
            }
          }
        },
        enrollments: {
          select: {
            id: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            },
            status: true,
            progress: true,
            createdAt: true,
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
              }
            }
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!userData) {
      return errorResponse('User not found', 404)
    }

    // Calculate additional stats
    const totalRevenue = userData.payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const averageRating = userData.reviews?.reduce((sum, r) => sum + r.rating, 0) / (userData.reviews?.length || 1) || 0

    const enrichedUser = {
      ...userData,
      totalRevenue,
      averageRating: userData.reviews?.length ? averageRating : 0,
      totalCourses: userData.taughtCourses?.length || 0,
      totalEnrollments: userData.enrollments?.length || 0,
    }

    return successResponse(enrichedUser)
  } catch (error) {
    console.error('Get user error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only allow admins to update users
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const userId = params.id
    const body = await request.json()
    const { name, role, phone, bio, isVerified, isActive } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return errorResponse('User not found', 404)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        role,
        phone,
        bio,
        isVerified,
        isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return successResponse(updatedUser, 'User updated successfully')
  } catch (error) {
    console.error('Update user error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Only allow admins to delete users
    const { error, user } = await requireRole(request, ['ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const userId = params.id

    // Prevent deleting yourself
    if (userId === user.id) {
      return errorResponse('Cannot delete your own account', 400)
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return errorResponse('User not found', 404)
    }

    // Delete user (cascade will handle related records based on schema)
    await prisma.user.delete({
      where: { id: userId },
    })

    return successResponse(null, 'User deleted successfully')
  } catch (error) {
    console.error('Delete user error:', error)
    return errorResponse('Internal server error', 500)
  }
}