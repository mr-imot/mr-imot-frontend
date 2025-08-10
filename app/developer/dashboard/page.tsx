"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDeveloperDashboard } from "@/hooks/use-developer-dashboard"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
    negative: "text-red-600", 
    neutral: "text-gray-500"
  }[changeType]
  
  const IconComponent = changeType === "positive" ? TrendingUp : 
                        changeType === "negative" ? TrendingDown : Activity
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer hover:border-blue-200' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {loading ? (
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            )}
            {change && (
              <div className="flex items-center gap-1 mt-1">
                <IconComponent className="h-3 w-3" />
                <span className={`text-sm font-medium ${changeColor}`}>{change}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-full">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Professional Navigation Sidebar
function DashboardSidebar({ profile, isOpen, onClose }: { 
  profile: DeveloperProfile | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const router = useRouter()
  
  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/developer/dashboard", active: true },
    { icon: Building2, label: "Properties", href: "/developer/properties", active: false },
    { icon: BarChart3, label: "Analytics", href: "/developer/analytics", active: false },
    { icon: MessageSquare, label: "Inquiries", href: "/developer/inquiries", active: false },
    { icon: User, label: "Profile", href: "/developer/profile", active: false },
    { icon: Settings, label: "Settings", href: "/developer/settings", active: false },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expires')
    router.push('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:border-r lg:border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Mr imot</h1>
              <p className="text-xs text-gray-500">Developer Portal</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start h-11 ${
                item.active 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
              {item.active && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50">
          {profile && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                    {profile.company_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.company_name}</p>
                  <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                </div>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  {profile.verification_status}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Main Dashboard Content
function DashboardContent() {
  const { stats, analytics, projects, loading, error } = useDeveloperDashboard('week')
  const [profile, setProfile] = useState<DeveloperProfile | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const router = useRouter()

  // Fetch developer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await fetch('http://localhost:8000/api/v1/developers/me', {
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
  }, [])

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
    <div className="flex-1 bg-gray-50 overflow-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your properties.</p>
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
              <Button onClick={handleAddListing} className="bg-blue-600 hover:bg-blue-700">
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

        {/* Quick Actions & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start h-11" onClick={handleAddListing}>
                <Plus className="h-5 w-5 mr-3 text-blue-600" />
                Add New Property
              </Button>
              <Button variant="outline" className="w-full justify-start h-11" onClick={handleViewAnalytics}>
                <BarChart3 className="h-5 w-5 mr-3 text-emerald-600" />
                View Detailed Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start h-11" onClick={() => router.push('/developer/profile')}>
                <User className="h-5 w-5 mr-3 text-purple-600" />
                Edit Company Profile
              </Button>
              <Button variant="outline" className="w-full justify-start h-11" onClick={() => router.push('/developer/settings')}>
                <Settings className="h-5 w-5 mr-3 text-gray-600" />
                Account Settings
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
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-1/2 h-3 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recent_activity?.length > 0 ? (
                <div className="space-y-1">
                  {stats.recent_activity.map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                      {activity.unread && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Properties Overview */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Your Properties
                  </CardTitle>
                  <CardDescription>Manage and monitor your property listings</CardDescription>
                </div>
                <Button variant="outline" onClick={() => router.push('/developer/properties')}>
                  View All
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse" />
                          <div className="w-1/3 h-4 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects?.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project: any) => (
                    <div key={project.id} className="p-4 border rounded-lg hover:border-blue-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{project.title}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {project.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(project.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                          <div className="text-sm text-gray-600 mt-1">
                            {project.views} views
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start building your portfolio by adding your first property listing. It only takes a few minutes!
                  </p>
                  <Button onClick={handleAddListing} size="lg" className="bg-blue-600 hover:bg-blue-700">
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

  // Fetch developer profile for sidebar
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return

        const response = await fetch('http://localhost:8000/api/v1/developers/me', {
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
  }, [])

  return (
    <ProtectedRoute requiredRole="developer">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile menu button */}
        <Button
          variant="outline"
          size="sm"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>

        <DashboardSidebar 
          profile={profile}
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <DashboardContent />
      </div>
    </ProtectedRoute>
  )
}