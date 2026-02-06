"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, Settings, LogOut } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { useAuth } from "@/lib/auth-context"
import { registerDeveloperHref, listingsHref, developersHref, newsHref, aboutHref, loginHref, asLocale } from "@/lib/routes"
import { MobileLanguageSwitcher } from "@/components/mobile-language-switcher"
import { cn } from "@/lib/utils"

interface NavigationTranslations {
  listings: string
  developers: string
  blog?: string
  news?: string
  aboutUs: string
  listYourProject: string
  login: string
  navigation?: string
  language?: string
  connectDirectly?: string
  [key: string]: string | undefined
}

interface PublicMobileNavProps {
  translations: NavigationTranslations
  open?: boolean
  onOpenChange?: (open: boolean) => void
}


// Auth Actions Component - Shows login/register when not authenticated, user info/dashboard/logout when authenticated
function AuthActionsSection({ onLinkClick, t }: { onLinkClick: () => void; t: NavigationTranslations }) {
  const { user, isAuthenticated, isLoading, logout, getDashboardUrl } = useAuth();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="h-12 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
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

  // Not authenticated - show login and register
  return (
    <div className="flex flex-col space-y-4">
      <Link
        href={loginHref(asLocale(locale))}
        onClick={onLinkClick}
        className="text-lg font-medium text-foreground/80 hover:text-foreground py-3 px-4 rounded-lg hover:bg-muted transition-all duration-200"
      >
        {t.login}
      </Link>
      <Button
        asChild
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 h-12 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Link href={registerDeveloperHref(asLocale(locale))} onClick={onLinkClick}>
          {t.listYourProject}
        </Link>
      </Button>
    </div>
  );
}

export function PublicMobileNav({ 
  translations, 
  open: controlledOpen, 
  onOpenChange 
}: PublicMobileNavProps) {
  // Use controlled state if provided, otherwise fall back to internal state
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen
  
  const pathname = usePathname()
  const t = translations
  const locale = useLocale()

  const navItems = [
    { href: listingsHref(asLocale(locale)), label: t.listings },
    { href: developersHref(asLocale(locale)), label: t.developers },
    { href: newsHref(asLocale(locale)), label: t.news ?? t.blog ?? 'News' },
    { href: aboutHref(asLocale(locale)), label: t.aboutUs },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
  }

  const firstNavLinkRef = useRef<HTMLAnchorElement>(null)

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {/* Only render SheetTrigger if not controlled (for backward compatibility) */}
      {controlledOpen === undefined && (
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-14 w-14 p-0 rounded-full bg-white text-charcoal-800 shadow-[0_10px_24px_rgba(0,0,0,0.12)] border border-slate-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-200 cursor-pointer">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
      )}
      <SheetContent
        side="right"
        className="w-80 flex flex-col h-full"
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          firstNavLinkRef.current?.focus()
        }}
      >
        <SheetHeader className="text-left flex-shrink-0">
          <SheetTitle className="text-xl font-bold">{t.navigation ?? 'Navigation'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-6 mt-8 flex-1 overflow-y-auto pb-6">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                ref={index === 0 ? firstNavLinkRef : undefined}
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
          <MobileLanguageSwitcher onLinkClick={handleLinkClick} languageLabel={t.language} />

          {/* Divider */}
          <div className="border-t" />

          {/* Auth Actions - Shows login/register when not authenticated, user info/dashboard/logout when authenticated */}
          <AuthActionsSection onLinkClick={handleLinkClick} t={t} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
