'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Users
} from 'lucide-react';

export default function AdminDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const user = {
    name: 'Admin User',
    email: 'admin@epicallayouts.com'
  };

  const documentRequests = [
    {
      id: 1,
      employee: 'Ravikrishna J',
      department: 'Engineering',
      type: 'Bonafide Certificate',
      purpose: 'Bank loan application',
      requestDate: '2025-01-20',
      status: 'pending',
      expectedDate: '2025-01-25'
    },
    {
      id: 2,
      employee: 'Priya Sharma',
      department: 'Design',
      type: 'Salary Certificate',
      purpose: 'Visa application',
      requestDate: '2025-01-15',
      status: 'completed',
      completedDate: '2025-01-18'
    },
    {
      id: 3,
      employee: 'Arjun Patel',
      department: 'Marketing',
      type: 'Experience Letter',
      purpose: 'Job application',
      requestDate: '2025-01-10',
      status: 'in_progress',
      expectedDate: '2025-01-22'
    }
  ];

  const companyDocuments = [
    {
      id: 1,
      name: 'Employee Handbook 2025.pdf',
      category: 'Policy',
      uploadDate: '2025-01-01',
      size: '2.4 MB',
      access: 'all_employees',
      downloads: 45
    },
    {
      id: 2,
      name: 'Leave Policy.pdf',
      category: 'Policy',
      uploadDate: '2024-12-15',
      size: '1.2 MB',
      access: 'all_employees',
      downloads: 32
    },
    {
      id: 3,
      name: 'Code of Conduct.pdf',
      category: 'Policy',
      uploadDate: '2024-11-20',
      size: '856 KB',
      access: 'all_employees',
      downloads: 28
    },
    {
      id: 4,
      name: 'IT Security Guidelines.pdf',
      category: 'Guidelines',
      uploadDate: '2024-10-10',
      size: '1.8 MB',
      access: 'all_employees',
      downloads: 19
    }
  ];

  const documentStats = {
    totalRequests: 15,
    pending: 5,
    completed: 8,
    inProgress: 2,
    avgProcessingTime: '3.2 days'
  };

  const filteredRequests = documentRequests.filter(request => {
    const matchesSearch = request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredDocuments = companyDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isAdmin={true} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Document Management" user={user} />
        
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-3xl font-bold text-blue-600">{documentStats.totalRequests}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{documentStats.pending}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-blue-600">{documentStats.inProgress}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-green-600">{documentStats.completed}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                    <p className="text-2xl font-bold text-purple-600">{documentStats.avgProcessingTime}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="requests">Document Requests</TabsTrigger>
                <TabsTrigger value="library">Document Library</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>

              {/* Document Requests */}
              <TabsContent value="requests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Document Requests
                        </CardTitle>
                        <CardDescription>
                          Manage employee document requests
                        </CardDescription>
                      </div>
                      <Button>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <Label htmlFor="search">Search</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="search"
                            placeholder="Search by employee or document type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger className="w-36">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Requests List */}
                    <div className="space-y-4">
                      {filteredRequests.map((request) => (
                        <div key={request.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-lg">{request.employee}</h4>
                                <Badge className={getStatusColor(request.status)}>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(request.status)}
                                    {request.status.replace('_', ' ').charAt(0).toUpperCase() + request.status.replace('_', ' ').slice(1)}
                                  </div>
                                </Badge>
                                <Badge variant="outline">{request.department}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Document: </span>
                                  {request.type}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Purpose: </span>
                                  {request.purpose}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Requested: </span>
                                  {request.requestDate}
                                </div>
                              </div>
                              
                              {request.expectedDate && (
                                <div className="text-xs text-blue-600">
                                  Expected completion: {request.expectedDate}
                                </div>
                              )}
                              
                              {request.completedDate && (
                                <div className="text-xs text-green-600">
                                  Completed on: {request.completedDate}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {request.status === 'pending' && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  Process
                                </Button>
                              )}
                              {request.status === 'completed' && (
                                <Button size="sm" variant="outline">
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredRequests.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No document requests found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Document Library */}
              <TabsContent value="library" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Company Document Library
                        </CardTitle>
                        <CardDescription>
                          Manage company policies and documents
                        </CardDescription>
                      </div>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <Label htmlFor="search-docs">Search Documents</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="search-docs"
                            placeholder="Search documents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-36">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Policy">Policy</SelectItem>
                            <SelectItem value="Guidelines">Guidelines</SelectItem>
                            <SelectItem value="Forms">Forms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Documents List */}
                    <div className="space-y-4">
                      {filteredDocuments.map((document) => (
                        <div key={document.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">{document.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{document.category}</span>
                                  <span>•</span>
                                  <span>{document.size}</span>
                                  <span>•</span>
                                  <span>Uploaded: {document.uploadDate}</span>
                                  <span>•</span>
                                  <span>{document.downloads} downloads</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                <Users className="h-3 w-3 mr-1" />
                                {document.access.replace('_', ' ')}
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Templates */}
              <TabsContent value="templates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Document Templates
                    </CardTitle>
                    <CardDescription>
                      Manage templates for commonly requested documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Document templates coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}