// Admin Layout Wrapper
// Provides authentication context to all admin pages

import { AdminAuthProvider } from '@/components/admin/admin-auth-provider';
import { formatTitleWithBrand } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = formatTitleWithBrand('Admin', 'en')
  return {
    title,
    robots: {
      index: false, // All admin pages should not be indexed
      follow: false,
    },
  }
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
} 