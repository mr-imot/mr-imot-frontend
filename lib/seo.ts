type Lang = 'en' | 'bg' | 'ru' | 'gr' | undefined

/**
 * Get the production site URL for canonical URLs and SEO metadata.
 * 
 * IMPORTANT: This function hardcodes the production domain to prevent
 * the canonical URL trap described in:
 * https://www.reddit.com/r/nextjs/s/otIdK3NiqK
 * 
 * During build time on Vercel, environment variables may not resolve
 * correctly, causing canonical URLs to point to localhost or preview URLs,
 * which Google ignores. Hardcoding the production domain ensures canonical
 * URLs are always valid.
 * 
 * For non-SEO purposes (e.g., API calls, redirects), use process.env.NEXT_PUBLIC_SITE_URL
 * with a fallback, but NEVER for canonical URLs in generateMetadata.
 * 
 * @returns The production site URL without trailing slash
 */
export function getSiteUrl(): string {
  // Hardcode production domain for canonical URLs to prevent build-time issues
  return 'https://mrimot.com'
}

export const brandForLang = (lang: Lang) => {
  if (lang === 'bg') return 'Мистър Имот'
  if (lang === 'ru') return 'Мистер Имот'
  if (lang === 'gr') return 'Mister Imot'
  return 'Mister Imot'
}

/**
 * Normalizes a title and guarantees the brand suffix at the end.
 * - Removes any existing brand tokens (with or without a preceding bar/dash).
 * - Preserves the rest of the text so we don't lose descriptive parts.
 * - Appends the correct suffix: " | Мистър Имот" or " | Mister Imot".
 */
export const formatTitleWithBrand = (rawTitle: string, lang: Lang) => {
  const suffix = lang === 'bg'
    ? ' | Мистър Имот'
    : lang === 'ru'
      ? ' | Мистер Имот'
      : ' | Mister Imot'
  if (!rawTitle) return brandForLang(lang) + suffix

  const stripped = rawTitle
    // Remove brand when it appears after a bar (and keep what follows)
    .replace(/\|\s*(Mister Imot|Мистър Имот|Мистер Имот)\s*/gi, '| ')
    // Remove brand when it appears after a dash at the end of a segment
    .replace(/[–—-]\s*(Mister Imot|Мистър Имот|Мистер Имот)\s*/gi, '')
    // Remove orphan dashes that were connected to a bar after stripping brand
    .replace(/\|\s*[–—-]\s*/g, '| ')
    // Clean duplicate separators created by removals
    .replace(/\s*\|\s*\|\s*/g, ' | ')
    .replace(/\s*[–—-]\s*\|\s*/g, ' | ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*\|\s*$/g, '')
    .trim()

  const cleaned = stripped || brandForLang(lang)
  return cleaned.endsWith(suffix) ? cleaned : `${cleaned}${suffix}`
}
