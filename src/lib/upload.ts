// src/lib/upload.ts
// Local disk file storage — saves uploaded files to /public/uploads
// Files are served directly by Next.js as static assets via /uploads/...

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import mime from 'mime-types'

// ── Config ────────────────────────────────────────────────────────────────────
const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '500') * 1024 * 1024

// Allowed MIME types per category
const ALLOWED: Record<string, string[]> = {
  PDF: ['application/pdf'],
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  VIDEO: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
}

// All allowed types flat list
const ALL_ALLOWED = Object.values(ALLOWED).flat()

export type UploadCategory = 'PDF' | 'IMAGE' | 'VIDEO' | 'avatar' | 'thumbnail'

export interface UploadResult {
  url: string          // public URL  e.g. /uploads/videos/abc123.mp4
  filename: string     // abc123.mp4
  originalName: string // lecture-1.mp4
  mimeType: string
  size: number         // bytes
  category: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map category → sub-folder name */
function folderFor(category: UploadCategory): string {
  const map: Record<UploadCategory, string> = {
    PDF: 'pdfs',
    IMAGE: 'images',
    VIDEO: 'videos',
    avatar: 'avatars',
    thumbnail: 'thumbnails',
  }
  return map[category] ?? 'misc'
}

/** Ensure the upload sub-directory exists */
async function ensureDir(folder: string) {
  const dir = path.join(UPLOAD_ROOT, folder)
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  return dir
}

/** Detect category from MIME type */
function detectCategory(mimeType: string): UploadCategory | null {
  if (ALLOWED.PDF.includes(mimeType)) return 'PDF'
  if (ALLOWED.IMAGE.includes(mimeType)) return 'IMAGE'
  if (ALLOWED.VIDEO.includes(mimeType)) return 'VIDEO'
  return null
}

// ── Main upload function ──────────────────────────────────────────────────────

/**
 * Save a file from a Next.js API FormData request to local disk.
 *
 * Usage in an API route:
 *   const formData = await request.formData()
 *   const file = formData.get('file') as File
 *   const result = await saveUploadedFile(file, 'VIDEO')
 */
export async function saveUploadedFile(
  file: File,
  forceCategory?: UploadCategory,
): Promise<UploadResult> {
  // Size check
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 500} MB.`)
  }

  const mimeType = file.type || mime.lookup(file.name) || 'application/octet-stream'

  // Determine category
  const category: UploadCategory =
    forceCategory ?? detectCategory(mimeType) ?? 'IMAGE'

  // Validate MIME (skip for forced avatar/thumbnail - can be any image)
  if (!forceCategory || (forceCategory !== 'avatar' && forceCategory !== 'thumbnail')) {
    if (!ALL_ALLOWED.includes(mimeType)) {
      throw new Error(`File type "${mimeType}" is not allowed.`)
    }
  }

  // Build unique filename:  uuid + original extension
  const ext = path.extname(file.name) || `.${mime.extension(mimeType) || 'bin'}`
  const filename = `${uuidv4()}${ext}`

  // Ensure directory exists
  const folder = folderFor(category)
  const dir = await ensureDir(folder)

  // Write to disk
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(dir, filename), buffer)

  // Public URL (Next.js serves /public as /)
  const url = `/uploads/${folder}/${filename}`

  return {
    url,
    filename,
    originalName: file.name,
    mimeType,
    size: file.size,
    category: folder,
  }
}

/**
 * Delete a previously uploaded file from disk.
 * Pass the public URL returned by saveUploadedFile.
 */
export async function deleteUploadedFile(publicUrl: string): Promise<void> {
  try {
    // Convert /uploads/videos/abc.mp4  →  <cwd>/public/uploads/videos/abc.mp4
    const relativePath = publicUrl.replace(/^\//, '') // strip leading /
    const filePath = path.join(process.cwd(), 'public', relativePath)
    const { unlink } = await import('fs/promises')
    await unlink(filePath)
  } catch {
    // File may already be gone — silently ignore
  }
}

/**
 * Validate that a given URL is a local upload (not arbitrary external URL).
 * Useful before serving files to enrolled users.
 */
export function isLocalUpload(url: string): boolean {
  return url.startsWith('/uploads/')
}
