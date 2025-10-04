"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export function EnhancedHeroButton() {
  const locale = useLocale()

  // Helper function to generate localized URLs
  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  return (
    <Button
      asChild
      size="lg"
      className="relative bg-ds-primary-600 text-white hover:bg-ds-primary-700 active:bg-ds-primary-800 px-10 py-6 h-12 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 group overflow-hidden"
    >
      <Link href={href('listings', 'obiavi')}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-ds-primary-700 via-ds-primary-600 to-ds-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

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
