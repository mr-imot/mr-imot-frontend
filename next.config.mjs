import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set the workspace root to this directory to avoid lockfile detection warnings
  outputFileTracingRoot: __dirname,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Enable Next.js image optimization with ImageKit remote patterns
    deviceSizes: [120, 160, 240, 320, 480, 640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/ts59gf2ul/**',
      },
    ],
  },
  // Compress output (includes CSS minification)
  // CSS optimization: Next.js automatically tree-shakes and minifies CSS in production builds
  compress: true,
  // SWC minification is enabled by default in Next.js 15
  // Configure compiler to not transpile modern features unnecessarily
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Experimental: Optimize for modern browsers only
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  transpilePackages: ['next-mdx-remote'],
  // Enable build caching for better performance
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value:
              '<https://ik.imagekit.io>; rel=preconnect; crossorigin=anonymous, <https://ik.imagekit.io>; rel=dns-prefetch',
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/health",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/health`,
      },
      // Locale sitemaps (cities, developers, projects) are proxied by app/sitemaps/[locale]/... route handlers
      // so we read the response body and fix backend's wrong Content-Length: 0 (P0 fix).
      // Legacy backend sitemaps - proxy to API (for backward compatibility)
      {
        source: "/sitemaps/cities.xml",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sitemaps/cities.xml`,
      },
      {
        source: "/sitemaps/developers.xml",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sitemaps/developers.xml`,
      },
      {
        source: "/sitemaps/projects/:n.xml",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/sitemaps/projects/:n.xml`,
      },
      // Frontend-generated sitemaps - rewrite to /sitemaps/ namespace
      {
        source: "/sitemaps/static.xml",
        destination: "/sitemap/static/sitemap.xml",
      },
      {
        source: "/sitemaps/news.xml",
        destination: "/sitemap/news/sitemap.xml",
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