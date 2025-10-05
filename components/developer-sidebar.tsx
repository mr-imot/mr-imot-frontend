"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home, 
  Building2, 
  BarChart3, 
  CreditCard,
  LogOut,
  Menu,
  X,
  User,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DeveloperSidebarProps {
  children: React.ReactNode
  dict?: any
  lang?: 'en' | 'bg'
}

export function DeveloperSidebar({ children, dict, lang }: DeveloperSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Create navigation items with translations
  const navigationItems = [
    { 
      icon: Home, 
      label: dict?.sidebar?.dashboard || "Dashboard", 
      href: lang === 'bg' ? "/bg/developer/dashboard" : "/developer/dashboard",
      description: dict?.sidebar?.dashboardDescription || "Overview & insights"
    },
    { 
      icon: Building2, 
      label: dict?.sidebar?.properties || "Properties", 
      href: lang === 'bg' ? "/bg/developer/properties" : "/developer/properties",
      description: dict?.sidebar?.propertiesDescription || "Manage listings"
    },
    { 
      icon: BarChart3, 
      label: dict?.sidebar?.analytics || "Analytics", 
      href: lang === 'bg' ? "/bg/developer/analytics" : "/developer/analytics",
      description: dict?.sidebar?.analyticsDescription || "Performance metrics"
    },
    { 
      icon: CreditCard, 
      label: dict?.sidebar?.billing || "Billing", 
      href: lang === 'bg' ? "/bg/developer/billing" : "/developer/billing",
      description: dict?.sidebar?.billingDescription || "Subscription & plans"
    },
    { 
      icon: User, 
      label: dict?.sidebar?.profile || "Profile", 
      href: lang === 'bg' ? "/bg/developer/profile" : "/developer/profile",
      description: dict?.sidebar?.profileDescription || "Account settings"
    },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setSidebarOpen(false) // Close mobile sidebar after navigation
  }

  const handleLogout = async () => {
    await logout()
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    const email = user.email || ""
    const company = user.company_name || ""
    
    if (company) {
      return company.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  // Get display name
  const getDisplayName = () => {
    if (!user) return "Developer"
    return user.company_name || user.email?.split('@')[0] || "Developer"
  }

  return (
    <div className="flex h-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-72 bg-background border-r border-border/50 lg:block flex flex-col",
        sidebarOpen ? "fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-card/95 via-card to-card/80 backdrop-blur-sm" : "hidden"
      )}>
        {/* Brand Header */}
        <div className="flex items-center gap-3 p-6 border-b border-border/50">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg grid place-items-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground tracking-tight">Mr imot</h1>
            <p className="text-xs text-muted-foreground font-medium">{dict?.sidebar?.developerPortal || "Developer Portal"}</p>
          </div>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-accent"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/developer/dashboard')
              const Icon = item.icon
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative",
                    isActive 
                      ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg" 
                      : "text-muted-foreground hover:bg-accent/70 hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <div className="flex flex-col items-start">
                    <span className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}>
                      {item.label}
                    </span>
                    <span className={cn(
                      "text-xs",
                      isActive ? "text-primary-foreground/80" : "text-muted-foreground group-hover:text-foreground/70"
                    )}>
                      {item.description}
                    </span>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out */}
        <div className="border-t border-border/50 p-4 space-y-4">
          {user && (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3 shadow-sm">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage 
                  src={user.profile_image_url} 
                  alt={`${getDisplayName()} profile`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-bold text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              {user.verification_status === 'verified' && (
                <Badge 
                  variant="default"
                  className="text-xs px-2 py-1 bg-green-500 text-white border-0"
                >
                  ✓ {dict?.sidebar?.verified || "Verified"}
                </Badge>
              )}
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent font-medium rounded-xl p-3 h-auto"
          >
            <LogOut className="h-4 w-4" />
            {dict?.sidebar?.signOut || "Sign out"}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 lg:hidden bg-card/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Main content with proper scrolling */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
