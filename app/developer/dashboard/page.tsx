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
    <Card className={`transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-primary/30' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="w-16 h-8 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            )}
            {change && (
              <div className="flex items-center gap-1 mt-1">
                <IconComponent className="h-3 w-3" />
                <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Navigation using shadcn/ui Sidebar (Vercel theme)
function DashboardSidebar({ profile }: { profile: DeveloperProfile | null }) {
  const router = useRouter()
  const pathname = usePathname()
  
  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/developer/dashboard" },
    { icon: Building2, label: "Properties", href: "/developer/properties" },
    { icon: BarChart3, label: "Analytics", href: "/developer/analytics" },
    { icon: MessageSquare, label: "Inquiries", href: "/developer/inquiries" },
    { icon: User, label: "Profile", href: "/developer/profile" },
    { icon: Settings, label: "Settings", href: "/developer/settings" },
  ]

  const handleNavigation = (href: string) => router.push(href)

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expires')
    router.push('/login')
  }

  return (
    <>
      <Sidebar className="md:top-16" variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-3 p-2">
            <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground grid place-items-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold leading-none">Mr imot</h1>
              <p className="text-xs text-muted-foreground">Developer Portal</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname ? pathname.startsWith(item.href) : false
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          {profile && (
            <div className="flex items-center gap-3 rounded-md border p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {profile.company_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{profile.company_name}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {profile.verification_status}
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
    <div className="flex-1 bg-muted overflow-auto">
      {/* Header */}
      <header data-qa="dashboard-header" className="bg-card border-b border-border sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's what's happening with your properties.</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddListing}>
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto space-y-8">
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Traffic & Engagement</CardTitle>
                  <CardDescription>Views, website clicks and phone clicks</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analytics ? (
                <>
                  <div className="flex items-center gap-4 pb-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="views-toggle" defaultChecked onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, views: !!v }))} />
                      <Label htmlFor="views-toggle" className="text-sm">Views</Label>
                    </div>
                    <div className="flex items-center gap-2">
                    <Checkbox id="website-toggle" defaultChecked onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, website: !!v }))} />
                      <Label htmlFor="website-toggle" className="text-sm">Website</Label>
                    </div>
                    <div className="flex items-center gap-2">
                    <Checkbox id="phone-toggle" defaultChecked onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, phone: !!v }))} />
                      <Label htmlFor="phone-toggle" className="text-sm">Phone</Label>
                    </div>
                  </div>
                  <ChartContainer
                  config={{
                    views: { label: "Views", color: 'var(--chart-1)' },
                    website: { label: "Website", color: 'var(--chart-2)' },
                    phone: { label: "Phone", color: 'var(--chart-5)' },
                  }}
                  className="w-full"
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
                </>
              ) : (
                <div className="h-48 w-full rounded-md bg-muted animate-pulse" />
              )}
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start h-11">
                <Link href="/developer/properties/new">
                  <Plus className="h-5 w-5 mr-3 text-primary" />
                  Add New Property
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-11">
                <Link href="/developer/analytics">
                  <BarChart3 className="h-5 w-5 mr-3 text-emerald-600" />
                  View Detailed Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-11">
                <Link href="/developer/profile">
                  <User className="h-5 w-5 mr-3 text-purple-600" />
                  Edit Company Profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-11">
                <Link href="/developer/settings">
                  <Settings className="h-5 w-5 mr-3 text-muted-foreground" />
                  Account Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-muted rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-muted/70 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recent_activity?.length > 0 ? (
                <div className="space-y-1">
                  {stats.recent_activity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      {activity.unread && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Properties Table */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Your Properties
                  </CardTitle>
                  <CardDescription>Manage and monitor your property listings</CardDescription>
                </div>
                <Button asChild>
                  <Link href="/developer/properties/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Link>
                </Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search by title or location"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={statusFilter} onValueChange={(v)=> setStatusFilter(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-full bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (projects?.length || 0) > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center gap-1"
                            onClick={() => { setSortKey('views'); setSortDir(d => sortKey === 'views' && d === 'asc' ? 'desc' : 'asc'); setPage(1) }}
                          >
                            Views <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center gap-1"
                            onClick={() => { setSortKey('websiteClicks'); setSortDir(d => sortKey === 'websiteClicks' && d === 'asc' ? 'desc' : 'asc'); setPage(1) }}
                          >
                            Website <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">
                          <button
                            className="inline-flex items-center gap-1"
                            onClick={() => { setSortKey('phoneClicks'); setSortDir(d => sortKey === 'phoneClicks' && d === 'asc' ? 'desc' : 'asc'); setPage(1) }}
                          >
                            Phone <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button
                            className="inline-flex items-center gap-1"
                            onClick={() => { setSortKey('dateCreated'); setSortDir(d => sortKey === 'dateCreated' && d === 'asc' ? 'desc' : 'asc'); setPage(1) }}
                          >
                            Updated <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const base = (projects || [])
                          .filter((p: any) =>
                            (!search ||
                              p.title?.toLowerCase().includes(search.toLowerCase()) ||
                              p.location?.toLowerCase().includes(search.toLowerCase())) &&
                            (statusFilter === 'all' || p.status === statusFilter)
                          )
                          .sort((a: any, b: any) => {
                            const dir = sortDir === 'asc' ? 1 : -1
                            const get = (p: any) => {
                              switch (sortKey) {
                                case 'views': return p.views || 0
                                case 'websiteClicks': return p.websiteClicks || 0
                                case 'phoneClicks': return p.phoneClicks || 0
                                case 'dateCreated': return new Date(p.dateCreated || p.created_at || 0).getTime()
                                default: return 0
                              }
                            }
                            return dir * (get(a) - get(b))
                          })
                        const total = base.length
                        const totalPages = Math.max(1, Math.ceil(total / pageSize))
                        const currentPage = Math.min(page, totalPages)
                        const slice = base.slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        return slice.map((p: any) => (
                          <TableRow key={p.id} className="hover:bg-accent/40">
                            <TableCell>
                              <div className="font-medium text-foreground">{p.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />{p.location || '—'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{p.views ?? 0}</TableCell>
                            <TableCell className="text-right tabular-nums">{p.websiteClicks ?? 0}</TableCell>
                            <TableCell className="text-right tabular-nums">{p.phoneClicks ?? 0}</TableCell>
                            <TableCell className="whitespace-nowrap">{p.dateCreated ? new Date(p.dateCreated).toLocaleDateString() : '—'}</TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/developer/properties/${p.id}`}>
                                  Edit
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      })()}
                    </TableBody>
                  </Table>
                  {(() => {
                    const total = (projects || [])
                      .filter((p: any) =>
                        (!search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase())) &&
                        (statusFilter === 'all' || p.status === statusFilter)
                      ).length
                    const totalPages = Math.max(1, Math.ceil(total / pageSize))
                    if (totalPages <= 1) return null
                    return (
                      <div className="mt-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} />
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink isActive>{page}</PaginationLink>
                            </PaginationItem>
                            {page < totalPages && (
                              <>
                                <PaginationItem>
                                  <PaginationNext onClick={() => setPage(Math.min(totalPages, page + 1))} />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              </>
                            )}
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )
                  })()}
                  {((projects || [])
                    .filter((p: any) =>
                      (!search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.location?.toLowerCase().includes(search.toLowerCase())) &&
                      (statusFilter === 'all' || p.status === statusFilter)
                    ).length === 0) && (
                    <div className="text-center py-10 text-muted-foreground">No properties match your filters.</div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No properties yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start building your portfolio by adding your first property listing. It only takes a few minutes!
                  </p>
                  <Button onClick={handleAddListing} size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Property
                  </Button>
                </div>
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

  // Only fetch developer profile for sidebar if user is verified
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token || user?.verification_status !== 'verified') return

        const response = await fetch(`/api/v1/developers/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      }
    }

    fetchProfile()
  }, [user?.verification_status])

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