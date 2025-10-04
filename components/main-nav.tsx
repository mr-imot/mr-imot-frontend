"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function MainNav() {
  const pathname = usePathname()
  const locale = useLocale()

  // Helper function to generate localized URLs
  const href = (en: string, bg: string) => {
    return locale === 'bg' ? `/bg/${bg}` : `/${en}`
  }

  const navItems = [
    { href: href('listings', 'obiavi'), label: "Listings" },
    { href: href('developers', 'stroiteli'), label: "Developers" },
    { href: href('about-us', 'za-nas'), label: "About Us" },
  ]

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navItems.map((item) => (
          <NavigationMenuItem key={item.href}>
            <NavigationMenuLink
              asChild
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent font-semibold transition-all duration-200",
                "hover:bg-white/60 hover:backdrop-blur-sm",
                pathname === item.href
                  ? "text-gray-900 bg-white/40"
                  : "text-gray-700 hover:text-gray-900"
              )}
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Link href={item.href}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
