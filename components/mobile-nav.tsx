"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User, Settings } from "lucide-react"
import { useUnifiedAuth } from "@/lib/unified-auth"
import { cn } from "@/lib/utils"

// Auth Actions Component for Mobile
function AuthActionsSection({ onLinkClick }: { onLinkClick: () => void }) {
  const { user, isAuthenticated, logout, getDashboardUrl } = useUnifiedAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col space-y-4">
        {/* User Info */}
        <div className="px-4 py-3 bg-ds-neutral-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-ds-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-ds-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ds-neutral-900 truncate">{user.email}</p>
              <p className="text-xs text-ds-neutral-500 capitalize">{user.user_type} Account</p>
            </div>
          </div>
        </div>

        {/* Dashboard Link */}
        <Link
          href={getDashboardUrl()}
          onClick={onLinkClick}
          className="flex items-center space-x-3 text-lg font-medium text-ds-neutral-700 hover:text-ds-primary-600 py-3 px-4 rounded-lg hover:bg-ds-neutral-50 transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            onLinkClick();
          }}
          className="flex items-center space-x-3 text-lg font-medium text-red-600 hover:text-red-700 py-3 px-4 rounded-lg hover:bg-red-50 transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    );
  }

  // Not authenticated
  return (
    <div className="flex flex-col space-y-4">
      <Link
        href="/login"
        onClick={onLinkClick}
        className="text-lg font-medium text-ds-neutral-700 hover:text-ds-primary-600 py-3 px-4 rounded-lg hover:bg-ds-neutral-50 transition-all duration-200"
      >
        Sign In
      </Link>
      <Button
        asChild
        className="bg-ds-primary-600 hover:bg-ds-primary-700 text-white font-semibold py-3 h-12 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Link href="/register?type=developer" onClick={onLinkClick}>
          List Your Project
        </Link>
      </Button>
    </div>
  );
}

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
          <AuthActionsSection onLinkClick={handleLinkClick} />

          {/* Footer Info */}
          <div className="mt-auto pt-8 border-t border-ds-neutral-200">
            <p className="text-sm text-ds-neutral-500 text-center">Connect directly with developers</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
