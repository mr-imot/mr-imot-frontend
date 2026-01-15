"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { listingsHref, asLocale } from "@/lib/routes"

export function EnhancedHeroButton() {
  const locale = useLocale()

  return (
    <Button
      asChild
      size="lg"
      className="relative bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 px-10 py-6 h-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden"
    >
      <Link href={listingsHref(asLocale(locale))}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>

        {/* Button content */}
        <span className="relative z-10 flex items-center">
          Explore Projects
          <ChevronRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
        </span>
      </Link>
    </Button>
  )
}
