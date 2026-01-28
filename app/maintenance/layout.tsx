import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${getSiteUrl()}/maintenance`,
  },
}

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
