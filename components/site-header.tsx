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
  const isListingsPage = pathname.includes('/listings')
  const locale = useLocale()

  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  return (
    <>
      
      <header className={`relative z-20 flex items-center justify-between p-6 ${isListingsPage ? 'hidden xl:flex' : ''}`}>
        <div className="w-full flex items-center justify-between">
        {/* Logo (always visible) */}
        <div className={`flex items-center`}>
          <Link href="/" className="flex items-center space-x-3 group clickable cursor-pointer">
            <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 border border-white/20 cursor-pointer">
              <Image
                src="/images/mr-imot-logo-no-background.png"
                alt="Mr. Imot Logo"
                width={56}
                height={56}
                className="object-contain drop-shadow-lg cursor-pointer"
                priority
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Visible from md and up */}
        <nav className="hidden md:flex items-center space-x-3">
          <a
            href={href('listings', 'obiavi')}
            className="text-white/80 hover:text-white text-sm font-light px-4 py-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            {t.listings}
          </a>
          <a
            href={href('developers', 'stroiteli')}
            className="text-white/80 hover:text-white text-sm font-light px-4 py-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            {t.developers}
          </a>
          <a
            href={href('about-us', 'za-nas')}
            className="text-white/80 hover:text-white text-sm font-light px-4 py-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer"
          >
            {t.aboutUs}
          </a>
        </nav>

        {/* Right Side - Language Switcher + Auth + Mobile Nav */}
        <div className="flex items-center space-x-4">
          {/* Language Switcher - Hidden on mobile */}
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          
          {/* Desktop Auth Navigation - Hidden on mobile */}
          <div className="hidden md:block">
            <UserAuthNav />
          </div>
          
          {/* Mobile Navigation - Only visible on mobile */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
    </>
  )
}

