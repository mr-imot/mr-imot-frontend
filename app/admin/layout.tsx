// Admin Layout Wrapper
// Provides authentication context to all admin pages

import { AdminAuthProvider } from '@/components/admin/admin-auth-provider';


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