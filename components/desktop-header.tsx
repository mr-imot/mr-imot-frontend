import Link from "next/link"
import { Image } from "@imagekit/next"
import { toIkPath } from "@/lib/imagekit"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ServerHeaderAuthSlot } from "@/components/server-header-auth-slot"
import headerStyles from "./header.module.css"

type SupportedLocale = 'en' | 'bg' | 'ru' | 'gr'

interface DesktopHeaderProps {
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

/**
 * Desktop-only header for listings pages
 * 
 * This is a minimal header that:
 * - Only renders on desktop (xl and above) - hidden on mobile via CSS
 * - Does NOT include PublicMobileNav (listings mobile header has its own)
 * - Only includes desktop navigation, language switcher, and login
 * - Prevents duplicate hydration of mobile nav components
 */
export function DesktopHeader({ lang, translations }: DesktopHeaderProps) {
  const t = translations.navigation

  // Logo alt text based on locale
  const logoAlt = 
    lang === 'bg' ? 'Лого на Мистър Имот' :
    lang === 'ru' ? 'Логотип Mister Imot' :
    'Mister Imot Logo'

  return (
    <header role="banner" className={`${headerStyles.headerGlass} hidden xl:grid items-center pl-4 pr-0 sm:pl-6 sm:pr-6 md:px-8 py-4`}>
      {/* Desktop: 3-column grid layout (prevents center nav from shifting) */}
      <div className="w-full grid items-center grid-cols-[auto_1fr_auto] gap-4">
        {/* Left Column - Logo */}
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

        {/* Center Column - Desktop Navigation (independent of right side width) */}
        <nav role="navigation" className="flex items-center justify-center gap-3 lg:gap-4">
          <Link
            href={getLocalizedHref(lang, 'listings', 'obiavi')}
            className="text-white hover:text-white text-sm font-normal px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.listings}
          </Link>
          <Link
            href={getLocalizedHref(lang, 'developers', 'stroiteli')}
            className="text-white hover:text-white text-sm font-normal px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.developers}
          </Link>
          <Link
            href={getLocalizedHref(lang, 'news', 'novini')}
            className="text-white hover:text-white text-sm font-normal px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.blog ?? 'News'}
          </Link>
          <Link
            href={getLocalizedHref(lang, 'about-mister-imot', 'za-mistar-imot')}
            className="text-white hover:text-white text-sm font-normal px-4 lg:px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.aboutUs}
          </Link>
        </nav>

        {/* Right Column - CTA + Language + Auth (fixed width prevents shifts) */}
        <div className="flex items-center justify-end gap-3 lg:gap-6">
          {/* Primary CTA - List Project */}
          <Link 
            href={getLocalizedHref(lang, 'register?type=developer', 'register?type=developer')} 
            className={`${headerStyles.btnShine} inline-flex items-center px-6 py-2 rounded-full bg-charcoal-500 text-white text-xs font-semibold hover:bg-charcoal-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal-300 h-8 w-40 justify-center whitespace-nowrap`}
          >
            {t.listYourProject}
          </Link>
          {/* Language Switcher */}
          <LanguageSwitcher />
          {/* Auth Slot - Shows login button or logged-in user */}
          <ServerHeaderAuthSlot translations={t} />
        </div>
      </div>
    </header>
  )
}
