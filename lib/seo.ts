type Lang = 'en' | 'bg' | undefined

export const brandForLang = (lang: Lang) => (lang === 'bg' ? 'Мистър Имот' : 'Mister Imot')

/**
 * Normalizes a title and guarantees the brand suffix at the end.
 * - Removes any existing brand tokens (with or without a preceding bar/dash).
 * - Preserves the rest of the text so we don't lose descriptive parts.
 * - Appends the correct suffix: " | Мистър Имот" or " | Mister Imot".
 */
export const formatTitleWithBrand = (rawTitle: string, lang: Lang) => {
  const suffix = lang === 'bg' ? ' | Мистър Имот' : ' | Mister Imot'
  if (!rawTitle) return brandForLang(lang) + suffix

  const stripped = rawTitle
    // Remove brand when it appears after a bar (and keep what follows)
    .replace(/\|\s*(Mister Imot|Мистър Имот)\s*/gi, '| ')
    // Remove brand when it appears after a dash at the end of a segment
    .replace(/[–—-]\s*(Mister Imot|Мистър Имот)\s*/gi, '')
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
