"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"

import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

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

import { getDeveloperProjects, updateProject, deleteProject } from "@/lib/api"

import { Building2, Home, BarChart3, MessageSquare, User, Settings, Plus, MapPin, Eye, Globe, Phone, Calendar, Pencil, Trash2, Power } from "lucide-react"

function DeveloperSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const nav = [
    { icon: Home, label: "Dashboard", href: "/developer/dashboard" },
    { icon: Building2, label: "Properties", href: "/developer/properties" },
    { icon: BarChart3, label: "Analytics", href: "/developer/analytics" },
    { icon: MessageSquare, label: "Inquiries", href: "/developer/inquiries" },
    { icon: User, label: "Profile", href: "/developer/profile" },
    { icon: Settings, label: "Settings", href: "/developer/settings" },
  ]
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
              {nav.map((item) => {
                const isActive = pathname?.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={!!isActive} aria-current={isActive ? "page" : undefined} onClick={() => router.push(item.href)}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarRail className="md:top-16" />
      <SidebarTrigger className="fixed top-4 left-4 z-50 md:hidden" />
    </>
  )
}

type StatusFilter = "all" | "active" | "draft" | "paused"

export default function DeveloperPropertiesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [sortKey, setSortKey] = useState<'date' | 'views' | 'clicks' | 'website' | 'phone'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

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
    const next = current === 'active' ? 'inactive' : 'active'
    await updateProject(id, { status: next })
    mutate()
  }

  const handleDelete = async (id: number) => {
    await deleteProject(id)
    mutate()
  }

  return (
    <ProtectedRoute requiredRole="developer">
      <SidebarProvider>
        <div className="min-h-screen bg-background flex">
          <DeveloperSidebar />
          <SidebarInset>
            <div className="p-6 w-full">
              <div className="sticky top-16 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b mb-6">
                <div className="flex items-center justify-between py-4">
                <div>
                  <h1 className="text-2xl font-bold">Your Properties</h1>
                  <p className="text-muted-foreground">Create, update and manage your listings</p>
                </div>
                <Button asChild>
                  <Link href="/developer/properties/new"><Plus className="h-4 w-4 mr-2" />Add Property</Link>
                </Button>
                </div>
              </div>

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

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="h-48 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {projects.map((p: any) => (
                    <Card key={p.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={p.cover_image_url || "/placeholder.jpg"} 
                          alt={`${p.title} - Property image`}
                          className="w-full h-full object-cover" 
                          loading="lazy"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base">{p.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {p.city || p.location || '—'}
                            </CardDescription>
                          </div>
                          <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="capitalize">{p.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.total_views ?? 0}</span>
                          <span className="inline-flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{p.total_clicks_website ?? 0}</span>
                          <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{p.total_clicks_phone ?? 0}</span>
                        </div>
                        <div className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(p.updated_at || p.created_at).toLocaleDateString()}</div>
                      </CardContent>
                      <CardContent className="flex items-center justify-between gap-2 pt-0">
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm"><Link href={`/developer/properties/new?id=${p.id}`}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Link></Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
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
                        <Button variant="outline" size="sm" onClick={() => handleToggle(p.id, p.status)}>
                          <Power className="h-3.5 w-3.5 mr-1" /> {p.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <CardTitle className="mb-2">No properties yet</CardTitle>
                  <CardDescription className="mb-6">Create your first listing to get started.</CardDescription>
                  <Button asChild><Link href="/developer/properties/new"><Plus className="h-4 w-4 mr-2" />Add Property</Link></Button>
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
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}


