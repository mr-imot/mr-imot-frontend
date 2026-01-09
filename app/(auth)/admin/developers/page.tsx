"use client"

// Admin Developer Management Page
// Comprehensive interface for managing developer applications with bulk operations

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/admin/protected-route';
import { AdminAuthProvider } from '@/components/admin/admin-auth-provider';
import { 
  getPendingDevelopers,
  verifyDeveloper,
  rejectDeveloper,
  bulkVerifyDevelopers,
  bulkRejectDevelopers,
  AdminApiError,
  type PendingDeveloper
} from '@/lib/admin-api';
import { notifyDeveloperVerified, notifyDeveloperRejected } from '@/lib/admin-notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Building,
  Phone,
  Mail,
  Globe,
  MapPin,
  MoreVertical,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';


function DeveloperManagementContent() {
  const [developers, setDevelopers] = useState<PendingDeveloper[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<PendingDeveloper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'email'>('date');
  const [selectedDevelopers, setSelectedDevelopers] = useState<Set<string>>(new Set());
  const [processingBulk, setProcessingBulk] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Load developers
  const loadDevelopers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPendingDevelopers();
      setDevelopers(data);
      setFilteredDevelopers(data);
    } catch (err) {
      console.error('Error loading developers:', err);
      if (err instanceof AdminApiError) {
        setError(err.message);
      } else {
        setError('Failed to load developers. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevelopers();
  }, []);

  // Filter and sort developers
  useEffect(() => {
    let filtered = developers.filter(dev => 
      dev.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.company_name.localeCompare(b.company_name);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredDevelopers(filtered);
  }, [developers, searchTerm, sortBy]);

  // Handle individual developer actions
  const handleDeveloperAction = async (developerId: string, action: 'verify' | 'reject') => {
    try {
      setProcessingIds(prev => new Set(prev).add(developerId));

      // Find the developer for notification
      const developer = developers.find(dev => dev.id === developerId);

      if (action === 'verify') {
        await verifyDeveloper(developerId);
        
        // Send notification
        if (developer) {
          try {
            const notificationResult = await notifyDeveloperVerified(developer);
            if (notificationResult.success) {
              // console.log('Verification notification:', notificationResult.message);
            }
          } catch (notificationError) {
            console.error('Error sending verification notification:', notificationError);
          }
        }
      } else {
        await rejectDeveloper(developerId);
        
        // Send notification
        if (developer) {
          try {
            const notificationResult = await notifyDeveloperRejected(developer);
            if (notificationResult.success) {
              // console.log('Rejection notification:', notificationResult.message);
            }
          } catch (notificationError) {
            console.error('Error sending rejection notification:', notificationError);
          }
        }
      }

      // Remove from list
      setDevelopers(prev => prev.filter(dev => dev.id !== developerId));
      setSelectedDevelopers(prev => {
        const newSet = new Set(prev);
        newSet.delete(developerId);
        return newSet;
      });

    } catch (err) {
      console.error(`Error ${action}ing developer:`, err);
      setError(`Failed to ${action} developer. Please try again.`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(developerId);
        return newSet;
      });
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: 'verify' | 'reject') => {
    if (selectedDevelopers.size === 0) return;

    try {
      setProcessingBulk(true);
      const ids = Array.from(selectedDevelopers);

      // Find selected developers for notifications
      const selectedDevs = developers.filter(dev => selectedDevelopers.has(dev.id));

      if (action === 'verify') {
        await bulkVerifyDevelopers(ids);
        
        // Send notifications for all verified developers
        for (const developer of selectedDevs) {
          try {
            await notifyDeveloperVerified(developer);
          } catch (notificationError) {
            console.error('Error sending bulk verification notification:', notificationError);
          }
        }
      } else {
        await bulkRejectDevelopers(ids);
        
        // Send notifications for all rejected developers
        for (const developer of selectedDevs) {
          try {
            await notifyDeveloperRejected(developer);
          } catch (notificationError) {
            console.error('Error sending bulk rejection notification:', notificationError);
          }
        }
      }

      // Remove from list
      setDevelopers(prev => prev.filter(dev => !selectedDevelopers.has(dev.id)));
      setSelectedDevelopers(new Set());

    } catch (err) {
      console.error(`Error bulk ${action}ing developers:`, err);
      setError(`Failed to bulk ${action} developers. Please try again.`);
    } finally {
      setProcessingBulk(false);
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDevelopers(new Set(filteredDevelopers.map(dev => dev.id)));
    } else {
      setSelectedDevelopers(new Set());
    }
  };

  // Handle individual select
  const handleSelectDeveloper = (developerId: string, checked: boolean) => {
    setSelectedDevelopers(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(developerId);
      } else {
        newSet.delete(developerId);
      }
      return newSet;
    });
  };

  if (loading) {
    return <DeveloperManagementSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadDevelopers} className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </Button>
      </div>
    );
  }

  const allSelected = filteredDevelopers.length > 0 && selectedDevelopers.size === filteredDevelopers.length;
  const someSelected = selectedDevelopers.size > 0 && selectedDevelopers.size < filteredDevelopers.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Management</h1>
          <p className="text-gray-600">
            Review and manage developer applications ({developers.length} pending)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadDevelopers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by company, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[11.25rem]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Newest First</SelectItem>
                <SelectItem value="name">Company Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedDevelopers.size > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-900">
                  {selectedDevelopers.size} developer{selectedDevelopers.size !== 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('reject')}
                    disabled={processingBulk}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject Selected
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBulkAction('verify')}
                    disabled={processingBulk}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verify Selected
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Developers List */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Developer Applications</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-gray-500">Select All</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDevelopers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No developers found</p>
              <p className="text-sm">
                {searchTerm ? 'Try adjusting your search criteria' : 'No pending applications at this time'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredDevelopers.map((developer) => (
                <DeveloperCard
                  key={developer.id}
                  developer={developer}
                  isSelected={selectedDevelopers.has(developer.id)}
                  onSelect={handleSelectDeveloper}
                  onVerify={() => handleDeveloperAction(developer.id, 'verify')}
                  onReject={() => handleDeveloperAction(developer.id, 'reject')}
                  isProcessing={processingIds.has(developer.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Developer Card Component
function DeveloperCard({
  developer,
  isSelected,
  onSelect,
  onVerify,
  onReject,
  isProcessing,
}: {
  developer: PendingDeveloper;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onVerify: () => void;
  onReject: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className={cn(
      'p-6 hover:bg-gray-50 transition-colors',
      isSelected && 'bg-blue-50'
    )}>
      <div className="flex items-start space-x-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(developer.id, checked as boolean)}
        />

        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold text-blue-600">
            {developer.company_name.substring(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {developer.company_name}
              </h3>
              <p className="text-gray-600">{developer.contact_person}</p>
              
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{developer.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{developer.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{developer.office_address}</span>
                </div>
                {developer.website && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={developer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>Website</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center space-x-2 text-xs text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>Applied {new Date(developer.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span>{new Date(developer.created_at).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Developer Application Details</DialogTitle>
                  </DialogHeader>
                  <DeveloperDetails developer={developer} />
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                disabled={isProcessing}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={onVerify}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Verify
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Developer Details Modal Content
function DeveloperDetails({ developer }: { developer: PendingDeveloper }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Company Name:</span>
              <div className="font-medium">{developer.company_name}</div>
            </div>
            <div>
              <span className="text-gray-500">Contact Person:</span>
              <div className="font-medium">{developer.contact_person}</div>
            </div>
            <div>
              <span className="text-gray-500">Office Address:</span>
              <div className="font-medium">{developer.office_address}</div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Email:</span>
              <div className="font-medium">{developer.email}</div>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <div className="font-medium">{developer.phone}</div>
            </div>
            {developer.website && (
              <div>
                <span className="text-gray-500">Website:</span>
                <div className="font-medium">
                  <a 
                    href={developer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {developer.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Application Information</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Application ID:</span>
            <div className="font-medium font-mono">{developer.id}</div>
          </div>
          <div>
            <span className="text-gray-500">Submitted:</span>
            <div className="font-medium">
              {new Date(developer.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function DeveloperManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-6">
                <div className="flex items-start space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-12 w-12" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with providers
export default function DeveloperManagementPage() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <DeveloperManagementContent />
      </AdminLayout>
    </ProtectedRoute>
  );
} 