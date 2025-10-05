import { ProtectedRoute } from "@/components/protected-route"

interface DeveloperLayoutProps {
  children: React.ReactNode
  params: Promise<{
    lang: 'en' | 'bg'
  }>
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
