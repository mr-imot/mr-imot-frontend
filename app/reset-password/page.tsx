import { Suspense } from 'react';
import { formatTitleWithBrand } from '@/lib/seo';
import type { Metadata } from 'next';
import ResetPasswordClient from './reset-password-client';

export async function generateMetadata(): Promise<Metadata> {
  const title = formatTitleWithBrand('Reset Password', 'en');
  return {
    title,
    robots: {
      index: false, // Don't index password reset pages
      follow: false,
    },
  };
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-ds-primary-50 via-white to-ds-accent-50 py-ds-8 px-ds-2 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ResetPasswordClient />
    </Suspense>
  );
}