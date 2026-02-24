// src/app/api/materials/upload/route.ts
//
// Local disk upload endpoint.
// Accepts multipart/form-data with a "file" field.
// Saves to /public/uploads/<category>/<uuid>.<ext>
// Returns the public URL that Next.js serves as a static asset.
//
// Mobile apps: POST with Content-Type: multipart/form-data
//   FormData field "file"  → the binary file
//   FormData field "category" (optional) → "PDF" | "IMAGE" | "VIDEO"

import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { errorResponse } from '@/lib/api'
import { saveUploadedFile, type UploadCategory } from '@/lib/upload'

export const config = {
  api: { bodyParser: false }, // we parse FormData ourselves
}

// Tell Next.js this route can handle large bodies
export const maxDuration = 60 // seconds

export async function POST(request: NextRequest) {
  try {
    // Auth check — only tutors and admins can upload
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    // Parse multipart form data (Next.js 14 App Router)
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return errorResponse('Expected multipart/form-data with a "file" field', 400)
    }

    const file = formData.get('file') as File | null
    if (!file || file.size === 0) {
      return errorResponse('No file provided. Send a "file" field in your form data.', 400)
    }

    const category = (formData.get('category') as UploadCategory | null) ?? undefined

    // Save to local disk
    const result = await saveUploadedFile(file, category)

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,                // e.g. /uploads/videos/abc123.mp4
        filename: result.filename,
        originalName: result.originalName,
        mimeType: result.mimeType,
        size: result.size,             // bytes
        sizeMB: +(result.size / 1024 / 1024).toFixed(2),
        category: result.category,
      },
      message: 'File uploaded successfully',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    console.error('Upload error:', message)
    // Return 413 for size errors, 400 for type errors, 500 for anything else
    const status = message.includes('too large') ? 413 : message.includes('not allowed') ? 400 : 500
    return errorResponse(message, status)
  }
}

// DELETE — remove a previously uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN'])
    if (error || !user) return errorResponse(error || 'Forbidden', 403)

    const { url } = await request.json()
    if (!url) return errorResponse('url is required', 400)

    const { deleteUploadedFile, isLocalUpload } = await import('@/lib/upload')
    if (!isLocalUpload(url)) return errorResponse('Only local uploads can be deleted this way', 400)

    await deleteUploadedFile(url)
    return NextResponse.json({ success: true, message: 'File deleted' })
  } catch {
    return errorResponse('Failed to delete file', 500)
  }
}
