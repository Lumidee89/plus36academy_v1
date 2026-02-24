// src/lib/api.ts
import { NextResponse } from 'next/server'

export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, message },
    { status }
  )
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    { status }
  )
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string
) {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
