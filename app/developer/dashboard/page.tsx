"use client"

import { useState } from "react"
import { useDeveloperDashboard } from "@/hooks/use-developer-dashboard"
import { DeveloperDashboardHero } from "@/components/developer-dashboard-hero"
import { AnalyticsKpiGrid } from "@/components/analytics-kpi-grid"
import { PerformanceTrendsSection } from "@/components/performance-trends-section"
import { DashboardFooterBar } from "@/components/dashboard-footer-bar"
import { ProtectedRoute } from "@/components/protected-route"
import { DSInput } from "@/components/ds/ds-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Eye,
  Phone,
  List,
  Building,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CalendarIcon,
  MessageSquare,
  Heart,
  Globe,
  Mail,
  Lock,
  User,
  Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"

function DeveloperDashboardContent() {
  // Fetch dashboard data from API
  const { stats, analytics, projects: apiProjects, loading, error } = useDeveloperDashboard('week')
  
  const [activeTab, setActiveTab] = useState("analytics")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })
  const [isAddListingOpen, setIsAddListingOpen] = useState(false)
  const [isEditListingOpen, setIsEditListingOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<any>(null)
  const [locale, setLocale] = useState("en")

  // Performance trends state
  const [trendsRange, setTrendsRange] = useState({
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  })
  const [trendsComparison, setTrendsComparison] = useState({
    start: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000), // 60 days ago
    end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  })
  const [selectedMetricIds, setSelectedMetricIds] = useState<string[]>(["views", "website_clicks"])
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([])

  // Mock analytics data as fallback
  const mockAnalyticsData = [
    {
      title: "Total Views",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "primary",
      description: "Page views across all listings",
    },
    {
      title: "Website Clicks",
      value: "156",
      change: "+8.2%",
      trend: "up",
      icon: ExternalLink,
      color: "accent",
      description: "Clicks to your website",
    },
    {
      title: "Phone Clicks",
      value: "43",
      change: "-2.1%",
      trend: "down",
      icon: Phone,
      color: "primary",
      description: "Phone number clicks",
    },
    {
      title: "Contact Messages",
      value: "28",
      change: "+15.7%",
      trend: "up",
      icon: MessageSquare,
      color: "accent",
      description: "Contact form submissions",
    },
    {
      title: "Saved Listings",
      value: "89",
      change: "+22.3%",
      trend: "up",
      icon: Heart,
      color: "primary",
      description: "Times your listings were saved",
    },
    {
      title: "Active Listings",
      value: "7",
      change: "0%",
      trend: "neutral",
      icon: List,
      color: "accent",
      description: "Currently active listings",
    },
  ]

  // Mock listings data as fallback
  const mockListings = [
    {
      id: 1,
      title: "Skyline Towers - Downtown",
      status: "Active",
      views: 1245,
      websiteClicks: 67,
      phoneClicks: 15,
      contactMessages: 8,
      savedCount: 34,
      dateCreated: "2024-01-15",
      price: "$450,000 - $850,000",
      type: "Residential",
      location: "Downtown, City Center",
    },
    {
      id: 2,
      title: "Lakeside Residences",
      status: "Active",
      views: 892,
      websiteClicks: 45,
      phoneClicks: 12,
      contactMessages: 6,
      savedCount: 28,
      dateCreated: "2024-02-01",
      price: "$320,000 - $650,000",
      type: "Residential",
      location: "Lakeside District",
    },
    {
      id: 3,
      title: "Metro Business Plaza",
      status: "Pending Review",
      views: 234,
      websiteClicks: 12,
      phoneClicks: 3,
      contactMessages: 2,
      savedCount: 8,
      dateCreated: "2024-03-10",
      price: "$2.5M - $8.5M",
      type: "Commercial",
      location: "Business District",
    },
  ]

  const pricingPlans = [
    {
      name: "Basic",
      price: "$29",
      period: "/month",
      features: ["Up to 3 active listings", "Basic analytics", "Email support", "Standard listing features"],
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      popular: true,
      features: [
        "Up to 15 active listings",
        "Advanced analytics",
        "Priority support",
        "Featured listing options",
        "Custom branding",
        "Lead management tools",
      ],
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      features: [
        "Unlimited listings",
        "Full analytics suite",
        "Dedicated account manager",
        "API access",
        "White-label solutions",
        "Custom integrations",
        "Advanced reporting",
      ],
    },
  ]

  // KPI Grid data
  const kpiMetrics = [
    {
      id: "views" as const,
      label: "Total Views",
      value: 2847,
      deltaPct: 12.5,
      trend: [
        120, 135, 142, 138, 155, 162, 158, 170, 165, 180, 175, 190, 185, 200, 195, 210, 205, 220, 215, 230, 225, 240,
        235, 250, 245, 260, 255, 270, 265, 280,
      ],
    },
    {
      id: "website_clicks" as const,
      label: "Website Clicks",
      value: 156,
      deltaPct: 8.2,
      trend: [
        8, 12, 10, 15, 13, 18, 16, 20, 18, 22, 20, 25, 23, 28, 26, 30, 28, 32, 30, 35, 33, 38, 36, 40, 38, 42, 40, 45,
        43, 48,
      ],
    },
    {
      id: "phone_clicks" as const,
      label: "Phone Clicks",
      value: 43,
      deltaPct: -2.1,
      trend: [3, 4, 2, 5, 3, 6, 4, 7, 5, 8, 6, 7, 5, 8, 6, 9, 7, 8, 6, 9, 7, 10, 8, 9, 7, 10, 8, 11, 9, 10],
    },
    {
      id: "contact_messages" as const,
      label: "Contact Messages",
      value: 28,
      deltaPct: 15.7,
      trend: [1, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8, 10, 9, 11, 10, 12, 11, 13, 12, 14, 13, 15, 14, 16],
    },
    {
      id: "saved_listings" as const,
      label: "Saved Listings",
      value: 89,
      deltaPct: 22.3,
      trend: [
        5, 8, 6, 10, 8, 12, 10, 15, 13, 18, 16, 20, 18, 22, 20, 25, 23, 28, 26, 30, 28, 32, 30, 35, 33, 38, 36, 40, 38,
        42,
      ],
    },
    {
      id: "active_listings" as const,
      label: "Active Listings",
      value: 7,
      deltaPct: null,
      trend: [5, 5, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    },
  ]

  // Performance trends data
  const trendsListings = [
    { id: "1", name: "Skyline Towers - Downtown" },
    { id: "2", name: "Lakeside Residences" },
    { id: "3", name: "Metro Business Plaza" },
  ]

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ds-primary-600 mx-auto mb-4"></div>
          <p className="text-ds-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Use API data if available, otherwise fall back to mock data
  const analyticsData = analytics || mockAnalyticsData
  const listings = apiProjects && apiProjects.length > 0 ? apiProjects : mockListings

  const generateTrendsData = (days: number, offset = 0) => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i + offset) * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split("T")[0] // YYYY-MM-DD format

      return {
        date: dateString,
        views: Math.floor(Math.random() * 100) + 50 + i * 2,
        website_clicks: Math.floor(Math.random() * 20) + 5 + Math.floor(i / 3),
        phone_clicks: Math.floor(Math.random() * 8) + 1,
        contact_messages: Math.floor(Math.random() * 5) + 1,
        saved_listings: Math.floor(Math.random() * 15) + 3 + Math.floor(i / 2),
      }
    })
  }

  const trendsData = generateTrendsData(30)
  const trendsComparisonData = generateTrendsData(30, 30)

  // Hero component handlers
  const handleAddListing = () => {
    setIsAddListingOpen(true)
  }

  const handleManageCompany = () => {
    setActiveTab("company")
  }

  const handleBilling = () => {
    setActiveTab("billing")
  }

  const handleSupport = () => {
    console.log("Support clicked")
  }

  const handleKpiDrill = (metricId: string) => {
    console.log(`Drilling into KPI: ${metricId}`)
    // Could navigate to detailed view or update trends chart
    setSelectedMetricIds([metricId])
  }

  const handleTrendsExport = (type: "csv" | "png") => {
    console.log(`Exporting trends as ${type}`)
  }

  // Footer handlers
  const handleHelp = () => {
    console.log("Help clicked")
  }

  const handleDocs = () => {
    console.log("Docs clicked")
  }

  const handleFooterSupport = () => {
    console.log("Footer support clicked")
  }

  const handleFooterBilling = () => {
    setActiveTab("billing")
  }

  const handlePrivacy = () => {
    console.log("Privacy clicked")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <DeveloperDashboardHero
        companyName="MrImot Developments"
        companyLogoUrl="/images/mrimot-logo.png"
        planTier="Pro"
        activeListings={7}
        totalViews={2847}
        totalLeads={71}
        onAddListing={handleAddListing}
        onManageCompany={handleManageCompany}
        onBilling={handleBilling}
        onSupport={handleSupport}
      />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="listings" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Listings</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Company</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900">Analytics Overview</h2>
                  <p className="text-slate-600 mt-1">Track your listing performance and engagement metrics</p>
                </div>

                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-fit bg-white">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                        {dateRange.to.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar initialFocus mode="range" defaultMonth={dateRange.from} numberOfMonths={2} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* KPI Grid */}
              <AnalyticsKpiGrid metrics={kpiMetrics} onDrill={handleKpiDrill} />

              {/* Performance Trends */}
              <PerformanceTrendsSection
                range={trendsRange}
                comparison={trendsComparison}
                selectedMetricIds={selectedMetricIds}
                selectedListingIds={selectedListingIds}
                listings={trendsListings}
                data={trendsData}
                comparisonData={trendsComparisonData}
                onRangeChange={setTrendsRange}
                onComparisonChange={setTrendsComparison}
                onMetricChange={setSelectedMetricIds}
                onListingChange={setSelectedListingIds}
                onExport={handleTrendsExport}
              />
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings" className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-slate-900">My Listings</h2>
                  <p className="text-slate-600 mt-1">Manage your property listings and track their performance</p>
                </div>
                <Button
                  onClick={() => setIsAddListingOpen(true)}
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Listing
                </Button>
              </div>

              <div className="space-y-4">
                {listings.map((listing: any) => (
                  <Card
                    key={listing.id}
                    className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-medium text-slate-900">{listing.title}</h3>
                            <Badge variant={listing.status === "Active" ? "default" : "secondary"}>
                              {listing.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-slate-900">{listing.views}</div>
                              <div className="text-xs text-slate-600">Views</div>
                            </div>
                            <div className="text-center p-3 bg-emerald-50 rounded-lg">
                              <div className="text-lg font-bold text-emerald-600">{listing.websiteClicks}</div>
                              <div className="text-xs text-slate-600">Website Clicks</div>
                            </div>
                            <div className="text-center p-3 bg-amber-50 rounded-lg">
                              <div className="text-lg font-bold text-amber-600">{listing.phoneClicks}</div>
                              <div className="text-xs text-slate-600">Phone Clicks</div>
                            </div>
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-lg font-bold text-blue-600">{listing.savedCount}</div>
                              <div className="text-xs text-slate-600">Saved</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <span>{listing.type}</span>
                            <span>•</span>
                            <span>{listing.location}</span>
                            <span>•</span>
                            <span>{listing.price}</span>
                            <span>•</span>
                            <span>Created {listing.dateCreated}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Dialog open={isEditListingOpen} onOpenChange={setIsEditListingOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedListing(listing)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Listing</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-title">Project Title</Label>
                                    <DSInput id="edit-title" defaultValue={selectedListing?.title} />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-type">Property Type</Label>
                                    <Select defaultValue={selectedListing?.type.toLowerCase()}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="residential">Residential</SelectItem>
                                        <SelectItem value="commercial">Commercial</SelectItem>
                                        <SelectItem value="mixed">Mixed Use</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setIsEditListingOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Company Tab */}
            <TabsContent value="company" className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 mb-2">Company Profile</h2>
                <p className="text-slate-600">
                  This information will be visible to potential clients in the developers directory
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company-name">Company Name</Label>
                          <DSInput id="company-name" defaultValue="MrImot Developments" />
                        </div>
                        <div>
                          <Label htmlFor="company-website">Website</Label>
                          <DSInput id="company-website" defaultValue="www.mrimot.com" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company-email">Contact Email</Label>
                          <DSInput id="company-email" defaultValue="contact@mrimot.com" />
                        </div>
                        <div>
                          <Label htmlFor="company-phone">Phone Number</Label>
                          <DSInput id="company-phone" defaultValue="+1 (555) 123-4567" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="company-description">Company Description</Label>
                        <Textarea
                          id="company-description"
                          rows={4}
                          defaultValue="Leading real estate development company specializing in luxury residential and commercial properties. With over 15 years of experience, we deliver exceptional projects that exceed client expectations."
                        />
                      </div>
                      <div>
                        <Label htmlFor="company-address">Business Address</Label>
                        <DSInput id="company-address" defaultValue="123 Business District, City Center, State 12345" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Specializations & Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Property Types</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Residential", "Commercial", "Mixed Use", "Luxury Homes", "Condominiums"].map((type) => (
                            <Badge key={type} variant="secondary">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Service Areas</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Downtown", "Lakeside", "Business District", "Suburban Areas"].map((area) => (
                            <Badge key={area} variant="outline">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Company Logo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Building className="h-12 w-12 text-slate-400" />
                        </div>
                        <Button variant="outline" size="sm">
                          <Camera className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Public Profile Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Profile Views</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Total Projects</span>
                        <span className="font-medium">7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Years Active</span>
                        <span className="font-medium">15+</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                >
                  Save Company Profile
                </Button>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-slate-900 mb-2">Choose Your Plan</h2>
                <p className="text-slate-600">All plans are currently FREE during our development phase</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3 relative">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-2xl flex items-center justify-center">
                  <div className="text-center p-8 bg-white rounded-2xl shadow-lg border-2 border-teal-200">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
                      FREE During Development
                    </h3>
                    <p className="text-slate-600 mb-4">
                      All premium features are currently free while we're in beta. Enjoy unlimited access to help us
                      improve the platform!
                    </p>
                    <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                      Continue with Free Access
                    </Button>
                  </div>
                </div>

                {pricingPlans.map((plan, index) => (
                  <Card
                    key={index}
                    className={cn(
                      "rounded-2xl border-slate-200 shadow-sm relative",
                      plan.popular && "border-teal-500 border-2",
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                        {plan.price}
                        <span className="text-base font-normal text-slate-600">{plan.period}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm">
                            <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={cn(
                          "w-full",
                          plan.popular
                            ? "bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                            : "",
                        )}
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                      >
                        Choose {plan.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Free Development Access</h3>
                      <p className="text-sm text-slate-600">All features included • No billing required</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-8">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900 mb-2">Account Settings</h2>
                <p className="text-slate-600">Manage your account preferences and security settings</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <DSInput id="first-name" defaultValue="John" />
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <DSInput id="last-name" defaultValue="Developer" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <DSInput id="email" type="email" defaultValue="john@mrimot.com" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <DSInput id="phone" defaultValue="+1 (555) 123-4567" />
                    </div>
                    <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <DSInput id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <DSInput id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <DSInput id="confirm-password" type="password" />
                    </div>
                    <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Email Notifications</p>
                        <p className="text-xs text-slate-600">Receive updates about your listings</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">SMS Notifications</p>
                        <p className="text-xs text-slate-600">Get instant alerts for important updates</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Weekly Reports</p>
                        <p className="text-xs text-slate-600">Receive weekly performance summaries</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Account Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="est">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="est">Eastern Time (EST)</SelectItem>
                          <SelectItem value="cst">Central Time (CST)</SelectItem>
                          <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Add Listing Dialog */}
          <Dialog open={isAddListingOpen} onOpenChange={setIsAddListingOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Listing</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <DSInput id="title" placeholder="Enter project title" />
                  </div>
                  <div>
                    <Label htmlFor="type">Property Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="mixed">Mixed Use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price Range</Label>
                    <DSInput id="price" placeholder="e.g., $300,000 - $500,000" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <DSInput id="location" placeholder="Enter location" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your project..." rows={4} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddListingOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700">
                    Create Listing
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Footer */}
      <DashboardFooterBar
        onHelp={handleHelp}
        onDocs={handleDocs}
        onSupport={handleFooterSupport}
        onBilling={handleFooterBilling}
        onPrivacy={handlePrivacy}
        version="v2.1.0"
        status="operational"
        locale={locale}
        onLocaleChange={setLocale}
      />
    </div>
  )
}

export default function DeveloperDashboardPage() {
  return (
    <ProtectedRoute requiredRole="developer">
      <DeveloperDashboardContent />
    </ProtectedRoute>
  )
}
