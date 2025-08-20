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
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative text-gray-700 hover:text-gray-900 hover:bg-white/60 transition-all duration-200"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-2 hover:bg-white/60 transition-all duration-200"
              style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Avatar className="h-8 w-8 ring-2 ring-white/30">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {user.email}
                </p>
                <p className="text-xs text-gray-600 capitalize font-medium">{user.user_type}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-600" />
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
        className="text-base font-semibold text-gray-700 hover:text-gray-900 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-white/40"
        style={{
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}
      >
        Sign In
      </Link>
      <Button
        asChild
        className="font-semibold px-6 py-2 h-10 bg-white/90 text-gray-900 hover:bg-white hover:shadow-lg transition-all duration-200 border border-white/20"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Link href="/register?type=developer">List Your Project</Link>
      </Button>
    </div>
  );
}
