import { ProtectedRoute } from "@/components/protected-route"

export default function DeveloperLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="developer" redirectTo="/login">
      {children}
    </ProtectedRoute>
  )
}
