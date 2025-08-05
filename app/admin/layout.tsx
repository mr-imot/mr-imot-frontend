// Admin Layout Wrapper
// Provides authentication context to all admin pages

import { AdminAuthProvider } from '@/components/admin/admin-auth-provider';
import { UnifiedAuthProvider } from '@/lib/unified-auth';

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