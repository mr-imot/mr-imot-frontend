"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Filter,
  Download,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { getAdminAudit, AdminAuditLog } from '@/lib/admin-api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const logs = await getAdminAudit();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'success' && log.success) ||
      (statusFilter === 'failed' && !log.success);

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesStatus && matchesAction;
  });

  const toggleDetails = (logId: string) => {
    setShowDetails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('verify') || actionLower.includes('approve')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (actionLower.includes('reject') || actionLower.includes('delete')) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return <Shield className="h-4 w-4 text-blue-600" />;
    }
    return <Clock className="h-4 w-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('verify') || actionLower.includes('approve')) {
      return 'bg-green-100 text-green-800';
    }
    if (actionLower.includes('reject') || actionLower.includes('delete')) {
      return 'bg-red-100 text-red-800';
    }
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const exportAuditLogs = () => {
    const csvContent = [
      'Timestamp,Action,Target Type,Target ID,Admin Email,Success,Error Message,IP Address',
      ...filteredLogs.map(log => 
        `"${log.timestamp}","${log.action}","${log.target_type}","${log.target_id}","${log.admin_email}","${log.success}","${log.error_message || ''}","${log.ip_address || ''}"`
      ).join('\n')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Audit Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Audit Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadAuditLogs} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Audit Logs</span>
            <Badge variant="secondary">{filteredLogs.length}</Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportAuditLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={loadAuditLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="verify_developer">Verify Developer</SelectItem>
              <SelectItem value="reject_developer">Reject Developer</SelectItem>
              <SelectItem value="send_notification">Send Notification</SelectItem>
              <SelectItem value="login">Login</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Logs List */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No audit logs found</p>
              <p className="text-sm mt-1">Audit logs will appear here as admin actions are performed</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(log.action)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{log.action}</span>
                        <Badge 
                          variant={log.success ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getActionColor(log.action)}`}
                        >
                          {log.target_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Target: {log.target_id} • Admin: {log.admin_email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleDetails(log.id)}
                  >
                    {showDetails.has(log.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Expanded Details */}
                {showDetails.has(log.id) && (
                  <div className="border-t pt-3 space-y-2">
                    {log.error_message && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <p className="text-sm text-red-800">
                          <strong>Error:</strong> {log.error_message}
                        </p>
                      </div>
                    )}
                    
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-sm font-medium text-blue-800 mb-1">Changes:</p>
                        <pre className="text-xs text-blue-700 whitespace-pre-wrap">
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      {log.ip_address && (
                        <div>
                          <strong>IP Address:</strong> {log.ip_address}
                        </div>
                      )}
                      {log.user_agent && (
                        <div>
                          <strong>User Agent:</strong> {log.user_agent}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
} 