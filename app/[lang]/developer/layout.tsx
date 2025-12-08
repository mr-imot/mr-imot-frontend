import { ProtectedRoute } from "@/components/protected-route"
import { formatTitleWithBrand } from "@/lib/seo"
import type { Metadata } from "next"

interface DeveloperLayoutProps {
  children: React.ReactNode
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export async function generateMetadata({ params }: DeveloperLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const title = formatTitleWithBrand(
    lang === 'bg' ? 'Панел за строители' : 'Developer Dashboard',
    lang
  )

  return {
    title,
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
