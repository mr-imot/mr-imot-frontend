"use client"

import Link from "next/link"
import { UserAuthNav } from "@/components/user-auth-nav"
import Image from "next/image"

export function SiteHeader() {

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

        {/* Navigation - CENTER */}
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

        {/* Auth Navigation - RIGHT SIDE */}
        <UserAuthNav />
      </div>
    </header>
    </>
  )
}

