/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.NODE_ENV === 'development' 
          ? "http://localhost:8000/api/v1/:path*"
          : "https://api.mrimot.com/api/v1/:path*",
      },
    ]
  },
}

export default nextConfig
