"use client"

import { useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: 'https://flagcdn.com/w20/us.png',
    nativeName: 'English'
  },
  {
    code: 'bg', 
    name: 'Bulgarian',
    flag: 'https://flagcdn.com/w20/bg.png',
    nativeName: 'Български'
  }
]

export function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentLocale = useLocale()

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  const handleLanguageChange = (newLocale: string) => {
    // Don't do anything if already on this locale
    if (newLocale === currentLocale || isSwitching) {
      setIsOpen(false)
      return
    }
    
    // Set loading state
    setIsSwitching(true)
    setIsOpen(false)
    
    // 1. Set cookie FIRST (before navigation) - this is critical!
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    
    // 2. Remove existing locale segment if present
    let pathWithoutLocale = pathname
      .replace(/^\/en(?=\/|$)/, '')
      .replace(/^\/bg(?=\/|$)/, '') || '/'

    // 3. Handle pretty URL mapping for Bulgarian routes
    // Use robust replacement that preserves dynamic segments (like listing IDs)
    if (newLocale === 'en') {
      // Map Bulgarian pretty URLs to English canonical paths
      const prettyUrlMap: Record<string, string> = {
        '/obiavi': '/listings',
        '/stroiteli': '/developers', 
        '/za-mistar-imot': '/about-mister-imot',
        '/kontakt': '/contact'
      }
      
      // Check if path starts with any mapped route (handles dynamic segments)
      for (const [from, to] of Object.entries(prettyUrlMap)) {
        if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
          // Replace only the prefix, preserving the rest (including dynamic segments like IDs)
          pathWithoutLocale = pathWithoutLocale.replace(from, to)
          break
        }
      }
    } else if (newLocale === 'bg') {
      // Map English canonical paths to Bulgarian pretty URLs
      const canonicalUrlMap: Record<string, string> = {
        '/listings': '/obiavi',
        '/developers': '/stroiteli',
        '/about-mister-imot': '/za-mistar-imot',
        '/contact': '/kontakt'
      }
      
      // Check if path starts with any mapped route (handles dynamic segments)
      for (const [from, to] of Object.entries(canonicalUrlMap)) {
        if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
          // Replace only the prefix, preserving the rest (including dynamic segments like IDs)
          pathWithoutLocale = pathWithoutLocale.replace(from, to)
          break
        }
      }
    }

    // 4. For English, use clean URLs without /en/ prefix (middleware rewrites internally)
    // For Bulgarian, prefix with /bg/
    const newPath = newLocale === 'en' 
      ? pathWithoutLocale  // Clean URL: /listings/[id] (middleware rewrites to /en/listings/[id] internally)
      : `/${newLocale}${pathWithoutLocale}`  // Bulgarian: /bg/obiavi/[id]
    
    // 5. Preserve query parameters (e.g., ?type=developer)
    const queryString = searchParams.toString()
    const finalPath = queryString ? `${newPath}?${queryString}` : newPath
    
    // 6. Use window.location for full page reload to ensure cookie is picked up immediately
    // This prevents race conditions that cause 404 errors
    window.location.href = finalPath
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          disabled={isSwitching}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img 
            src={currentLanguage.flag} 
            alt={currentLanguage.name}
            className="w-6 h-4 rounded-sm object-cover cursor-pointer"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white/95 backdrop-blur-sm border border-white/20 shadow-xl"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleLanguageChange(language.code)
            }}
            disabled={isSwitching}
            className={`flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors ${
              language.code === currentLocale 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-gray-50'
            } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
