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
          ? "http://localhost:8000/api/v1/:path*"  // Always proxy to localhost:8000 in development
          : (process.env.NEXT_PUBLIC_API_URL 
              ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
              : "https://api.mrimot.com/api/v1/:path*"),
      },
    ]
  },
}

export default nextConfig