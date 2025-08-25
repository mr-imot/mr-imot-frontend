"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { DeveloperSidebar } from "@/components/developer-sidebar"
import { PendingApprovalMessage } from "@/components/pending-approval-message"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

export default function DeveloperPropertiesPage() {
  const { canCreateProjects } = useAuth()
  const router = useRouter()

  const handleAddProperty = () => {
    router.push('/developer/properties/new')
  }

  return (
    <ProtectedRoute requiredRole="developer">
      <DeveloperSidebar>
        <div className="p-6 w-full">
          <PendingApprovalMessage />
          
          <div className="mb-6">
            <div className="flex items-center justify-between py-4">
              <div>
                <h1 className="text-2xl font-bold">Your Properties</h1>
                <p className="text-muted-foreground">Create, update and manage your listings</p>
              </div>
              <Button 
                onClick={handleAddProperty}
                disabled={!canCreateProjects}
                className={!canCreateProjects ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>

          <div className="text-center py-12">
            <p className="text-muted-foreground">Properties page - temporarily simplified</p>
            <p className="text-sm text-muted-foreground mt-2">Full implementation will be restored after fixing the sidebar</p>
          </div>
        </div>
      </DeveloperSidebar>
    </ProtectedRoute>
  )
}