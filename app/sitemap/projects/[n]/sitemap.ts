import { MetadataRoute } from 'next'
import { getProjects, ProjectListResponse } from '@/lib/api'
import { getBaseUrl, buildAlternates, fetchWithTimeoutAndRetry } from '@/lib/sitemap-utils'
import { listingHref, type SupportedLocale } from '@/lib/routes'

export const revalidate = 3600 // 1 hour

const PROJECTS_PER_CHUNK = 2500
const PER_PAGE = 100

export default async function sitemap(
  { params }: { params: Promise<{ n: string }> }
): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const languages: SupportedLocale[] = ['en', 'bg', 'ru', 'gr']
  
  try {
    const { n } = await params
    const chunkNumber = parseInt(n, 10)
    if (isNaN(chunkNumber) || chunkNumber < 1) {
      console.error(`[sitemap] Invalid chunk number: ${n}`)
      return []
    }
    
    // Calculate page range for this chunk
    // Chunk 1: pages 1-25 (2500 projects / 100 per page)
    // Chunk 2: pages 26-50
    // etc.
    const startProjectIndex = (chunkNumber - 1) * PROJECTS_PER_CHUNK
    const endProjectIndex = chunkNumber * PROJECTS_PER_CHUNK
    const startPage = Math.floor(startProjectIndex / PER_PAGE) + 1
    const endPage = Math.ceil(endProjectIndex / PER_PAGE)
    
    const allProjects: { id: number; slug?: string; updated_at?: string; created_at?: string }[] = []
    let currentPage = startPage
    let lastSuccessfulPage = 0
    
    // Fetch projects page by page until chunk is filled
    while (currentPage <= endPage && allProjects.length < PROJECTS_PER_CHUNK) {
      try {
        const data: ProjectListResponse = await fetchWithTimeoutAndRetry(
          () => getProjects({
            page: currentPage,
            per_page: PER_PAGE,
            status: 'active',
          }),
          'projects fetch',
          `/api/v1/projects?page=${currentPage}&per_page=${PER_PAGE}&status=active`
        )

        const projects = data?.projects || []
        if (projects.length > 0) {
          const activeProjects = projects
            // API might omit status for public feed; include items unless explicitly inactive
            .filter((p) => {
              const status = (p.status || '').toLowerCase()
              return status === '' || status === 'active'
            })
            .map((p) => ({
              id: Number(p.id),
              slug: p.slug,
              updated_at: p.updated_at,
              created_at: p.created_at,
            }))
          allProjects.push(...activeProjects)
          lastSuccessfulPage = currentPage
        }

        // Check if we've reached the end of available pages
        if (currentPage >= (data?.total_pages || 1)) {
          break
        }
        
        currentPage++
      } catch (error: any) {
        // If we've successfully fetched at least one page, return partial results
        if (lastSuccessfulPage > 0) {
          console.warn(`[sitemap] Projects fetch failed at page ${currentPage}, returning ${allProjects.length} projects from ${lastSuccessfulPage} page(s)`)
          break
        }
        // If first page fails, throw to be caught by outer try-catch
        throw error
      }
    }
    
    // Limit to chunk size
    const chunkProjects = allProjects.slice(0, PROJECTS_PER_CHUNK)
    
    // Generate sitemap entries for this chunk
    const projectRoutes: MetadataRoute.Sitemap = chunkProjects.flatMap((project) => {
      // Use slug-based URL if available, otherwise fallback to ID
      const identifier = project.slug || String(project.id)
      
      // Build alternates once per project (shared across all language variants)
      const alternates = buildAlternates(baseUrl, (lang) => listingHref(lang, identifier))
      
      return languages.map((lang): MetadataRoute.Sitemap[0] => {
        const url = `${baseUrl}${listingHref(lang, identifier)}`
        
        // Use updated_at if available, fallback to created_at, otherwise omit lastModified
        const route: MetadataRoute.Sitemap[0] = {
          url,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
          alternates,
        }
        
        // Prefer updated_at, fallback to created_at
        const dateValue = project.updated_at || project.created_at
        if (dateValue) {
          const lm = new Date(dateValue)
          if (!isNaN(lm.getTime())) {
            route.lastModified = lm
          }
        }
        
        return route
      })
    })
    
    return projectRoutes
  } catch (error) {
    console.error(`[sitemap] Error generating projects chunk ${(await params).n} sitemap:`, error)
    return []
  }
}
