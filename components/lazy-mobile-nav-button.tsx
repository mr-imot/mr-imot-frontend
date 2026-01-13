"use client"

import { useCallback, useState } from "react"
import dynamic from "next/dynamic"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationTranslations {
  listings: string
  developers: string
  blog?: string
  news?: string
  aboutUs: string
  listYourProject: string
  login: string
  navigation?: string
  connectDirectly?: string
  [key: string]: string | undefined
}

const PublicMobileNav = dynamic(
  () =>
    import("@/components/public-mobile-nav").then((mod) => ({
      default: mod.PublicMobileNav,
    })),
  { ssr: false }
)

interface LazyMobileNavButtonProps {
  translations: NavigationTranslations
}

export function LazyMobileNavButton({ translations }: LazyMobileNavButtonProps) {
  const [open, setOpen] = useState(false)

  const prefetch = useCallback(() => {
    // Prefetch the chunk on first interaction (touchstart / mouseenter)
    // This makes the drawer open instantly when clicked
    import("@/components/public-mobile-nav")
  }, [])

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen)
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        aria-label="Open menu"
        className="h-14 w-14 p-0 rounded-full bg-white text-charcoal-800 shadow-[0_10px_24px_rgba(0,0,0,0.12)] border border-slate-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition-all duration-200 cursor-pointer"
        onMouseEnter={prefetch}
        onTouchStart={prefetch}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {open && (
        <PublicMobileNav
          translations={translations}
          open={open}
          onOpenChange={handleOpenChange}
        />
      )}
    </>
  )
}
