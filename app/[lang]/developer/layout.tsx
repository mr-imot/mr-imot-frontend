import { ProtectedRoute } from "@/components/protected-route"
import type { Metadata } from "next"

interface DeveloperLayoutProps {
  children: React.ReactNode
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: DeveloperLayoutProps): Promise<Metadata> {
  return {
    robots: {
      index: false, // All developer dashboard pages should not be indexed
      follow: false,
    },
  }
}

export default async function DeveloperLayout({
  children,
  params,
}: DeveloperLayoutProps) {
  const { lang } = await params
  
  return (
    <ProtectedRoute requiredRole="developer" redirectTo={`/${lang}/login`}>
      {children}
    </ProtectedRoute>
  )
}
