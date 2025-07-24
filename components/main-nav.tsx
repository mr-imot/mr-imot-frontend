"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function MainNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/listings", label: "Listings" },
    { href: "/developers", label: "Developers" },
    { href: "/about-us", label: "About Us" },
  ]

  return (
    <nav className="flex items-center space-x-8">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative text-base font-medium transition-all duration-200 hover:text-ds-primary-600 group",
            pathname === item.href ? "text-ds-primary-600" : "text-ds-neutral-700 hover:text-ds-primary-600",
          )}
        >
          {item.label}
          {/* Active indicator */}
          <span
            className={cn(
              "absolute -bottom-1 left-0 h-0.5 bg-ds-primary-600 transition-all duration-200",
              pathname === item.href ? "w-full" : "w-0 group-hover:w-full",
            )}
          />
        </Link>
      ))}
    </nav>
  )
}
