"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, TrendingUp, Eye, Globe, Phone, RefreshCw } from "lucide-react"
import { format, subDays } from "date-fns"

import { ProtectedRoute } from "@/components/protected-route"
import { DeveloperSidebar } from "@/components/developer-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

import { useDeveloperDashboard } from "@/hooks/use-developer-dashboard"
import { useAuth } from "@/lib/auth-context"

interface AnalyticsClientProps {
  dict: any
  lang: 'en' | 'bg'
}

// Chart configuration - will be updated with translations in component
const chartConfig = {
  views: {
    label: "Views",
    color: "#3b82f6",
  },
  website: {
    label: "Website Clicks", 
    color: "#10b981",
  },
  phone: {
    label: "Phone Clicks",
    color: "#f59e0b",
  },
}

// Color palette for charts
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316']

interface MetricCardProps {
  title: string
  value: number
  previousValue?: number
  icon: React.ElementType
  color: string
  loading?: boolean
  vsPreviousPeriod?: string
}

function MetricCard({ title, value, previousValue, icon: Icon, color, loading, vsPreviousPeriod }: MetricCardProps) {
  const changePercent = previousValue && previousValue > 0 ? ((value - previousValue) / previousValue * 100) : 0
  const isPositive = changePercent > 0
  const isNeutral = changePercent === 0

  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="p-2 rounded-xl shadow-lg"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
            </div>
            
            {loading ? (
              <div className="w-20 h-8 bg-muted rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-foreground tracking-tight">
                {value.toLocaleString()}
              </p>
            )}

            {previousValue !== undefined && !loading && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isPositive ? 'text-emerald-600 bg-emerald-50' :
                  isNeutral ? 'text-gray-600 bg-gray-50' :
                  'text-red-600 bg-red-50'
                }`}>
                  <TrendingUp className={`h-3 w-3 ${isPositive ? '' : isNeutral ? 'opacity-50' : 'rotate-180'}`} />
                  <span>{Math.abs(changePercent).toFixed(1)}%</span>
                </div>
                <span className="text-xs text-muted-foreground">{vsPreviousPeriod || "vs previous period"}</span>
              </div>
            )}
          </div>

          <div className="ml-4">
            <Progress 
              value={Math.min((value / Math.max(value, 100)) * 100, 100)} 
              className="w-16 h-2" 
              style={{ 
                backgroundColor: `${color}20`,
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsContent({ dict, lang }: AnalyticsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("week")
  const [chartType, setChartType] = useState("area")
  const [seriesEnabled, setSeriesEnabled] = useState({ views: true, website: true, phone: true })
  
  const { stats, analytics, loading, error, refetch } = useDeveloperDashboard(selectedPeriod)
  const { canCreateProjects } = useAuth()
  const router = useRouter()

  // Dynamic chart configuration with translations
  const dynamicChartConfig = {
    views: {
      label: dict.developer?.analytics?.views || "Views",
      color: "#3b82f6",
    },
    website: {
      label: dict.developer?.analytics?.websiteClicks || "Website Clicks", 
      color: "#10b981",
    },
    phone: {
      label: dict.developer?.analytics?.phoneClicks || "Phone Clicks",
      color: "#f59e0b",
    },
  }

  // Helpers to build dated series ending today for the selected period
  const lengthByPeriod = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365,
  } as const

  const buildDateRange = (len: number) => {
    const today = new Date()
    return Array.from({ length: len }, (_, idx) => subDays(today, len - idx - 1))
  }

  const normalizeSeries = (raw: any, len: number) => {
    if (!raw || !Array.isArray(raw)) return []

    // If backend returns dated objects
    if (raw.length && typeof raw[0] === 'object' && raw[0] !== null && 'date' in raw[0]) {
      return raw
        .map((item: any) => ({
          date: item.date,
          value: Number(item.value ?? 0),
        }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    // Fallback for numeric arrays (old shape)
    const trimmed = raw.slice(-len)
    const padSize = Math.max(0, len - trimmed.length)
    const padded = Array(padSize).fill(0).concat(trimmed)
    const dates = buildDateRange(len)

    return dates.map((date, i) => ({
      date: date.toISOString(),
      value: Number(padded[i] ?? 0),
    }))
  }

  const chartData = useMemo(() => {
    if (!analytics) return []

    const len = lengthByPeriod[selectedPeriod as keyof typeof lengthByPeriod] || 7
    const dates = buildDateRange(len)
    const dateLabels = dates.map((d) => format(d, "dd.MM.yyyy"))

    const viewsSeries = normalizeSeries(analytics.projects_views, len)
    const websiteSeries = normalizeSeries(analytics.website_clicks, len)
    const phoneSeries = normalizeSeries(analytics.phone_clicks, len)

    const toMap = (series: { date: string; value: number }[]) =>
      series.reduce<Record<string, number>>((acc, item) => {
        const key = format(new Date(item.date), "dd.MM.yyyy")
        acc[key] = item.value ?? 0
        return acc
      }, {})

    const vMap = toMap(viewsSeries)
    const wMap = toMap(websiteSeries)
    const pMap = toMap(phoneSeries)

    return dateLabels.map((day) => ({
      day,
      views: vMap[day] ?? 0,
      website: wMap[day] ?? 0,
      phone: pMap[day] ?? 0,
    }))
  }, [analytics, selectedPeriod])

  // Pie chart data - based on current period and visible series
  const pieData = useMemo(() => {
    const sums = chartData.reduce(
      (acc, row) => {
        acc.views += row.views || 0
        acc.website += row.website || 0
        acc.phone += row.phone || 0
        return acc
      },
      { views: 0, website: 0, phone: 0 }
    )

    const data = []
    if (seriesEnabled.views) data.push({ name: dynamicChartConfig.views.label, value: sums.views, color: dynamicChartConfig.views.color })
    if (seriesEnabled.website) data.push({ name: dynamicChartConfig.website.label, value: sums.website, color: dynamicChartConfig.website.color })
    if (seriesEnabled.phone) data.push({ name: dynamicChartConfig.phone.label, value: sums.phone, color: dynamicChartConfig.phone.color })

    return data
  }, [chartData, seriesEnabled, dynamicChartConfig])

  const totalInteractions = pieData.reduce((acc, item) => acc + (item.value || 0), 0)

  const handleExportData = () => {
    // TODO: Implement data export functionality

  }

  const handleRefresh = () => {
    refetch()
  }

  const periodPresets = [
    { label: dict.developer?.analytics?.last7Days || "Last 7 days", value: "week" },
    { label: dict.developer?.analytics?.last30Days || "Last 30 days", value: "month" }, 
    { label: dict.developer?.analytics?.last90Days || "Last 90 days", value: "quarter" },
    { label: dict.developer?.analytics?.lastYear || "Last year", value: "year" },
  ]

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <CardTitle className="text-red-600 mb-2">{dict.developer?.analytics?.errorLoadingAnalytics || "Error Loading Analytics"}</CardTitle>
          <CardDescription className="mb-4">{error}</CardDescription>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {dict.developer?.analytics?.retry || "Retry"}
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-background to-muted/20 overflow-auto">
      {/* Analytics Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">{dict.developer?.analytics?.title || "Analytics"}</h1>
              <p className="text-muted-foreground text-lg">{dict.developer?.analytics?.description || "Detailed insights into your property performance"}</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodPresets.map(preset => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {dict.developer?.analytics?.refresh || "Refresh"}
              </Button>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        
        {/* Key Metrics */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title={dict.developer?.analytics?.totalViews || "Total Views"}
              value={stats?.total_views || 0}
              icon={Eye}
              color={dynamicChartConfig.views.color}
              loading={loading}
              vsPreviousPeriod={dict.developer?.analytics?.vsPreviousPeriod || "vs previous period"}
            />
            <MetricCard
              title={dict.developer?.analytics?.websiteClicks || "Website Clicks"}
              value={stats?.total_website_clicks || 0}
              icon={Globe}
              color={dynamicChartConfig.website.color}
              loading={loading}
              vsPreviousPeriod={dict.developer?.analytics?.vsPreviousPeriod || "vs previous period"}
            />
            <MetricCard
              title={dict.developer?.analytics?.phoneClicks || "Phone Clicks"}
              value={stats?.total_phone_clicks || 0}
              icon={Phone}
              color={dynamicChartConfig.phone.color}
              loading={loading}
              vsPreviousPeriod={dict.developer?.analytics?.vsPreviousPeriod || "vs previous period"}
            />
          </div>
        </section>

        {/* Charts Section */}
        <section>
          <Tabs value={chartType} onValueChange={setChartType} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">{dict.developer?.analytics?.performanceTrends || "Performance Trends"}</h2>
                <p className="text-muted-foreground">{dict.developer?.analytics?.visualRepresentation || "Visual representation of your property engagement over time"}</p>
              </div>
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="area">{dict.developer?.analytics?.area || "Area"}</TabsTrigger>
                <TabsTrigger value="line">{dict.developer?.analytics?.line || "Line"}</TabsTrigger>
                <TabsTrigger value="bar">{dict.developer?.analytics?.bar || "Bar"}</TabsTrigger>
                <TabsTrigger value="pie">{dict.developer?.analytics?.distribution || "Distribution"}</TabsTrigger>
              </TabsList>
            </div>

            <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
              {/* Series filters */}
              <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="views-toggle" 
                    checked={seriesEnabled.views}
                    onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, views: !!v }))}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor="views-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                    {dict.developer?.analytics?.views || "Views"}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="website-toggle" 
                    checked={seriesEnabled.website}
                    onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, website: !!v }))}
                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <Label htmlFor="website-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                    {dict.developer?.analytics?.websiteClicks || "Website Clicks"}
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id="phone-toggle" 
                    checked={seriesEnabled.phone}
                    onCheckedChange={(v)=>setSeriesEnabled(s=>({ ...s, phone: !!v }))}
                    className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <Label htmlFor="phone-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                    {dict.developer?.analytics?.phoneClicks || "Phone Clicks"}
                  </Label>
                </div>
              </div>

              <TabsContent value="area" className="m-0">
                <ChartContainer config={dynamicChartConfig} className="h-[25rem] w-full">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {seriesEnabled.views && (
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke={dynamicChartConfig.views.color}
                        fill={dynamicChartConfig.views.color}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    )}
                    {seriesEnabled.website && (
                      <Area
                        type="monotone"
                        dataKey="website"
                        stroke={dynamicChartConfig.website.color}
                        fill={dynamicChartConfig.website.color}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    )}
                    {seriesEnabled.phone && (
                      <Area
                        type="monotone"
                        dataKey="phone"
                        stroke={dynamicChartConfig.phone.color}
                        fill={dynamicChartConfig.phone.color}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    )}
                  </AreaChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="line" className="m-0">
                <ChartContainer config={dynamicChartConfig} className="h-[25rem] w-full">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {seriesEnabled.views && (
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke={dynamicChartConfig.views.color}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {seriesEnabled.website && (
                      <Line
                        type="monotone"
                        dataKey="website"
                        stroke={dynamicChartConfig.website.color}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {seriesEnabled.phone && (
                      <Line
                        type="monotone"
                        dataKey="phone"
                        stroke={dynamicChartConfig.phone.color}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="bar" className="m-0">
                <ChartContainer config={dynamicChartConfig} className="h-[25rem] w-full">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    {seriesEnabled.views && <Bar dataKey="views" fill={dynamicChartConfig.views.color} radius={4} />}
                    {seriesEnabled.website && <Bar dataKey="website" fill={dynamicChartConfig.website.color} radius={4} />}
                    {seriesEnabled.phone && <Bar dataKey="phone" fill={dynamicChartConfig.phone.color} radius={4} />}
                  </BarChart>
                </ChartContainer>
              </TabsContent>

              <TabsContent value="pie" className="m-0">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="h-[25rem]">
                    <ChartContainer config={dynamicChartConfig} className="h-full w-full">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{dict.developer?.analytics?.engagementBreakdown || "Engagement Breakdown"}</h3>
                      <div className="space-y-4">
                        {pieData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{item.value.toLocaleString()}</div>
                              <div className="text-sm text-muted-foreground">
                                {totalInteractions > 0 ? ((item.value / totalInteractions) * 100).toFixed(1) : 0}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Card>
          </Tabs>
        </section>

        {/* Additional Insights */}
        <section>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{dict.developer?.analytics?.quickInsights || "Quick Insights"}</CardTitle>
                <CardDescription>{dict.developer?.analytics?.keyObservations || "Key observations from your analytics"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {stats?.total_views || 0} {dict.developer?.analytics?.totalPropertyViews || "total property views"}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {dict.developer?.analytics?.listingsGettingAttention || "Your listings are getting attention from potential buyers"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                  <Globe className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      {((stats?.total_website_clicks || 0) / Math.max(stats?.total_views || 1, 1) * 100).toFixed(1)}% {dict.developer?.analytics?.websiteClickRate || "website click rate"}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {dict.developer?.analytics?.goodConversionFromViews || "Good conversion from views to website visits"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                  <Phone className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-100">
                      {((stats?.total_phone_clicks || 0) / Math.max(stats?.total_views || 1, 1) * 100).toFixed(1)}% {dict.developer?.analytics?.phoneClickRate || "phone click rate"}
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      {dict.developer?.analytics?.directContactConversionRate || "Direct contact conversion rate"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">{dict.developer?.analytics?.performanceSummary || "Performance Summary"}</CardTitle>
                <CardDescription>{dict.developer?.analytics?.overallEngagementMetrics || "Overall engagement metrics"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{dict.developer?.analytics?.viewEngagement || "View Engagement"}</span>
                    <span className="text-sm text-muted-foreground">{stats?.total_views || 0} {dict.developer?.analytics?.views || "views"}</span>
                  </div>
                  <Progress value={Math.min((stats?.total_views || 0) / 100 * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{dict.developer?.analytics?.websiteClicks || "Website Clicks"}</span>
                    <span className="text-sm text-muted-foreground">{stats?.total_website_clicks || 0} {dict.developer?.analytics?.clicks || "clicks"}</span>
                  </div>
                  <Progress value={Math.min((stats?.total_website_clicks || 0) / Math.max(stats?.total_views || 1, 1) * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{dict.developer?.analytics?.phoneClicks || "Phone Clicks"}</span>
                    <span className="text-sm text-muted-foreground">{stats?.total_phone_clicks || 0} {dict.developer?.analytics?.clicks || "clicks"}</span>
                  </div>
                  <Progress value={Math.min((stats?.total_phone_clicks || 0) / Math.max(stats?.total_views || 1, 1) * 100, 100)} className="h-2" />
                </div>

                <Separator className="my-4" />

                <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{totalInteractions.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{dict.developer?.analytics?.totalInteractions || "Total Interactions"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

      </main>
    </div>
  )
}

export default function DeveloperAnalyticsPage({ dict, lang }: AnalyticsClientProps) {
  return (
    <ProtectedRoute requiredRole="developer">
      <DeveloperSidebar dict={dict} lang={lang}>
        <AnalyticsContent dict={dict} lang={lang} />
      </DeveloperSidebar>
    </ProtectedRoute>
  )
}