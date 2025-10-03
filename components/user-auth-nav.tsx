"use client";

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useTranslations } from "@/lib/locale-context"
import { LogOut } from "lucide-react"

export function UserAuthNav() {
  const { user, isAuthenticated, isLoading, logout, getDashboardUrl } = useAuth();
  const t = useTranslations('navigation');

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        {/* Loading placeholder that matches the login button dimensions */}
        <div className="h-8 w-24 bg-white/20 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const userInitials = user.email
      ? user.email.substring(0, 2).toUpperCase()
      : 'U';

    return (
      <div className="flex items-center space-x-4">
        {/* User Avatar with Gooey Logout Effect */}
        <div className="group relative overflow-hidden rounded-full w-20 h-10 bg-white hover:bg-white/90 transition-colors duration-300">
          {/* Dashboard Link (Avatar) */}
          <Link 
            href={getDashboardUrl()}
            className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-full text-black font-normal text-sm cursor-pointer transition-transform duration-300 ease-out group-hover:-translate-x-1"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-transparent text-black text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Logout Icon (slides in from right) */}
          <LogOut 
            onClick={logout}
            className="absolute top-1/2 right-2 w-4 h-4 -translate-y-1/2 text-black transition-all duration-300 ease-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 hover:text-red-600 cursor-pointer"
          />
          
          {/* User Type Label */}
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 font-medium capitalize whitespace-nowrap">
            {user.user_type}
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated - show the branded login button
  return (
    <Link href="/login">
      <button className="group relative overflow-hidden px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-colors duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-between w-24">
        <span className="transition-transform duration-300 ease-out group-hover:-translate-x-1 cursor-pointer">
          {t.login}
        </span>
        <svg className="w-3 h-3 transition-all duration-300 ease-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
        </svg>
      </button>
    </Link>
  );
}
