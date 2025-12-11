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
  },
  {
    code: 'ru',
    name: 'Russian',
    flag: 'https://flagcdn.com/w20/ru.png',
    nativeName: 'Русский'
  },
  {
    code: 'gr',
    name: 'Greek',
    flag: 'https://flagcdn.com/w20/gr.png',
    nativeName: 'Ελληνικά'
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
      .replace(/^\/bg(?=\/|$)/, '')
      .replace(/^\/ru(?=\/|$)/, '')
      .replace(/^\/gr(?=\/|$)/, '') || '/'

    // 3. Normalize any localized "pretty" URLs back to canonical paths first
    const prettyToCanonical: Record<string, string> = {
      '/obiavi': '/listings',
      '/stroiteli': '/developers',
      '/za-mistar-imot': '/about-mister-imot',
      '/kontakt': '/contact',
      '/obyavleniya': '/listings',
      '/zastroyshchiki': '/developers',
      '/o-mister-imot': '/about-mister-imot',
      '/kontakty': '/contact',
      '/aggelies': '/listings',
      '/kataskeuastes': '/developers',
      '/sxetika-me-to-mister-imot': '/about-mister-imot',
      '/epikoinonia': '/contact',
      '/news': '/news',
      '/novini': '/news',
      '/novosti': '/news',
      '/nea': '/news',
      '/eidhseis': '/news',
    }
    for (const [from, to] of Object.entries(prettyToCanonical)) {
      if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
        pathWithoutLocale = pathWithoutLocale.replace(from, to)
        break
      }
    }

    // 3b. Check if we're on an article page and have alternate slugs available
    const alternateSlugs = (window as unknown as { __articleAlternateSlugs?: Record<string, string> }).__articleAlternateSlugs
    const isNewsArticle = pathWithoutLocale.startsWith('/news/') && pathWithoutLocale !== '/news/'
    
    if (isNewsArticle && alternateSlugs) {
      // Extract the current slug and replace with the target locale's slug
      const targetSlug = alternateSlugs[newLocale as keyof typeof alternateSlugs]
      if (targetSlug) {
        // Build the news path for the target locale
        const newsPathMap: Record<string, string> = {
          en: '/news',
          bg: '/novini',
          ru: '/novosti',
          gr: '/eidhseis',
        }
        const newsPath = newsPathMap[newLocale] || '/news'
        const newPath = newLocale === 'en' 
          ? `${newsPath}/${targetSlug}`
          : `/${newLocale}${newsPath}/${targetSlug}`
        
        const queryString = searchParams.toString()
        const finalPath = queryString ? `${newPath}?${queryString}` : newPath
        window.location.href = finalPath
        return
      }
    }

    // 4. Map canonical paths to the target locale's pretty URLs
    if (newLocale === 'bg') {
      const canonicalToBg: Record<string, string> = {
        '/listings': '/obiavi',
        '/developers': '/stroiteli',
        '/about-mister-imot': '/za-mistar-imot',
        '/contact': '/kontakt',
        '/news': '/novini',
      }
      for (const [from, to] of Object.entries(canonicalToBg)) {
        if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
          pathWithoutLocale = pathWithoutLocale.replace(from, to)
          break
        }
      }
    } else if (newLocale === 'ru') {
      const canonicalToRu: Record<string, string> = {
        '/listings': '/obyavleniya',
        '/developers': '/zastroyshchiki',
        '/about-mister-imot': '/o-mister-imot',
        '/contact': '/kontakty',
        '/news': '/novosti',
      }
      for (const [from, to] of Object.entries(canonicalToRu)) {
        if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
          pathWithoutLocale = pathWithoutLocale.replace(from, to)
          break
        }
      }
    } else if (newLocale === 'gr') {
      const canonicalToGr: Record<string, string> = {
        '/listings': '/aggelies',
        '/developers': '/kataskeuastes',
        '/about-mister-imot': '/sxetika-me-to-mister-imot',
        '/contact': '/epikoinonia',
        '/news': '/eidhseis',
      }
      for (const [from, to] of Object.entries(canonicalToGr)) {
        if (pathWithoutLocale === from || pathWithoutLocale.startsWith(from + '/')) {
          pathWithoutLocale = pathWithoutLocale.replace(from, to)
          break
        }
      }
    }

    // 4. For English, use clean URLs without /en/ prefix (middleware rewrites internally)
    // For Bulgarian, prefix with /bg/
    const newPath = newLocale === 'en' 
      ? pathWithoutLocale  // Clean URL: /listings/[id] (middleware rewrites to /en/listings/[id] internally)
      : `/${newLocale}${pathWithoutLocale}`  // Localized prefixes: /bg/obiavi/[id], /ru/..., /gr/...
    
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
