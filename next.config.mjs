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
  // Enable build caching for better performance
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
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