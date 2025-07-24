"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/listings", label: "Listings" },
    { href: "/developers", label: "Developers" },
    { href: "/about-us", label: "About Us" },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2 h-10 w-10 hover:bg-ds-neutral-100">
          <Menu className="h-5 w-5 text-ds-neutral-700" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-white">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold text-ds-neutral-900">Navigation</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col space-y-6 mt-8">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  "text-lg font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-ds-neutral-50",
                  pathname === item.href
                    ? "text-ds-primary-600 bg-ds-primary-50"
                    : "text-ds-neutral-700 hover:text-ds-primary-600",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t border-ds-neutral-200" />

          {/* Auth Actions */}
          <div className="flex flex-col space-y-4">
            <Link
              href="/login"
              onClick={handleLinkClick}
              className="text-lg font-medium text-ds-neutral-700 hover:text-ds-primary-600 py-3 px-4 rounded-lg hover:bg-ds-neutral-50 transition-all duration-200"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-3 h-12 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Link href="/register?type=developer" onClick={handleLinkClick}>
                List Your Project
              </Link>
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-auto pt-8 border-t border-ds-neutral-200">
            <p className="text-sm text-ds-neutral-500 text-center">Connect directly with developers</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
