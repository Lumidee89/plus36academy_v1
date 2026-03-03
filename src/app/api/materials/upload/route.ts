import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireRole } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api';

// New segment config (replaces the old export const config)
export const dynamic = 'force-dynamic'; // Disable static optimization
export const revalidate = 0; // Disable cache
export const fetchCache = 'force-no-store'; // Don't cache this route
export const maxDuration = 60; // Maximum execution time in seconds (optional)

export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireRole(request, ['TUTOR', 'ADMIN']);
    if (error || !user) return errorResponse(error || 'Forbidden', 403);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return errorResponse('No file uploaded', 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('File type not allowed', 400);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse('File size too large (max 10MB)', 400);
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Determine folder based on file type
    let folder = 'others';
    if (file.type.startsWith('image/')) folder = 'images';
    else if (file.type.startsWith('video/')) folder = 'videos';
    else if (file.type === 'application/pdf') folder = 'pdfs';
    
    const extension = file.name.split('.').pop();
    const filename = `${uuidv4()}.${extension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const filepath = path.join(uploadDir, filename);

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Save file
    await writeFile(filepath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${folder}/${filename}`;

    return successResponse({ url: fileUrl }, 'File uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Optional: Handle other HTTP methods
export async function GET() {
  return errorResponse('Method not allowed', 405);
}