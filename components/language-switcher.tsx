"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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
  const pathname = usePathname()
  const router = useRouter()
  const currentLocale = useLocale()

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0]

  const handleLanguageChange = (newLocale: string) => {
    // 1. Set cookie FIRST (before navigation) - this is critical!
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    
    // 2. Remove existing locale segment if present
    let pathWithoutLocale = pathname
      .replace(/^\/en(?=\/|$)/, '')
      .replace(/^\/bg(?=\/|$)/, '') || '/'

    // 3. Handle pretty URL mapping for Bulgarian routes
    if (newLocale === 'en') {
      // Map Bulgarian pretty URLs to English canonical paths
      const prettyUrlMap: Record<string, string> = {
        '/obiavi': '/listings',
        '/stroiteli': '/developers', 
        '/za-nas': '/about-us',
        '/kontakt': '/contact'
      }
      
      if (prettyUrlMap[pathWithoutLocale]) {
        pathWithoutLocale = prettyUrlMap[pathWithoutLocale]
      }
    } else if (newLocale === 'bg') {
      // Map English canonical paths to Bulgarian pretty URLs
      const canonicalUrlMap: Record<string, string> = {
        '/listings': '/obiavi',
        '/developers': '/stroiteli',
        '/about-us': '/za-nas',
        '/contact': '/kontakt'
      }
      
      if (canonicalUrlMap[pathWithoutLocale]) {
        pathWithoutLocale = canonicalUrlMap[pathWithoutLocale]
      }
    }

    // 4. For English, navigate to root; for others, prefix
    const newPath = newLocale === 'en' ? pathWithoutLocale : `/${newLocale}${pathWithoutLocale}`
    
    // 5. Navigate and force a full refresh to ensure cookie is picked up
    router.push(newPath)
    router.refresh()
    
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white cursor-pointer"
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
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center space-x-3 px-4 py-3 cursor-pointer transition-colors ${
              language.code === currentLocale 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-gray-50'
            }`}
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
