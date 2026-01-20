import { getProjects, ProjectListResponse } from '@/lib/api'
import { fetchWithTimeoutAndRetry, getBaseUrl } from '@/lib/sitemap-utils'

// Refresh sitemap periodically to pick up new content
export const revalidate = 3600 // 1 hour

type SitemapIndexEntry = {
  url: string
  lastModified?: Date
}

function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  const items = entries
    .map((entry) => {
      const lastMod = entry.lastModified
        ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : ''
      return `<sitemap><loc>${entry.url}</loc>${lastMod}</sitemap>`
    })
    .join('')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    items,
    '</sitemapindex>',
  ].join('')
}

// Helper to get total count of active projects for chunk calculation
async function getTotalActiveProjectsCount(): Promise<number> {
  try {
    const data: ProjectListResponse = await fetchWithTimeoutAndRetry(
      () => getProjects({
        page: 1,
        per_page: 1,
        status: 'active',
      }),
      'get total projects count',
      '/api/v1/projects?page=1&per_page=1&status=active'
    )

    return data?.total || 0
  } catch (error) {
    console.error('[sitemap] Error fetching total projects count:', error)
    return 0
  }
}

export async function GET(): Promise<Response> {
  const baseUrl = getBaseUrl()
  const now = new Date()

  try {
    // Get total active projects count to calculate number of chunks
    const totalProjects = await getTotalActiveProjectsCount()
    const projectsPerChunk = 2500
    const numChunks = Math.ceil(totalProjects / projectsPerChunk)

    const sitemaps: SitemapIndexEntry[] = [
      {
        url: `${baseUrl}/sitemap/static`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/sitemap/cities`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/sitemap/developers`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/sitemap/news`,
        lastModified: now,
      },
    ]

    // Add project chunk sitemaps
    for (let n = 1; n <= numChunks; n++) {
      sitemaps.push({
        url: `${baseUrl}/sitemap/projects/${n}`,
        lastModified: now,
      })
    }

    return new Response(buildSitemapIndexXml(sitemaps), {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('[sitemap] Error generating sitemap index:', error)
    // Return minimal index with static sitemaps only
    const fallback = buildSitemapIndexXml([
      {
        url: `${baseUrl}/sitemap/static`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/sitemap/cities`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/sitemap/developers`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/sitemap/news`,
        lastModified: now,
      },
    ])
    return new Response(fallback, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}
