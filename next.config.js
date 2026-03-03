/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // or 'export' if you're using static export
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during build
  },
}
module.exports = nextConfig

