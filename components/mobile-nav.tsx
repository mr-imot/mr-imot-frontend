"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

// Auth Actions Component for Mobile
function AuthActionsSection({ onLinkClick }: { onLinkClick: () => void }) {
  const { user, isAuthenticated, logout, getDashboardUrl } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col space-y-4">
        {/* User Info */}
        <div className="px-4 py-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.user_type} Account</p>
            </div>
          </div>
        </div>

        {/* Dashboard Link */}
        <Link
          href={getDashboardUrl()}
          onClick={onLinkClick}
          className="flex items-center space-x-3 text-lg font-medium text-foreground/80 hover:text-foreground py-3 px-4 rounded-lg hover:bg-muted transition-all duration-200"
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
        className="text-lg font-medium text-foreground/80 hover:text-foreground py-3 px-4 rounded-lg hover:bg-muted transition-all duration-200"
      >
        Sign In
      </Link>
      <Button
        asChild
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 h-12 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
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
        <Button variant="ghost" size="sm" className="p-2 h-10 w-10">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl font-bold">Navigation</SheetTitle>
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
                  "text-lg font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:bg-muted",
                  pathname === item.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground/80 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="border-t" />

          {/* Auth Actions */}
          <AuthActionsSection onLinkClick={handleLinkClick} />

          {/* Footer Info */}
          <div className="mt-auto pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center">Connect directly with developers</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
