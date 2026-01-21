import { NextRequest } from 'next/server'
import { getProjects, ProjectListResponse } from '@/lib/api'
import { getBaseUrl, buildAlternates, fetchWithTimeoutAndRetry } from '@/lib/sitemap-utils'
import { listingHref, type SupportedLocale } from '@/lib/routes'

export const revalidate = 3600 // 1 hour

const PROJECTS_PER_CHUNK = 2500
const PER_PAGE = 100

function buildSitemapXml(entries: Array<{ url: string; lastModified?: Date; changeFrequency?: string; priority?: number; alternates?: any }>): string {
  const items = entries
    .map((entry) => {
      const lastMod = entry.lastModified
        ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : ''
      const changeFreq = entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : ''
      const priority = entry.priority !== undefined
        ? `<priority>${entry.priority}</priority>`
        : ''
      
      // Handle alternates (hreflang)
      let alternatesXml = ''
      if (entry.alternates?.languages) {
        const langEntries = Object.entries(entry.alternates.languages)
          .map(([lang, url]) => {
            const hreflang = lang === 'x-default' ? 'x-default' : lang
            return `<xhtml:link rel="alternate" hreflang="${hreflang}" href="${url}" />`
          })
          .join('')
        if (langEntries) {
          alternatesXml = langEntries
        }
      }
      
      return `<url><loc>${entry.url}</loc>${lastMod}${changeFreq}${priority}${alternatesXml}</url>`
    })
    .join('')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    items,
    '</urlset>',
  ].join('')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ n: string }> }
): Promise<Response> {
  const baseUrl = getBaseUrl()
  const languages: SupportedLocale[] = ['en', 'bg', 'ru', 'gr']
  
  try {
    const { n } = await params
    const chunkNumber = parseInt(n, 10)
    
    if (isNaN(chunkNumber) || chunkNumber < 1) {
      console.error(`[sitemap] Invalid chunk number: ${n}`)
      return new Response(buildSitemapXml([]), {
        headers: { 'Content-Type': 'application/xml' },
      })
    }
    
    console.log(`[sitemap] Generating projects sitemap for chunk ${chunkNumber}`)
    
    // Calculate page range for this chunk
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
    
    console.log(`[sitemap] Found ${chunkProjects.length} projects for chunk ${chunkNumber}`)
    
    // Generate sitemap entries for this chunk
    // One URL per project (EN as main) with alternates for other languages
    const projectRoutes = chunkProjects.map((project) => {
      // Use slug-based URL if available, otherwise fallback to ID
      const identifier = project.slug || String(project.id)
      
      // Build alternates once per project (shared across all language variants)
      const alternates = buildAlternates(baseUrl, (lang) => listingHref(lang, identifier))
      
      // Return one entry per project (EN as main) with alternates
      const url = `${baseUrl}${listingHref('en', identifier)}`
      
      const route = {
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
    
    const xml = buildSitemapXml(projectRoutes)
    
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error(`[sitemap] Error generating projects chunk ${(await params).n} sitemap:`, error)
    return new Response(buildSitemapXml([]), {
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
