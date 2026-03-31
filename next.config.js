/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow next/image to serve from /uploads/ folder on server
    unoptimized: true,
  },
  // Ensure /uploads/ folder is treated as static files
  // Files saved to public/uploads/ are served at /uploads/
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
