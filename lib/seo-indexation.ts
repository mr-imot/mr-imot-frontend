/**
 * Centralized SEO indexation rules for listings, news, and developers.
 * See docs/seo-architecture.md for the full query-param taxonomy.
 */

export interface ListingsIndexationParams {
  page?: string
  type?: string
  city?: string
  city_key?: string
  ne_lat?: string
  sw_lat?: string
  ne_lng?: string
  sw_lng?: string
  search_by_map?: string
}

export interface ListingsIndexationResult {
  index: boolean
  /** Canonical URL (base listings or city hub base, no query params) */
  canonicalPath: string
}

/**
 * Whether listings page with these params should be indexable and what canonical to use.
 * Indexable only when: page 1 (or no page), no type filter (or type=all), no map bounds.
 */
export function getListingsIndexation(
  params: ListingsIndexationParams,
  baseListingsPath: string,
  cityHubBasePath: string | null
): ListingsIndexationResult {
  const pageNum = params.page ? parseInt(params.page, 10) : 1
  const validPage = pageNum > 0 ? pageNum : 1
  const hasPageNotOne = validPage > 1
  const hasTypeFilter = !!params.type && params.type !== 'all'
  const hasBounds =
    !!(params.ne_lat && params.ne_lng && params.sw_lat && params.sw_lng) ||
    params.search_by_map === 'true'

  const canonicalPath = cityHubBasePath ?? baseListingsPath
  const index =
    !hasPageNotOne &&
    !hasTypeFilter &&
    !hasBounds &&
    !(params.city_key || params.city) // query ?city= or ?city_key= → noindex (canonical to hub)

  return {
    index,
    canonicalPath,
  }
}

export interface NewsIndexationParams {
  page?: string
  q?: string
  category?: string
  tag?: string
}

export interface NewsIndexationResult {
  index: boolean
  canonicalPath: string
}

/**
 * News index: indexable only for page 1 with no filters.
 * Page 2+, or any q/category/tag → noindex, canonical to base news.
 */
export function getNewsIndexation(
  params: NewsIndexationParams,
  baseNewsPath: string
): NewsIndexationResult {
  const pageNum = params.page ? parseInt(params.page, 10) : 1
  const validPage = pageNum > 0 ? pageNum : 1
  const index =
    validPage <= 1 &&
    !params.q &&
    !params.category &&
    !params.tag
  return {
    index,
    canonicalPath: baseNewsPath,
  }
}

export interface DevelopersIndexationParams {
  page?: string
}

export interface DevelopersIndexationResult {
  index: boolean
  canonicalPath: string
}

/**
 * Developers index: indexable only for page 1. Page 2+ → noindex, canonical to base developers.
 */
export function getDevelopersIndexation(
  params: DevelopersIndexationParams,
  baseDevelopersPath: string
): DevelopersIndexationResult {
  const pageNum = params.page ? parseInt(params.page, 10) : 1
  const validPage = pageNum > 0 ? pageNum : 1
  const index = validPage <= 1
  return {
    index,
    canonicalPath: baseDevelopersPath,
  }
}
