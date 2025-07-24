"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Building, CreditCard, HelpCircle, Eye, MessageSquare, TrendingUp, Settings } from "lucide-react"
import Image from "next/image"

interface DeveloperDashboardHeroProps {
  companyName: string
  companyLogoUrl?: string
  planTier: string
  activeListings: number
  totalViews: number
  totalLeads: number
  onAddListing: () => void
  onManageCompany: () => void
  onBilling: () => void
  onSupport: () => void
}

export function DeveloperDashboardHero({
  companyName,
  companyLogoUrl,
  planTier,
  activeListings,
  totalViews,
  totalLeads,
  onAddListing,
  onManageCompany,
  onBilling,
  onSupport,
}: DeveloperDashboardHeroProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
          {/* Left side - Company info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                {companyLogoUrl ? (
                  <Image
                    src={companyLogoUrl || "/placeholder.svg"}
                    alt={`${companyName} logo`}
                    width={48}
                    height={48}
                    className="rounded-xl"
                  />
                ) : (
                  <Building className="h-8 w-8 text-white/80" />
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
                <div className="flex items-center gap-3">
                  <span className="text-xl text-white/90">{companyName}</span>
                  <Badge variant="secondary" className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-0">
                    {planTier} Plan
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{activeListings}</div>
                  <div className="text-sm text-white/70">Active Listings</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{totalViews.toLocaleString()}</div>
                  <div className="text-sm text-white/70">Total Views</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{totalLeads}</div>
                  <div className="text-sm text-white/70">Total Leads</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onAddListing}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Listing
              </Button>

              <Button
                variant="outline"
                onClick={onManageCompany}
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Building className="h-4 w-4 mr-2" />
                Manage Company
              </Button>

              <Button
                variant="outline"
                onClick={onBilling}
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Button>

              <Button
                variant="outline"
                onClick={onSupport}
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </Button>
            </div>
          </div>

          {/* Right side - Performance highlights */}
          <div className="w-full lg:w-80">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  This Month's Performance
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-white/70" />
                      <span className="text-sm text-white/90">Page Views</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">2,847</div>
                      <div className="text-xs text-emerald-400">+12.5%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-white/70" />
                      <span className="text-sm text-white/90">New Leads</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">71</div>
                      <div className="text-xs text-emerald-400">+8.2%</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/20">
                    <div className="text-xs text-white/70 mb-2">Quick Actions</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 text-xs bg-transparent"
                        onClick={onAddListing}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Listing
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 text-xs bg-transparent"
                        onClick={onManageCompany}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
