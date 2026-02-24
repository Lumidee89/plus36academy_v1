/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images served from the local /uploads folder
    remotePatterns: [],
    // Local uploads are served as static files — no special config needed
    // Access them as <img src="/uploads/images/abc.jpg" />
  },

  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },

  // Allow large file uploads (default Next.js limit is 4MB for API routes)
  // We handle the size limit ourselves in src/lib/upload.ts
  api: {
    bodyParser: {
      sizeLimit: '600mb',
    },
    responseLimit: false,
  },
}

module.exports = nextConfig

