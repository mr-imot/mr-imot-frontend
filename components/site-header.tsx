"use client"

import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { UserAuthNav } from "@/components/user-auth-nav"
import { MobileNav } from "@/components/mobile-nav"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md transition-all duration-300 ease-in-out",
        isScrolled ? "shadow-lg border-b border-ds-neutral-200/50" : "shadow-sm border-b border-ds-neutral-100/30",
      )}
    >
      <div className="container flex h-16 md:h-18 items-center justify-between px-4 md:px-6">
        {/* Logo/Brand Section */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform duration-200 group-hover:scale-105">
              <Image src="/images/mrimot-logo.png" alt="MrImot Logo" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-ds-neutral-900 leading-none tracking-tight">
                MrImot
              </span>
              <span className="text-xs text-ds-neutral-500 leading-none hidden sm:block">Real Estate Directory</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <MainNav />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Desktop Auth Nav */}
          <div className="hidden md:flex">
            <UserAuthNav />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  )
}
