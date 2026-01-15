export type SupportedLocale = 'en' | 'bg' | 'ru' | 'gr'

/**
 * Generate developer register href with query parameter
 * Returns Next.js Link object format: { pathname, query }
 */
export function registerDeveloperHref(lang: SupportedLocale) {
  return {
    pathname: lang === 'en' ? '/register' : `/${lang}/register`,
    query: { type: 'developer' },
  } as const
}
