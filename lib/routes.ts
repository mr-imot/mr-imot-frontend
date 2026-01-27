export type SupportedLocale = 'en' | 'bg' | 'ru' | 'gr'

type RouteKey =
  | 'home'
  | 'listings'
  | 'developers'
  | 'news'
  | 'about'
  | 'contact'
  | 'login'
  | 'register'

type LocaleRouteMap = Record<SupportedLocale, Record<RouteKey, string>>

/**
 * Canonical PUBLIC routes (what appears in the browser URL bar).
 * English has no /en prefix by design.
 */
export const PUBLIC_ROUTES: LocaleRouteMap = {
  en: {
    home: '/',
    listings: '/listings',
    developers: '/developers',
    news: '/news',
    about: '/about-mister-imot',
    contact: '/contact',
    login: '/login',
    register: '/register',
  },
  bg: {
    home: '/bg',
    listings: '/bg/obiavi',
    developers: '/bg/stroiteli',
    news: '/bg/novini',
    about: '/bg/za-mistar-imot',
    contact: '/bg/kontakt',
    login: '/bg/login',
    register: '/bg/register',
  },
  ru: {
    home: '/ru',
    listings: '/ru/obyavleniya',
    developers: '/ru/zastroyshchiki',
    news: '/ru/novosti',
    about: '/ru/o-mister-imot',
    contact: '/ru/kontakty',
    login: '/ru/login',
    register: '/ru/register',
  },
  gr: {
    home: '/gr',
    listings: '/gr/aggelies',
    developers: '/gr/kataskeuastes',
    news: '/gr/eidhseis',
    about: '/gr/sxetika-me-to-mister-imot',
    contact: '/gr/epikoinonia',
    login: '/gr/login',
    register: '/gr/register',
  },
} as const

function assertSupportedLocale(lang: string): SupportedLocale {
  if (lang === 'en' || lang === 'bg' || lang === 'ru' || lang === 'gr') return lang
  return 'en'
}

// ---------- Core builders (strings) ----------
export function homeHref(lang: SupportedLocale): string {
  return PUBLIC_ROUTES[lang].home
}

export function listingsHref(lang: SupportedLocale): string {
  return PUBLIC_ROUTES[lang].listings
}

export function listingHref(lang: SupportedLocale, id: string | number): string {
  // Canonical route: /{lang}/{listingsBase}/p/[slug]
  return `${PUBLIC_ROUTES[lang].listings}/p/${id}`
}

export function cityListingsHref(lang: SupportedLocale, cityKey: string): string {
  // Universal segment /c/ for all languages
  return `${PUBLIC_ROUTES[lang].listings}/c/${cityKey}`
}

export function developersHref(lang: SupportedLocale): string {
  return PUBLIC_ROUTES[lang].developers
}

export function developerHref(lang: SupportedLocale, slug: string): string {
  return `${PUBLIC_ROUTES[lang].developers}/${slug}`
}

export function newsHref(lang: SupportedLocale): string {
  return PUBLIC_ROUTES[lang].news
}

export function newsArticleHref(lang: SupportedLocale, slug: string): string {
  return `${PUBLIC_ROUTES[lang].news}/${slug}`
}

export function aboutHref(lang: SupportedLocale): string {
  return PUBLIC_ROUTES[lang].about
}

export function contactHref(lang: SupportedLocale): string {
  return PUBLIC_ROUTES[lang].contact
}

export function loginHref(lang: SupportedLocale): string {
  return PUBLIC_ROUTES[lang].login
}

// ---------- Query-param routes (Next Link object format) ----------
export function registerDeveloperHref(lang: SupportedLocale) {
  return {
    pathname: PUBLIC_ROUTES[lang].register,
    query: { type: 'developer' },
  } as const
}

/** String href for register?type=developer (App Router Link prefers string href). */
export function registerDeveloperHrefString(lang: SupportedLocale): string {
  return `${PUBLIC_ROUTES[lang].register}?type=developer`
}

// ---------- Convenience when you have lang: string ----------
export function asLocale(lang: string): SupportedLocale {
  return assertSupportedLocale(lang)
}
