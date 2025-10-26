"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User, Settings, Globe } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTranslations, useLocale } from "@/lib/locale-context"
import { cn } from "@/lib/utils"

// Auth Actions Component for Mobile
function AuthActionsSection({ onLinkClick, t }: { onLinkClick: () => void; t: any }) {
  const { user, isAuthenticated, logout, getDashboardUrl } = useAuth();
  const locale = useLocale();

  // Helper function to generate localized URLs
  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col space-y-4">
        {/* User Info */}
        <div className="px-4 py-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.user_type} Account</p>
            </div>
          </div>
        </div>

        {/* Dashboard Link */}
        <Link
          href={getDashboardUrl()}
          onClick={onLinkClick}
          className="flex items-center space-x-3 text-lg font-medium text-foreground/80 hover:text-foreground py-3 px-4 rounded-lg hover:bg-muted transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            onLinkClick();
          }}
          className="flex items-center space-x-3 text-lg font-medium text-red-600 hover:text-red-700 py-3 px-4 rounded-lg hover:bg-red-50 transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  // Not authenticated
  return (
    <div className="flex flex-col space-y-4">
      <Link
        href={href('login', 'login')}
        onClick={onLinkClick}
        className="text-lg font-medium text-foreground/80 hover:text-foreground py-3 px-4 rounded-lg hover:bg-muted transition-all duration-200"
      >
        {t.login}
      </Link>
      <Button
        asChild
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 h-12 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Link href={href('register?type=developer', 'register?type=developer')} onClick={onLinkClick}>
          {t.listYourProject}
        </Link>
      </Button>
    </div>
  );
}

// Mobile Language Switcher Component
function MobileLanguageSwitcher({ onLinkClick }: { onLinkClick: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()

  const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w20/us.png', nativeName: 'English' },
    { code: 'bg', name: 'Bulgarian', flag: 'https://flagcdn.com/w20/bg.png', nativeName: 'Български' }
  ]

  const handleLanguageChange = (newLocale: string) => {
    // Remove existing locale segment if present
    let pathWithoutLocale = pathname
      .replace(/^\/en(?=\/|$)/, '')
      .replace(/^\/bg(?=\/|$)/, '') || '/'

    // Handle pretty URL mapping for Bulgarian routes
    if (newLocale === 'en') {
      // Map Bulgarian pretty URLs to English canonical paths
      const prettyUrlMap: Record<string, string> = {
        '/obiavi': '/listings',
        '/stroiteli': '/developers', 
        '/za-nas': '/about-us',
        '/kontakt': '/contact'
      }
      
      // Check if path starts with any mapped route (handles dynamic segments)
      for (const [from, to] of Object.entries(prettyUrlMap)) {
        if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
          pathWithoutLocale = pathWithoutLocale.replace(from, to)
          break
        }
      }
    } else if (newLocale === 'bg') {
      // Map English canonical paths to Bulgarian pretty URLs
      const canonicalUrlMap: Record<string, string> = {
        '/listings': '/obiavi',
        '/developers': '/stroiteli',
        '/about-us': '/za-nas',
        '/contact': '/kontakt'
      }
      
      // Check if path starts with any mapped route (handles dynamic segments)
      for (const [from, to] of Object.entries(canonicalUrlMap)) {
        if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
          pathWithoutLocale = pathWithoutLocale.replace(from, to)
          break
        }
      }
    }

    // For English, navigate to root; for others, prefix
    const newPath = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
    router.push(newPath)
    // Persist preference so middleware honors it (standardized to NEXT_LOCALE)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    onLinkClick()
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Language</h3>
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={cn(
            "w-full flex items-center space-x-3 text-left py-3 px-4 rounded-lg transition-all duration-200",
            language.code === currentLocale 
              ? "bg-primary/10 text-primary font-medium" 
              : "text-foreground/80 hover:text-foreground hover:bg-muted"
          )}
        >
          <img 
            src={language.flag} 
            alt={language.name}
            className="w-5 h-3 rounded-sm object-cover"
          />
          <span className="text-sm font-medium">{language.code.toUpperCase()}</span>
          {language.code === currentLocale && (
            <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const locale = useLocale()
  const href = (en: string, bg: string) => (locale === 'bg' ? `/bg/${bg}` : `/${en}`)

  const navItems = [
    { href: href('listings', 'obiavi'), label: t.listings },
    { href: href('developers', 'stroiteli'), label: t.developers },
    { href: href('about-us', 'za-nas'), label: t.aboutUs },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-14 w-14 p-0 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 border border-white/20 cursor-pointer">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold">{t.navigation}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-6 mt-8">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "text-lg font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-muted",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t" />

          {/* Language Switcher */}
          <MobileLanguageSwitcher onLinkClick={handleLinkClick} />

          {/* Divider */}
          <div className="border-t" />

          {/* Auth Actions */}
          <AuthActionsSection onLinkClick={handleLinkClick} t={t} />

          {/* Footer Info */}
          <div className="mt-auto pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center">{t.connectDirectly}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
