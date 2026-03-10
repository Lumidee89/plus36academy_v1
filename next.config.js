/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', 
  typescript: {
    ignoreBuildErrors: true, // Temporarily ignore TS errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily ignore ESLint errors during build
  },
}
module.exports = nextConfig

