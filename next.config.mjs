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
        source: "/health",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/health`,
      },
      // Handle projects endpoint specifically with trailing slash for FastAPI
      {
        source: "/api/v1/projects",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/projects/`,
      },
      // General catch-all should come last to avoid conflicts
      {
        source: "/api/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ]
  },
  // Ensure trailing slashes work correctly
  trailingSlash: false,
}

export default nextConfig