"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"
import { listingsHref, developersHref, newsHref, aboutHref, asLocale } from "@/lib/routes"
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

  const navItems = [
    { href: listingsHref(asLocale(locale)), label: "Listings" },
    { href: developersHref(asLocale(locale)), label: "Developers" },
    { href: newsHref(asLocale(locale)), label: "News" },
    { href: aboutHref(asLocale(locale)), label: "About Us" },
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
                "hover:bg-accent/20 hover:backdrop-blur-sm",
                pathname === item.href
                  ? "text-foreground bg-accent/10"
                  : "text-foreground/80 hover:text-foreground"
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
