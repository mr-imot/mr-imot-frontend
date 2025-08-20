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
    <>
      
      <header className="relative z-20 flex items-center justify-between p-6">
        <div className="w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 border border-white/20">
              <Image
                src="/images/mr-imot-logo-no-background.png"
                alt="Mr. Imot Logo"
                width={56}
                height={56}
                className="w-14 h-14 object-contain drop-shadow-lg"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-3">
          <a
            href="/listings"
            className="text-white/80 hover:text-white text-sm font-light px-4 py-2.5 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Listings
          </a>
          <a
            href="/developers"
            className="text-white/80 hover:text-white text-sm font-light px-4 py-2.5 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Developers
          </a>
          <a
            href="/about-us"
            className="text-white/80 hover:text-white text-sm font-light px-4 py-2.5 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            About Us
          </a>
        </nav>

        {/* Login Button with Smooth Arrow Animation */}
        <Link href="/login">
          <button className="group relative overflow-hidden px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-colors duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-between w-24">
            <span className="transition-transform duration-300 ease-out group-hover:-translate-x-1">
              Login
            </span>
            <svg className="w-3 h-3 transition-all duration-300 ease-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
        </Link>
      </div>
    </header>
    </>
  )
}

