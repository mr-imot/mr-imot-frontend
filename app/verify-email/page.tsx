import { Suspense } from 'react';
import { formatTitleWithBrand } from '@/lib/seo';
import type { Metadata } from 'next';
import VerifyEmailClient from './verify-email-client';

export async function generateMetadata(): Promise<Metadata> {
  const title = formatTitleWithBrand('Verify Email', 'en');
  return {
    title,
    robots: {
      index: false, // Don't index email verification pages
      follow: false,
    },
  };
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <VerifyEmailClient />
    </Suspense>
  );
}
