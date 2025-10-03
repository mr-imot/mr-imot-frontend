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
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/'
    
    // Add new locale to pathname
    const newPath = `/${newLocale}${pathWithoutLocale}`
    
    // Navigate to new path
    router.push(newPath)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 transition-all duration-200 text-white/80 hover:text-white"
        >
          <img 
            src={currentLanguage.flag} 
            alt={currentLanguage.name}
            className="w-6 h-4 rounded-sm object-cover"
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
