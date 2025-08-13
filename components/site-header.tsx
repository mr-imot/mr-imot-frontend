"use client"

import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { UserAuthNav } from "@/components/user-auth-nav"
import { MobileNav } from "@/components/mobile-nav"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10
      setIsScrolled(scrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled 
          ? "bg-background/98 backdrop-blur-xl shadow-xl border-b border-border/60" 
          : "bg-background/95 backdrop-blur-md shadow-sm border-b border-border/30",
        "h-16 md:h-20"
      )}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6">
        {/* Logo/Brand Section */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-200 group-hover:scale-105">
              <Image src="/images/mr-imot-logo-no-background.png" alt="Mr imot Logo" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-foreground leading-none tracking-tight">
                Mr imot
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <MainNav />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">EN</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                🇬🇧 English
              </DropdownMenuItem>
              <DropdownMenuItem>
                🇧🇬 Български
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
      {/* Sticky search bar removed per product decision */}
    </header>
  )
}

