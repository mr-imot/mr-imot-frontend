"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useDeveloperDashboard } from "@/hooks/use-developer-dashboard"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { DeveloperSidebar } from "@/components/developer-sidebar"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Building2,
  Eye,
  Globe,
  Phone,
  Plus,
  TrendingUp,
  TrendingDown,
  Home,
  Settings,
  LogOut,
  User,
  BarChart3,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  Activity,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  MapPin,
  Calendar,
  ExternalLink,
  Layers,
  Grid3x3,
  Maximize2,
  Zap,
  ArrowUpRight,
  ArrowUpDown,
  Box,
  Sparkles,
  Lock,
} from "lucide-react"

interface DeveloperProfile {
  id: string
  email: string
  company_name: string
  contact_person: string
  phone: string
  office_address: string
  website: string
  verification_status: string
  created_at: string
}

// Professional Metric Card Component
function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = "positive",
  icon: Icon, 
  loading = false,
  onClick
}: {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: any
  loading?: boolean
  onClick?: () => void
}) {
  const changeColor = {
    positive: "text-emerald-600",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }[changeType]
  
  const IconComponent = changeType === "positive" ? TrendingUp : 
                        changeType === "negative" ? TrendingDown : Activity
  
  return (
    <Card className={`
      transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 
      border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm
      ${onClick ? 'cursor-pointer hover:border-primary/40 hover:bg-primary/5' : ''}
    `} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            {loading ? (
              <div className="w-20 h-10 bg-gradient-to-r from-muted to-muted/50 rounded-lg animate-pulse" />
            ) : (
              <p className="text-4xl font-bold text-foreground tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            {change && (
              <div className="flex items-center gap-2 mt-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  changeType === 'positive' ? 'text-white' :
                  changeType === 'negative' ? 'text-white' :
                  'bg-muted text-muted-foreground'
                }`} style={{
                  backgroundColor: changeType === 'positive' ? 'var(--brand-success)' :
                                   changeType === 'negative' ? 'var(--brand-error)' : undefined
                }}>
                  <IconComponent className="h-3 w-3" />
                  <span>{change}</span>
                </div>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="relative">
              <div className="p-4 bg-gradient-to-br from-primary/15 to-primary/25 rounded-2xl shadow-lg">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


// Main Dashboard Content
function DashboardContent({ dict, lang }: { dict: any, lang: 'en' | 'bg' }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [seriesEnabled, setSeriesEnabled] = useState({ views: true, website: true, phone: true })
  const { stats, analytics, projects, loading, error } = useDeveloperDashboard(selectedPeriod)
  const { canCreateProjects, user } = useAuth()
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'deleted'>("all")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortKey, setSortKey] = useState<'views' | 'websiteClicks' | 'phoneClicks' | 'dateCreated'>("dateCreated")
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>("desc")

  // Initialize filters from URL on mount
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const st = (searchParams.get('status') as 'all' | 'active' | 'paused' | 'deleted') || 'all'
    const pg = parseInt(searchParams.get('page') || '1', 10)
    const sk = (searchParams.get('sort') as typeof sortKey) || 'dateCreated'
    const sd = (searchParams.get('dir') as typeof sortDir) || 'desc'
    setSearch(q)
    setStatusFilter(st)
    setPage(Number.isFinite(pg) && pg > 0 ? pg : 1)
    setSortKey(sk)
    setSortDir(sd === 'asc' ? 'asc' : 'desc')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync URL with current filters
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (page > 1) params.set('page', String(page))
    if (sortKey !== 'dateCreated' || sortDir !== 'desc') {
      params.set('sort', sortKey)
      params.set('dir', sortDir)
    }
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [search, statusFilter, page, sortKey, sortDir, router, pathname])

  const handleAddListing = () => {
    router.push(`/${lang}/developer/properties/new`)
  }

  const handleViewAnalytics = () => {
    router.push(`/${lang}/developer/analytics`)
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dict.developer?.dashboard?.failedToLoadData || 'Failed to load dashboard data. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-background to-muted/20 overflow-auto">
      {/* Dashboard Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {dict.developer?.dashboard?.title || 'Dashboard'}
              </h1>
              <p className="text-muted-foreground text-lg">
                {dict.developer?.dashboard?.welcomeBack || "Welcome back! Here's what's happening with your properties."}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={canCreateProjects ? handleAddListing : undefined}
                      disabled={!canCreateProjects}
                      className={`h-11 px-6 shadow-md transition-all duration-200 ${
                        canCreateProjects 
                          ? 'hover:shadow-lg hover:-translate-y-0.5' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                      style={{
                        backgroundColor: canCreateProjects ? 'var(--brand-btn-primary-bg)' : 'var(--muted)',
                        color: canCreateProjects ? 'var(--brand-btn-primary-text)' : 'var(--muted-foreground)'
                      }}
                    >
                      {canCreateProjects ? (
                        <Plus className="h-4 w-4 mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      {dict.developer?.dashboard?.addProperty || 'Add Property'}
                    </Button>
                  </TooltipTrigger>
                  {!canCreateProjects && (
                    <TooltipContent side="bottom" align="end" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {dict.developer?.dashboard?.accountVerificationRequired || 'Account Verification Required'}
                        </p>
                        <p className="text-sm">
                          {dict.developer?.dashboard?.completeVerification || 'Complete verification to create and manage property listings'}
                        </p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </header>

      {/* Verification Status Banner - Only show for unverified accounts */}
      {(user?.verification_status === 'pending_email_verification' || 
        user?.verification_status === 'pending_manual_approval' || 
        (user?.verification_status && user.verification_status !== 'verified')) && (
        <div className="px-8 py-4">
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <strong>
                    {dict.developer?.dashboard?.accountPendingVerification || 'Account Pending Verification'}
                  </strong>
                  <p className="text-sm mt-1">
                    {dict.developer?.dashboard?.accountUnderReview || 'Your account is under review. You have limited access until verification is complete.'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900">
                    {dict.developer?.dashboard?.learnMore || 'Learn More'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700 dark:hover:bg-amber-900"
                    onClick={() => router.push(`/${lang}/contact`)}
                  >
                    {dict.developer?.dashboard?.contactSupport || 'Contact Support'}
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        
        {/* Key Metrics */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title={dict.developer?.dashboard?.activeProperties || 'Active Properties'}
              value={stats?.total_projects || 0}
              change={stats?.projects_growth}
              icon={Building2}
              loading={loading}
              onClick={() => router.push(`/${lang}/developer/properties`)}
            />
            <MetricCard
              title={dict.developer?.dashboard?.totalViews || 'Total Views'}
              value={stats?.total_views || 0}
              change={stats?.views_growth}
              changeType="positive"
              icon={Eye}
              loading={loading}
              onClick={handleViewAnalytics}
            />
            <MetricCard
              title={dict.developer?.dashboard?.websiteClicks || 'Website Clicks'}
              value={stats?.total_website_clicks || 0}
              change={stats?.website_clicks_growth}
              changeType="positive"
              icon={Globe}
              loading={loading}
              onClick={handleViewAnalytics}
            />
            <MetricCard
              title={dict.developer?.dashboard?.phoneClicks || 'Phone Clicks'}
              value={stats?.total_phone_clicks || 0}
              change={stats?.phone_clicks_growth}
              changeType={stats?.phone_clicks_growth?.startsWith('-') ? 'negative' : 'positive'}
              icon={Phone}
              loading={loading}
              onClick={handleViewAnalytics}
            />
          </div>
        </section>

        {/* Traffic & Engagement */}
        <section>
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
                    {dict.developer?.dashboard?.trafficEngagement || 'Traffic & Engagement'}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {dict.developer?.dashboard?.comprehensiveView || 'Comprehensive view of property views, website clicks and phone interactions'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {analytics ? (
                <>
                  <div className="flex items-center gap-6 pb-8 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="views-toggle" 
                        defaultChecked 
                        onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, views: !!v }))}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label htmlFor="views-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                        {dict.developer?.dashboard?.views || 'Views'}
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="website-toggle" 
                        defaultChecked 
                        onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, website: !!v }))}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <Label htmlFor="website-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                        {dict.developer?.dashboard?.websiteClicks || 'Website Clicks'}
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        id="phone-toggle" 
                        defaultChecked 
                        onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, phone: !!v }))}
                        style={{accentColor: 'var(--brand-gray-900)'}}
                      />
                      <Label htmlFor="phone-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                        {dict.developer?.dashboard?.phoneClicks || 'Phone Clicks'}
                      </Label>
                    </div>
                  </div>
                  <div className="pt-8">
                    <ChartContainer
                      config={{
                        views: { label: "Views", color: 'var(--brand-info)' },
                        website: { label: "Website", color: 'var(--brand-success)' },
                        phone: { label: "Phone", color: 'var(--brand)' },
                      }}
                      className="w-full h-80"
                    >
                  <AreaChart
                    data={(analytics.projects_views || []).map((v: number, i: number) => ({
                      day: `D${i+1}`,
                      views: v,
                      website: (analytics.website_clicks || [])[i] || 0,
                      phone: (analytics.phone_clicks || [])[i] || 0,
                    }))}
                    margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis width={36} tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {seriesEnabled.views && (
                      <Area type="monotone" dataKey="views" stroke="var(--color-views)" fill="var(--color-views)" fillOpacity={0.18} />
                    )}
                    {seriesEnabled.website && (
                      <Area type="monotone" dataKey="website" stroke="var(--color-website)" fill="var(--color-website)" fillOpacity={0.18} />
                    )}
                    {seriesEnabled.phone && (
                      <Area type="monotone" dataKey="phone" stroke="var(--color-phone)" fill="var(--color-phone)" fillOpacity={0.18} />
                    )}
                    </AreaChart>
                    </ChartContainer>
                  </div>
                </>
              ) : (
                <div className="h-80 w-full rounded-xl bg-gradient-to-r from-muted/50 to-muted/80 animate-pulse" />
              )}
            </CardContent>
          </Card>
        </section>


      </main>
    </div>
  )
}

export default function DeveloperDashboardClient({ dict, lang }: { dict: any, lang: 'en' | 'bg' }) {
  return (
    <ProtectedRoute requiredRole="developer">
      <DeveloperSidebar dict={dict} lang={lang}>
        <DashboardContent dict={dict} lang={lang} />
      </DeveloperSidebar>
    </ProtectedRoute>
  )
}
