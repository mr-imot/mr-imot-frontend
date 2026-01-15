"use client";

import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { useLocale } from "@/lib/locale-context"
import { registerDeveloperHref } from "@/lib/routes"
import { LogOut } from "lucide-react"

interface NavigationTranslations {
  login: string
  [key: string]: string | undefined
}

interface UserAuthNavProps {
  translations: NavigationTranslations
}

export function UserAuthNav({ translations }: UserAuthNavProps) {
  const { user, isAuthenticated, isLoading, logout, getDashboardUrl } = useAuth();
  const t = translations;
  const locale = useLocale();

  // Helper function to generate localized URLs (no query strings)
  const href = (en: string, bg: string) => {
    if (locale === 'bg') return `/bg/${bg}`
    if (locale === 'ru') {
      const ruMap: Record<string, string> = {
        'login': 'login',
        'developer/dashboard': 'developer/dashboard',
        'listings': 'obyavleniya',
        'developers': 'zastroyshchiki',
        'about-mister-imot': 'o-mister-imot',
        'contact': 'kontakty',
        'news': 'novosti',
      }
      return `/ru/${ruMap[en] ?? en}`
    }
    if (locale === 'gr') {
      const grMap: Record<string, string> = {
        'login': 'login',
        'developer/dashboard': 'developer/dashboard',
        'listings': 'aggelies',
        'developers': 'kataskeuastes',
        'about-mister-imot': 'sxetika-me-to-mister-imot',
        'contact': 'epikoinonia',
        'news': 'nea',
      }
      return `/gr/${grMap[en] ?? en}`
    }
    return `/${en}`
  }

  // Fixed dimensions to prevent layout shift
  // Login button: h-8 w-24
  // Avatar container: w-20 h-10 (but we'll use fixed w-24 to match login button width)
  const fixedWidth = "w-24"; // Match login button width
  const fixedHeight = "h-8"; // Match login button height

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${fixedWidth} ${fixedHeight}`}>
        {/* Loading placeholder that matches both login button and avatar dimensions */}
        <div className={`${fixedHeight} ${fixedWidth} bg-white/20 rounded-full animate-pulse`}></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const userInitials = user.email
      ? user.email.substring(0, 2).toUpperCase()
      : 'U';

    return (
      <div className={`flex items-center justify-center ${fixedWidth} ${fixedHeight}`}>
        {/* User Avatar with Gooey Logout Effect - Fixed container dimensions */}
        <div className={`group relative overflow-hidden rounded-full ${fixedWidth} ${fixedHeight} bg-white hover:bg-white/90 transition-colors duration-300`}>
          {/* Dashboard Link (Avatar) - Fixed 40x40px */}
          <Link 
            href={getDashboardUrl()}
            className="absolute top-0 left-0 flex items-center justify-center w-10 h-10 rounded-full text-black font-normal text-sm cursor-pointer transition-transform duration-300 ease-out group-hover:-translate-x-1"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-transparent text-black text-sm font-semibold w-10 h-10 flex items-center justify-center">
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

  // Not authenticated - show the branded login button (fixed dimensions)
  return (
    <div className={`flex items-center justify-center ${fixedWidth} ${fixedHeight}`}>
      <Link href={href('login', 'login')}>
        <button className={`group relative overflow-hidden px-6 py-2 rounded-full bg-white text-black font-semibold text-xs transition-all duration-300 hover:bg-gray-50 cursor-pointer ${fixedHeight} flex items-center justify-between ${fixedWidth} border border-gray-200 shadow-sm hover:shadow-md`}>
          <span className="transition-transform duration-300 ease-out group-hover:-translate-x-1 cursor-pointer">
            {t.login}
          </span>
          <svg className="w-3 h-3 transition-all duration-300 ease-out transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </button>
      </Link>
    </div>
  );
}
