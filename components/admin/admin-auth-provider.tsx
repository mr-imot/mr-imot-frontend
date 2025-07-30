"use client"

// Admin Authentication Provider Component
// Provides admin authentication context to the entire application

import React from 'react';
import { AdminAuthContext, useAdminAuthProvider } from '@/lib/admin-auth';

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const authValue = useAdminAuthProvider();

  return (
    <AdminAuthContext.Provider value={authValue}>
      {children}
    </AdminAuthContext.Provider>
  );
} 