"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserAuthNav } from "@/components/user-auth-nav"
import { MobileNav } from "@/components/mobile-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations, useLocale } from "@/lib/locale-context"
import Image from "next/image"

export function SiteHeader() {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const isListingsPage = pathname.includes('/listings') || pathname.includes('/obiavi')
  const locale = useLocale()

  const href = (en: string, bg: string) => {
    if (locale === 'bg') return `/bg/${bg}`
    if (locale === 'ru') {
      const ruMap: Record<string, string> = {
        'listings': 'obyavleniya',
        'developers': 'zastroyshchiki',
        'about-mister-imot': 'o-mister-imot',
        'contact': 'kontakty',
        'blog': 'blog',
        'register?type=developer': 'register?type=developer',
        'login': 'login',
      }
      return `/ru/${ruMap[en] ?? en}`
    }
    return `/${en}`
  }

  return (
    <>
      
      <header className={`header-glass flex items-center justify-between pl-4 pr-0 sm:pl-6 sm:pr-6 md:px-8 py-4 ${isListingsPage ? 'hidden xl:flex' : ''}`}>
        <div className="w-full flex items-center justify-between md:grid md:grid-cols-3">
        {/* Logo (always visible) */}
        <div className={`flex items-center justify-start`}>
          <Link href="/" className="flex items-center space-x-3 group clickable cursor-pointer">
            <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 border border-white/20 cursor-pointer logo-circle">
              <Image
                src="https://ik.imagekit.io/ts59gf2ul/Logo/mr-imot-logo-no-background.png?tr=w-112,h-112,f-webp,q-85,fo-auto"
                alt={
                  locale === 'bg'
                    ? 'Лого на Мистър Имот'
                    : locale === 'ru'
                      ? 'Логотип Mister Imot'
                      : 'Mister Imot Logo'
                }
                width={56}
                height={56}
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
        <nav className="hidden md:flex items-center justify-center space-x-4">
          <a
            href={href('listings', 'obiavi')}
            className="text-white hover:text-white text-sm font-medium px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.listings}
          </a>
          <a
            href={href('developers', 'stroiteli')}
            className="text-white hover:text-white text-sm font-medium px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.developers}
          </a>
          <a
            href={href('blog', 'blog')}
            className="text-white hover:text-white text-sm font-medium px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.blog ?? 'Blog'}
          </a>
          <a
            href={href('about-mister-imot', 'za-mistar-imot')}
            className="text-white hover:text-white text-sm font-medium px-5 py-2.5 rounded-full bg-charcoal-500 border border-charcoal-600 shadow-sm hover:bg-charcoal-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-charcoal-300 active:scale-95"
          >
            {t.aboutUs}
          </a>
        </nav>

        {/* Right Side - Language Switcher + Auth + Mobile Nav */}
        <div className="flex items-center justify-end md:space-x-6">
          {/* Primary CTA - List Project */}
          <div className="hidden md:block">
            <Link href={href('register?type=developer', 'register?type=developer')} className="btn-shine inline-flex items-center px-6 py-2 rounded-full bg-charcoal-500 text-white text-xs font-semibold hover:bg-charcoal-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-charcoal-300 h-8 w-40 justify-center whitespace-nowrap">
              {t.listYourProject}
            </Link>
          </div>
          {/* Language Switcher - Hidden on mobile */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          
          {/* Desktop Auth Navigation - Hidden on mobile */}
          <div className="hidden md:block">
            <UserAuthNav />
          </div>
          
          {/* Mobile Navigation - Only visible on mobile, positioned at far right */}
          <div className="md:hidden flex items-center justify-end">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
    </>
  )
}

