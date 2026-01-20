import { MetadataRoute } from 'next'
import { getProjects, ProjectListResponse } from '@/lib/api'
import { getBaseUrl, fetchWithTimeoutAndRetry } from '@/lib/sitemap-utils'

// Refresh sitemap periodically to pick up new content
export const revalidate = 3600 // 1 hour

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

export default async function sitemap(): Promise<Array<{ url: string; lastModified?: Date }>> {
  const baseUrl = getBaseUrl()
  const now = new Date()
  
  try {
    // Get total active projects count to calculate number of chunks
    const totalProjects = await getTotalActiveProjectsCount()
    const projectsPerChunk = 2500
    const numChunks = Math.ceil(totalProjects / projectsPerChunk)
    
    const sitemaps: Array<{ url: string; lastModified?: Date }> = [
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
    
    return sitemaps
  } catch (error) {
    console.error('[sitemap] Error generating sitemap index:', error)
    // Return minimal index with static sitemaps only
    return [
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
  }
}

