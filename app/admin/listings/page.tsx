"use client"

// Admin Listings Management Page
// View and manage all listings with search, pagination, and delete functionality

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { 
  getAllProjects,
  deleteProject,
  AdminApiError,
  type AdminProject,
  type AdminProjectsResponse
} from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Search,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Eye,
  MapPin,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

function ListingsManagementContent() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectIdSearch, setProjectIdSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<AdminProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load projects
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {
        page: currentPage,
        per_page: perPage,
      };

      if (projectIdSearch.trim()) {
        params.project_id = projectIdSearch.trim();
      } else if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await getAllProjects(params);
      setProjects(response.projects || []);
      setTotal(response.total || 0);
      setTotalPages(response.total_pages || 0);
    } catch (err) {
      console.error('Error loading projects:', err);
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Failed to load listings. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [currentPage]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    loadProjects();
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setProjectIdSearch('');
    setCurrentPage(1);
    loadProjects();
  };

  // Handle delete confirmation
  const handleDeleteClick = (project: AdminProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setDeleting(true);
      await deleteProject(projectToDelete.id);
      toast.success('Listing deleted successfully');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      // Reload projects
      await loadProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      if (err instanceof AdminApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to delete listing. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading && projects.length === 0) {
    return <ListingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Listings</h1>
          <p className="text-gray-600 mt-1">
            View and manage all property listings. Search by ID or name, and delete listings for ToS violations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={loadProjects} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Listings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search by Project ID</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter project ID (UUID)"
                  value={projectIdSearch}
                  onChange={(e) => setProjectIdSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {projectIdSearch && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setProjectIdSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search by Name, Description, or City</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {(searchTerm || projectIdSearch) && (
              <Button variant="outline" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Projects List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>All Listings</span>
          </CardTitle>
          <Badge variant="outline">
            {total} total
          </Badge>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No listings found</p>
              <p className="text-sm">
                {searchTerm || projectIdSearch
                  ? 'Try adjusting your search criteria'
                  : 'No listings have been created yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={() => handleDeleteClick(project)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} listings
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {projectToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="font-medium text-gray-900">{projectToDelete.name}</p>
                <p className="text-sm text-gray-600">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {projectToDelete.city}, {projectToDelete.country}
                </p>
                <p className="text-sm text-gray-600">
                  <User className="h-3 w-3 inline mr-1" />
                  {projectToDelete.developer.company_name || 'Unknown Developer'}
                </p>
                <p className="text-xs text-gray-500">
                  ID: {projectToDelete.id}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Listing
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  onDelete,
}: {
  project: AdminProject;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{project.name}</p>
              {!project.is_active && (
                <Badge variant="secondary" className="text-xs">Inactive</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500 ml-[52px]">
          <span className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {project.city}, {project.country}
          </span>
          <span className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            {project.developer.company_name || 'Unknown Developer'}
          </span>
          <span className="flex items-center">
            <Building2 className="h-3 w-3 mr-1" />
            {project.project_type.replace('_', ' ')}
          </span>
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
          {project.images_count > 0 && (
            <span className="text-gray-400">
              {project.images_count} image{project.images_count !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="mt-2 ml-[52px]">
          <p className="text-xs text-gray-400 font-mono">ID: {project.id}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href={`/admin/listings/${project.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}

// Loading skeleton
function ListingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with providers
export default function ListingsManagementPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <ListingsManagementContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}

