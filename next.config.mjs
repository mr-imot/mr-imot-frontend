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
      // Handle /api/v1/projects specifically (without trailing slash)
      {
        source: "/api/v1/projects",
        destination: process.env.NODE_ENV === 'development' 
          ? "http://localhost:8000/api/v1/projects/"  // Add trailing slash for FastAPI
          : (process.env.NEXT_PUBLIC_API_URL 
              ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/`
              : "https://api.mrimot.com/api/v1/projects/"),
      },
      // Handle /api/v1/projects with query params
      {
        source: "/api/v1/projects/:path*",
        destination: process.env.NODE_ENV === 'development' 
          ? "http://localhost:8000/api/v1/projects/:path*"
          : (process.env.NEXT_PUBLIC_API_URL 
              ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/:path*`
              : "https://api.mrimot.com/api/v1/projects/:path*"),
      },
      // General catch-all for other API routes
      {
        source: "/api/v1/:path*",
        destination: process.env.NODE_ENV === 'development' 
          ? "http://localhost:8000/api/v1/:path*"
          : (process.env.NEXT_PUBLIC_API_URL 
              ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`
              : "https://api.mrimot.com/api/v1/:path*"),
      },
    ]
  },
  // Ensure trailing slashes work correctly
  trailingSlash: false,
}

export default nextConfig