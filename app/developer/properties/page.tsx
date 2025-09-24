"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { PendingApprovalMessage } from "@/components/pending-approval-message"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DeveloperSidebar } from "@/components/developer-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { getDeveloperProjects, updateProject, deleteProject, toggleProjectActive } from "@/lib/api"

import { Building2, Home, BarChart3, MessageSquare, User, Settings, Plus, MapPin, Eye, Globe, Phone, Calendar, Pencil, Trash2, Power } from "lucide-react"

type StatusFilter = "all" | "active" | "draft" | "paused"

export default function DeveloperPropertiesPage() {
  const { canCreateProjects } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [sortKey, setSortKey] = useState<'date' | 'views' | 'clicks' | 'website' | 'phone'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleAddProperty = () => {
    if (canCreateProjects) {
      router.push('/developer/properties/new')
    }
  }

  // Init from URL
  useEffect(() => {
    const q = searchParams.get('q') || ''
    const st = (searchParams.get('status') as StatusFilter) || 'all'
    const pg = parseInt(searchParams.get('page') || '1', 10)
    const sz = parseInt(searchParams.get('size') || '12', 10)
    setSearch(q)
    setStatus(st)
    setPage(Number.isFinite(pg) && pg>0 ? pg : 1)
    setPageSize(Number.isFinite(sz) && sz>0 ? sz : 12)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (status !== 'all') params.set('status', status)
    if (page>1) params.set('page', String(page))
    if (pageSize !== 12) params.set('size', String(pageSize))
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [search, status, page, pageSize, router, pathname])

  const apiStatus = status === 'all' ? undefined : (status === 'active' ? 'active' : 'inactive')
  const { data, isLoading, mutate } = useSWR(
    ['developer/projects/list', search, apiStatus, page, pageSize],
    () => getDeveloperProjects({ search, status: apiStatus, page, per_page: pageSize }),
    { dedupingInterval: 30000, revalidateOnFocus: false }
  )

  const projects = useMemo(() => {
    const list = data?.projects || []
    const get = (p: any) => {
      switch (sortKey) {
        case 'views': return p.total_views || 0
        case 'clicks': return (p.total_clicks_website || 0) + (p.total_clicks_phone || 0)
        case 'website': return p.total_clicks_website || 0
        case 'phone': return p.total_clicks_phone || 0
        case 'date':
        default: return new Date(p.updated_at || p.created_at || 0).getTime()
      }
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...list].sort((a,b)=> dir*(get(a)-get(b)))
  }, [data, sortKey, sortDir])
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleToggle = async (id: number, current: string) => {
    try {
      await toggleProjectActive(id)
      // Refresh the projects list
      mutate()
    } catch (error) {
      console.error('Failed to toggle project status:', error)
      // You could add a toast notification here
    }
  }

  const handleDelete = async (id: number) => {
    await deleteProject(id)
    mutate()
  }

  return (
    <ProtectedRoute requiredRole="developer">
      <DeveloperSidebar>
        <div className="flex-1 bg-gradient-to-br from-background via-background to-muted/20 overflow-auto">
          {/* Properties Header */}
          <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30 shadow-sm">
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">Your Properties</h1>
                  <p className="text-muted-foreground text-lg">Create, update and manage your listings</p>
                </div>
                <div className="flex items-center gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={handleAddProperty}
                          disabled={!canCreateProjects}
                          className="h-11 px-6 shadow-md hover:shadow-lg transition-all duration-200"
                          style={{
                            backgroundColor: canCreateProjects ? 'var(--brand-btn-primary-bg)' : 'var(--muted)',
                            color: canCreateProjects ? 'var(--brand-btn-primary-text)' : 'var(--muted-foreground)'
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Property
                        </Button>
                      </TooltipTrigger>
                      {!canCreateProjects && (
                        <TooltipContent>
                          <p>Available after account approval</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="px-8 py-8 max-w-7xl mx-auto space-y-8">
            {/* Pending Approval Message */}
            <PendingApprovalMessage />

            {/* Filters and Controls */}
            <div className="grid gap-3 md:grid-cols-4 mb-6">
              <div>
                <Select value={status} onValueChange={(v)=>{ setStatus(v as StatusFilter); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(parseInt(v,10)); setPage(1) }}>
                  <SelectTrigger><SelectValue placeholder="Rows per page" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 rows</SelectItem>
                    <SelectItem value="24">24 rows</SelectItem>
                    <SelectItem value="48">48 rows</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <span className="text-sm text-muted-foreground">Sort by</span>
                <Select value={sortKey} onValueChange={(v)=> setSortKey(v as any)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="clicks">Clicks</SelectItem>
                    <SelectItem value="website">Web clicks</SelectItem>
                    <SelectItem value="phone">Phone clicks</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortDir} onValueChange={(v)=> setSortDir(v as any)}>
                  <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Desc</SelectItem>
                    <SelectItem value="asc">Asc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Properties Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="h-80 animate-pulse bg-gray-100 border border-gray-200" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((p: any) => {
                  const coverFromImages = Array.isArray(p.images) && p.images.length > 0
                    ? (p.images.find((i:any)=>i.is_cover)?.urls?.card || p.images[0]?.urls?.card || p.images[0]?.image_url)
                    : undefined
                  const coverSrc = p.cover_image_url || coverFromImages || "/placeholder.jpg"
                  
                  // Get property type icon
                  const getPropertyIcon = (type: string) => {
                    if (type === 'house_complex' || type === 'HOUSE_COMPLEX') {
                      return <Home className="h-4 w-4 text-blue-600" />
                    }
                    return <Building2 className="h-4 w-4 text-blue-600" />
                  }
                  
                  return (
                    <article
                      key={p.id}
                      className="group bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 ease-out overflow-hidden cursor-pointer"
                    >
                      {/* Image Container */}
                      <Link href={`/developer/properties/new?id=${p.id}`} className="block cursor-pointer">
                        <div className="relative overflow-hidden cursor-pointer">
                          <div className="aspect-[4/3] w-full cursor-pointer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coverSrc}
                              alt={`${p.name || 'Property'} - ${p.city || ''}`}
                              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 cursor-pointer"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-4">
                        {/* Property Name with Fixed Height Container */}
                        <div className="h-12 mb-3">
                          <h3 className="font-outfit text-gray-900 text-[18px] font-semibold leading-tight line-clamp-2 tracking-[-0.01em] h-full flex items-start">
                            <Link href={`/developer/properties/new?id=${p.id}`} className="hover:text-blue-600 transition-colors cursor-pointer">
                              {p.name || p.title || 'Untitled project'}
                            </Link>
                          </h3>
                        </div>
                        
                        {/* City with Icon - Now Fixed Position */}
                        <div className="flex items-center gap-2 mb-3">
                          {getPropertyIcon(p.project_type)}
                          <p className="font-source-sans text-gray-600 text-[15px] font-normal leading-relaxed">
                            {p.city || p.location || '—'}
                          </p>
                        </div>

                        {/* Analytics Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 py-2 border-t border-gray-200">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" />
                              {p.total_views ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {p.total_clicks_website ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              {p.total_clicks_phone ?? 0}
                            </span>
                          </div>
                          <div className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(p.updated_at || p.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
                            <Link href={`/developer/properties/edit/${p.id}`}>
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <Card className="p-8 text-center bg-white border border-gray-200 shadow-sm">
                <CardTitle className="mb-2 text-gray-900">No properties yet</CardTitle>
                <CardDescription className="mb-6 text-gray-600">Create your first listing to get started.</CardDescription>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleAddProperty}
                        disabled={!canCreateProjects}
                        className={!canCreateProjects ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        <Plus className="h-4 w-4 mr-2" />Add Property
                      </Button>
                    </TooltipTrigger>
                    {!canCreateProjects && (
                      <TooltipContent>
                        <p>Available after account approval</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </Card>
            )}

            {/* Simple pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages, page + 1))}>Next</Button>
              </div>
            )}
          </main>
        </div>
      </DeveloperSidebar>
    </ProtectedRoute>
  )
}