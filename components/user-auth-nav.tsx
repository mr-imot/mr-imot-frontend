"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUnifiedAuth } from "@/lib/unified-auth"
import { LogOut, User, Settings, ChevronDown, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserAuthNav() {
  const { user, isAuthenticated, isLoading, logout, getDashboardUrl } = useUnifiedAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const userInitials = user.email
      ? user.email.substring(0, 2).toUpperCase()
      : 'U';

    return (
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user.user_type} Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={getDashboardUrl()} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Not authenticated - show login/register
  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/login"
        className="text-base font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
      >
        Sign In
      </Link>
      <Button
        asChild
        className="font-semibold px-6 py-2 h-10 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Link href="/register?type=developer">List Your Project</Link>
      </Button>
    </div>
  );
}
