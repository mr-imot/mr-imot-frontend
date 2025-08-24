"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useDeveloperDashboard } from "@/hooks/use-developer-dashboard"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
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
  Cube,
  Sparkles,
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
      transition-all duration-300 ease-out hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 
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

// Premium Navigation Sidebar with Mr imot Branding
function DashboardSidebar({ profile }: { profile: DeveloperProfile | null }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const navigationItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      href: "/developer/dashboard",
      description: "Overview & insights"
    },
    { 
      icon: Building2, 
      label: "Properties", 
      href: "/developer/properties",
      description: "Manage listings"
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      href: "/developer/analytics",
      description: "Performance metrics"
    },
    { 
      icon: MessageSquare, 
      label: "Inquiries", 
      href: "/developer/inquiries",
      description: "Customer messages"
    },
    { 
      icon: User, 
      label: "Profile", 
      href: "/developer/profile",
      description: "Company details"
    },
    { 
      icon: Settings, 
      label: "Settings", 
      href: "/developer/settings",
      description: "Account preferences"
    },
  ]

  const handleNavigation = (href: string) => router.push(href)

  const { logout } = useAuth()
  
  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      <Sidebar className="md:top-16 border-r border-border/50 bg-gradient-to-b from-background to-muted/30" variant="inset">
        <SidebarHeader className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-6">
            <div className="relative">
              <div 
                className="w-11 h-11 rounded-xl shadow-lg grid place-items-center" 
                style={{backgroundColor: 'var(--brand-gray-900)'}}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" style={{backgroundColor: 'var(--brand-success)'}} />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground tracking-tight">Mr imot</h1>
              <p className="text-xs text-muted-foreground font-medium">Developer Portal</p>
            </div>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarMenu className="gap-2">
              {navigationItems.map((item) => {
                const isActive = pathname ? pathname.startsWith(item.href) : false
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        h-12 px-4 rounded-xl transition-all duration-200 ease-out group
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 font-medium' 
                          : 'hover:bg-accent/70 hover:text-accent-foreground hover:shadow-sm'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                      }`} />
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-medium ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                          {item.label}
                        </span>
                        <span className={`text-xs ${
                          isActive ? 'text-primary-foreground/80' : 'text-muted-foreground group-hover:text-foreground/70'
                        }`}>
                          {item.description}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-border/50 bg-background/95 backdrop-blur-sm p-4">
          {profile && (
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3 shadow-sm hover:shadow-md transition-all duration-200">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-bold text-sm">
                  {profile.company_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">
                  {profile.company_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
              </div>
              <Badge 
                variant={profile.verification_status === 'verified' ? 'default' : 'secondary'} 
                className="text-xs px-2 py-1 text-white"
                style={{
                  backgroundColor: profile.verification_status === 'verified' ? 'var(--brand-success)' : 'var(--brand-warning)'
                }}
              >
                {profile.verification_status === 'verified' ? '✓ Verified' : 'Pending'}
              </Badge>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarRail className="md:top-16" />
      <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden" />
    </>
  )
}

// Main Dashboard Content
function DashboardContent() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [seriesEnabled, setSeriesEnabled] = useState({ views: true, website: true, phone: true })
  const { stats, analytics, projects, loading, error } = useDeveloperDashboard(selectedPeriod)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>("all")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortKey, setSortKey] = useState<'views' | 'websiteClicks' | 'phoneClicks' | 'dateCreated'>("dateCreated")
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>("desc")

  // Initialize filters from URL on mount
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const st = (searchParams.get('status') as 'all' | 'active' | 'inactive') || 'all'
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

  // UI-only refactor: no auth/profile fetch here

  const handleAddListing = () => {
    router.push('/developer/properties/new')
  }

  const handleViewAnalytics = () => {
    router.push('/developer/analytics')
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-background to-muted/20 overflow-auto">
      {/* Premium Header */}
      <header data-qa="dashboard-header" className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-lg">Welcome back! Here's what's happening with your properties.</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40 h-11 border-border/50 bg-background/50 hover:bg-background transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddListing}
                className="h-11 px-6 shadow-md hover:shadow-lg transition-all duration-200"
                style={{
                  backgroundColor: 'var(--brand-btn-primary-bg)',
                  color: 'var(--brand-btn-primary-text)'
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Premium Spacing */}
      <main className="p-8 max-w-7xl mx-auto space-y-12">
        {/* Key Metrics */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Properties"
              value={stats?.total_projects || 0}
              change={stats?.projects_growth}
              icon={Building2}
              loading={loading}
              onClick={() => router.push('/developer/properties')}
            />
            <MetricCard
              title="Total Views"
              value={stats?.total_views || 0}
              change={stats?.views_growth}
              changeType="positive"
              icon={Eye}
              loading={loading}
              onClick={handleViewAnalytics}
            />
            <MetricCard
              title="Website Clicks"
              value={stats?.total_website_clicks || 0}
              change={stats?.website_clicks_growth}
              changeType="positive"
              icon={Globe}
              loading={loading}
              onClick={handleViewAnalytics}
            />
            <MetricCard
              title="Phone Clicks"
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
                  <CardTitle className="text-2xl font-bold text-foreground tracking-tight">Traffic & Engagement</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Comprehensive view of property views, website clicks and phone interactions
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
                        Views
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
                        Website Clicks
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
                        Phone Clicks
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

export default function DeveloperDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<DeveloperProfile | null>(null)
  const { user } = useAuth();

  // Set profile from auth context if user is verified
  useEffect(() => {
    if (user?.verification_status === 'verified') {
      // User data from auth context contains all needed profile info
      setProfile({
        id: user.id,
        email: user.email,
        company_name: user.company_name || '',
        contact_person: user.contact_person || '',
        phone: user.phone || '',
        office_address: user.address || '',
        website: user.website || '',
        verification_status: user.verification_status,
        created_at: user.created_at || '',
      })
    }
  }, [user])

  return (
    <ProtectedRoute requiredRole="developer">
      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          <DashboardSidebar profile={profile} />
          <SidebarInset>
            <DashboardContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}