import Link from "next/link"
import { headers } from "next/headers"
import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"
import { LanguageSwitcher } from "@/components/language-switcher"
import { PublicMobileNav } from "@/components/public-mobile-nav"

type SupportedLocale = 'en' | 'bg' | 'ru' | 'gr'

interface ServerHeaderProps {
  lang: SupportedLocale
  translations: {
    navigation: {
      listings: string
      developers: string
      blog?: string
      aboutUs: string
      listYourProject: string
      login: string
    }
  }
}

// Helper to generate localized URLs server-side
function getLocalizedHref(locale: SupportedLocale, en: string, bg: string): string {
  if (locale === 'bg') return `/bg/${bg}`
  if (locale === 'ru') {
    const ruMap: Record<string, string> = {
      listings: 'obyavleniya',
      developers: 'zastroyshchiki',
      'about-mister-imot': 'o-mister-imot',
      contact: 'kontakty',
      news: 'novosti',
      'register?type=developer': 'register?type=developer',
      login: 'login',
    }
    return `/ru/${ruMap[en] ?? en}`
  }
  if (locale === 'gr') {
    const grMap: Record<string, string> = {
      listings: 'aggelies',
      developers: 'kataskeuastes',
      'about-mister-imot': 'sxetika-me-to-mister-imot',
      contact: 'epikoinonia',
      news: 'eidhseis',
      'register?type=developer': 'register?type=developer',
      login: 'login',
    }
    return `/gr/${grMap[en] ?? en}`
  }
  return `/${en}`
}

// Get pathname from headers (server-side)
async function getPathname(lang: SupportedLocale): Promise<string> {
  try {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname')
    if (pathname) return pathname
  } catch {
    // Headers not available (e.g., during static generation)
  }
  // Fallback: construct pathname from lang
  return `/${lang}`
}

export async function ServerHeader({ lang, translations }: ServerHeaderProps) {
  const pathname = await getPathname(lang)
  const isListingsPage = pathname.includes('/listings') || pathname.includes('/obiavi')
  const t = translations.navigation

  // Logo alt text based on locale
  const logoAlt = 
    lang === 'bg' ? 'Лого на Мистър Имот' :
    lang === 'ru' ? 'Логотип Mister Imot' :
    'Mister Imot Logo'

  return (
    <header className={`header-glass flex items-center justify-between pl-4 pr-0 sm:pl-6 sm:pr-6 md:px-8 py-4 ${isListingsPage ? 'hidden xl:flex' : ''}`}>
      <div className="w-full flex items-center justify-between md:grid md:grid-cols-[auto,1fr,auto] md:gap-4">
        {/* Logo (always visible) */}
        <div className="flex items-center justify-start">
          <Link href="/" className="flex items-center space-x-3 group clickable cursor-pointer">
            <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white text-charcoal-800 shadow-[0_10px_24px_rgba(0,0,0,0.12)] border border-slate-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-200 cursor-pointer logo-circle">
              <Image
                src={toIkPath("https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo-no-background.png")}
                alt={logoAlt}
                width={56}
                height={56}
                transformation={[{ width: 112, height: 112, quality: 85, format: "webp", focus: "auto" }]}
                className="object-contain drop-shadow-lg cursor-pointer"
                priority
                sizes="56px"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Visible from md and up */}
        <nav className="hidden md:flex items-center justify-start gap-3 lg:justify-center lg:gap-4">
          <Link
            href={getLocalizedHref(lang, 'listings', 'obiavi')}
            className="text-white hover:text-white text-sm font-medium px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.listings}
          </Link>
          <Link
            href={getLocalizedHref(lang, 'developers', 'stroiteli')}
            className="text-white hover:text-white text-sm font-medium px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.developers}
          </Link>
          <Link
            href={getLocalizedHref(lang, 'news', 'novini')}
            className="text-white hover:text-white text-sm font-medium px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.blog ?? 'News'}
          </Link>
          <Link
            href={getLocalizedHref(lang, 'about-mister-imot', 'za-mistar-imot')}
            className="text-white hover:text-white text-sm font-medium px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.aboutUs}
          </Link>
        </nav>

        {/* Right Side - Language Switcher + Login + Mobile Nav */}
        <div className="flex items-center justify-end md:space-x-6">
          {/* Primary CTA - List Project */}
          <div className="hidden md:block">
            <Link 
              href={getLocalizedHref(lang, 'register?type=developer', 'register?type=developer')} 
              className="btn-shine inline-flex items-center px-6 py-2 rounded-full bg-charcoal-500 text-white text-xs font-semibold hover:bg-charcoal-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal-300 h-8 w-40 justify-center whitespace-nowrap"
            >
              {t.listYourProject}
            </Link>
          </div>
          {/* Language Switcher - Hidden on mobile (client component) */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          
          {/* Static Login Button - Always shows Login (no auth check) */}
          <div className="hidden md:block">
            <Link href={getLocalizedHref(lang, 'login', 'login')}>
              <button className="group relative overflow-hidden px-6 py-2 rounded-full bg-white text-black font-semibold text-xs transition-all duration-300 hover:bg-gray-50 cursor-pointer h-8 flex items-center justify-between w-24 border border-gray-200 shadow-sm hover:shadow-md">
                <span className="transition-transform duration-300 ease-out group-hover:-translate-x-1 cursor-pointer">
                  {t.login}
                </span>
                <svg className="w-3 h-3 transition-all duration-300 ease-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                </svg>
              </button>
            </Link>
          </div>
          
          {/* Mobile Navigation - Only visible on mobile, positioned at far right */}
          <div className="md:hidden flex items-center justify-end">
            <PublicMobileNav translations={t} />
          </div>
        </div>
      </div>
    </header>
  )
}
