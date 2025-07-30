"use client"

// Admin Dashboard Layout Component
// Provides the main layout structure for all admin pages

import React, { useState } from 'react';
import { useAdminAuth } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  Shield,
  Activity,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and statistics',
  },
  {
    name: 'Developer Management',
    href: '/admin/developers',
    icon: Users,
    description: 'Verify and manage developers',
  },
  {
    name: 'System Activity',
    href: '/admin/activity',
    icon: Activity,
    description: 'View system logs and activity',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Admin settings and configuration',
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAdminAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left side - Logo and mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <MobileSidebar 
                  navigation={navigation}
                  pathname={pathname}
                  onClose={() => setMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-500">MrImot Real Estate</p>
              </div>
            </div>
          </div>

          {/* Right side - Notifications and user menu */}
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
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <nav className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5',
                        pathname === item.href ? 'text-blue-600' : 'text-gray-400'
                      )}
                    />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Mobile sidebar component
function MobileSidebar({ 
  navigation, 
  pathname, 
  onClose 
}: { 
  navigation: NavItem[];
  pathname: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-500">MrImot Real Estate</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === item.href
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    pathname === item.href ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 