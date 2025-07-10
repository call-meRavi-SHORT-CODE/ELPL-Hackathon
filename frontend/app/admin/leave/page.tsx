'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  MessageSquare
} from 'lucide-react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { format, parse, isValid } from 'date-fns';

export default function AdminLeavePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Holiday management state
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loadingHolidays, setLoadingHolidays] = useState(true);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [holidayDialogMode, setHolidayDialogMode] = useState<'add' | 'edit'>('add');
  const [editingHoliday, setEditingHoliday] = useState<{name:string,date:string}|null>(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '', // yyyy-mm-dd
    type: '',
    description: '',
    recurring: false,
  });

  const user = {
    name: 'Admin User',
    email: 'admin@epicallayouts.com'
  };

  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [leaveStats, setLeaveStats] = useState({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgProcessingTime: ''
  });
  const [leaveTypes, setLeaveTypes] = useState<string[]>([]);

  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = request.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesType = selectedType === 'all' || request.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleApprove = async (request: any) => {
    const pendingToast = toast({ title: 'Approving…', duration: 60000 });
    try {
      const res = await fetch(
        `${apiBase}/leaves/${encodeURIComponent(request.employeeEmail)}/${encodeURIComponent(request.appliedDateStr)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Accepted' }),
        },
      );
      if (!res.ok) throw new Error('Failed to approve');
      await fetchLeavesAndEmployees();
      pendingToast.dismiss();
      toast({ title: 'Leave approved', variant: 'success' });
    } catch (err) {
      console.error(err);
      pendingToast.dismiss();
      toast({ title: 'Error', description: 'Failed to approve leave', variant: 'destructive' });
    }
  };

  const handleReject = async (request: any) => {
    const pendingToast = toast({ title: 'Rejecting…', duration: 60000 });
    try {
      const res = await fetch(
        `${apiBase}/leaves/${encodeURIComponent(request.employeeEmail)}/${encodeURIComponent(request.appliedDateStr)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Denied' }),
        },
      );
      if (!res.ok) throw new Error('Failed to reject');
      await fetchLeavesAndEmployees();
      pendingToast.dismiss();
      toast({ title: 'Leave rejected', variant: 'success' });
    } catch (err) {
      console.error(err);
      pendingToast.dismiss();
      toast({ title: 'Error', description: 'Failed to reject leave', variant: 'destructive' });
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

  const fetchHolidays = async () => {
    try {
      const res = await fetch(`${apiBase}/holidays/`);
      if (res.ok) {
        setHolidays(await res.json());
      }
      setLoadingHolidays(false);
    } catch (err) {
      console.error(err);
      setLoadingHolidays(false);
    }
  };

  // --------------------------------------------------------------------
  // Fetch leaves + employees and compute stats
  // --------------------------------------------------------------------
  const fetchLeavesAndEmployees = async () => {
    try {
      setLoadingLeaves(true);
      const [leavesRes, empRes] = await Promise.all([
        fetch(`${apiBase}/leaves/`),
        fetch(`${apiBase}/employees/`)
      ]);

      const leaves: any[] = leavesRes.ok ? await leavesRes.json() : [];
      const employees: any[] = empRes.ok ? await empRes.json() : [];

      // Helper to map backend status to UI status
      const mapStatus = (s: string) => {
        const val = s.toLowerCase();
        if (val === 'accepted') return 'approved';
        if (val === 'denied') return 'rejected';
        return 'pending';
      };

      // Transform for UI consumption
      const mapped = leaves.map((lv, idx) => {
        const emp = employees.find((e: any) => e.email.toLowerCase() === lv.employee.toLowerCase());
        const fromDt = parse(lv.from_date, 'dd-MM-yyyy', new Date());
        const toDt = parse(lv.to_date, 'dd-MM-yyyy', new Date());
        const appliedDt = parse(lv.applied_date, 'dd-MM-yyyy', new Date());
        return {
          id: idx + 1,
          employee: emp ? emp.name : lv.employee,
          department: emp ? emp.department : '',
          type: lv.leave_type,
          fromDate: fromDt.toISOString(),
          toDate: toDt.toISOString(),
          days: lv.duration,
          reason: lv.reason,
          status: mapStatus(lv.status),
          appliedOn: appliedDt.toISOString(),
          employeeEmail: lv.employee,
          appliedDateStr: lv.applied_date
        };
      });

      setLeaveRequests(mapped);

      // Stats calculation
      const total = mapped.length;
      const pending = mapped.filter(r => r.status === 'pending').length;
      const approved = mapped.filter(r => r.status === 'approved').length;
      const rejected = mapped.filter(r => r.status === 'rejected').length;
      setLeaveStats({
        totalRequests: total,
        pending,
        approved,
        rejected,
        avgProcessingTime: ''
      });

      // Leave types
      setLeaveTypes(Array.from(new Set(mapped.map(r => r.type))) as string[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchHolidays();
    fetchLeavesAndEmployees();
  }, []);

  const openAddHoliday = () => {
    setHolidayDialogMode('add');
    setHolidayForm({ name:'',date:'',type:'',description:'',recurring:false});
    setEditingHoliday(null);
    setHolidayDialogOpen(true);
  };

  const openEditHoliday = (h: any) => {
    // Convert dd-mm-yyyy to yyyy-mm-dd for <input type="date">
    const toIso = (ddmmyyyy: string) => {
      const parts = ddmmyyyy.split('-');
      if (parts.length === 3) {
        const [dd, mm, yy] = parts;
        return `${yy}-${mm}-${dd}`;
      }
      return ddmmyyyy; // fallback
    };

    setHolidayDialogMode('edit');
    setHolidayForm({
      name: h.name,
      date: toIso(h.date), // ISO for input
      type: h.type,
      description: h.description || '',
      recurring: h.recurring,
    });
    setEditingHoliday({ name: h.name, date: h.date }); // Keep original dd-mm-yyyy for path
    setHolidayDialogOpen(true);
  };

  const handleHolidayFormChange = (e:any) => {
    const { name, value, type:inputType, checked } = e.target;
    setHolidayForm(prev=>({...prev,[name]: inputType==='checkbox'?checked:value}));
  };

  const saveHoliday = async () => {
    const pending = toast({title: holidayDialogMode==='add'?'Adding holiday…':'Saving holiday…', duration:60000});
    try {
      let ok=false;
      if(holidayDialogMode==='add'){
        const res= await fetch(`${apiBase}/holidays/`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(holidayForm)});
        ok=res.ok;
      }else if(editingHoliday){
        const res= await fetch(`${apiBase}/holidays/${encodeURIComponent(editingHoliday.name)}/${encodeURIComponent(editingHoliday.date)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(holidayForm)});
        ok=res.ok;
      }
      if(!ok) throw new Error('save failed');
      await fetchHolidays();
      pending.dismiss();
      toast({title:'Holiday saved',variant:'success',duration:3000});
      setHolidayDialogOpen(false);
    }catch(err){
      console.error(err);
      pending.dismiss();
      toast({title:'Error',description:'Failed to save holiday',variant:'destructive',duration:3000});
    }
  };

  const deleteHoliday = async (h:any) => {
    const pending=toast({title:'Deleting…',duration:60000});
    try{
      const res=await fetch(`${apiBase}/holidays/${encodeURIComponent(h.name)}/${encodeURIComponent(h.date)}`,{method:'DELETE'});
      if(!res.ok) throw new Error('delete failed');
      await fetchHolidays();
      pending.dismiss();
      toast({title:'Holiday deleted',variant:'success',duration:3000});
    }catch(err){
      console.error(err);
      pending.dismiss();
      toast({title:'Error',description:'Failed to delete holiday',variant:'destructive',duration:3000});
    }
  };

  const formatHolidayDate = (dateStr:string) => {
    // Try ISO first (yyyy-mm-dd)
    let d = new Date(dateStr);
    if(!isValid(d)){
      // Try dd-mm-yyyy format
      d = parse(dateStr,'dd-MM-yyyy',new Date());
    }
    return isValid(d)? format(d,'dd MMM yyyy') : dateStr;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isAdmin={true} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Leave Management" user={user} />
        
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-3xl font-bold text-blue-600">{leaveStats.totalRequests}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{leaveStats.pending}</p>
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
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-3xl font-bold text-green-600">{leaveStats.approved}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-3xl font-bold text-red-600">{leaveStats.rejected}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                    <p className="text-2xl font-bold text-purple-600">{leaveStats.avgProcessingTime}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="requests" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="requests">Leave Requests</TabsTrigger>
                <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="holidays">Holidays</TabsTrigger>
              </TabsList>

              {/* Leave Requests */}
              <TabsContent value="requests" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Leave Requests
                        </CardTitle>
                        <CardDescription>
                          Review and manage employee leave applications
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
                            placeholder="Search by employee or department..."
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
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="type">Leave Type</Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            {leaveTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
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
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </div>
                                </Badge>
                                <Badge variant="outline">{request.department}</Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Type: </span>
                                  {request.type}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Duration: </span>
                                  {format(new Date(request.fromDate), 'MMM dd')} - {format(new Date(request.toDate), 'MMM dd')}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Days: </span>
                                  {request.days}
                                </div>
                                {/* Balance data not available from backend; removed */}
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Reason: </span>
                                {request.reason}
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                Applied on {format(new Date(request.appliedOn), 'MMM dd, yyyy')}
                                {request.approvedBy && (
                                  <span className="text-green-600"> • Approved by {request.approvedBy}</span>
                                )}
                                {request.rejectedBy && (
                                  <span className="text-red-600"> • Rejected by {request.rejectedBy}</span>
                                )}
                              </div>
                              
                              {request.rejectionReason && (
                                <div className="p-2 bg-red-50 rounded border-l-4 border-red-200">
                                  <p className="text-sm text-red-800">
                                    <strong>Rejection Reason:</strong> {request.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(request)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleReject(request)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredRequests.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No leave requests found matching your criteria</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leave Calendar */}
              <TabsContent value="calendar" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Leave Calendar</CardTitle>
                    <CardDescription>
                      Visual overview of approved leaves and holidays
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Calendar view coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reports */}
              <TabsContent value="reports" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Leave Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span>Most Requested</span>
                          <span className="font-semibold text-blue-600">Casual Leave</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span>Approval Rate</span>
                          <span className="font-semibold text-green-600">88%</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                          <span>Peak Month</span>
                          <span className="font-semibold text-purple-600">December</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Department Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Engineering</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Design</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }} />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Marketing</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '20%' }} />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Others</span>
                          <span className="text-sm font-medium">10%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: '10%' }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Holidays Management */}
              <TabsContent value="holidays" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5"/> Public Holidays</CardTitle>
                      <CardDescription>Manage company holiday calendar</CardDescription>
                    </div>
                    <Button onClick={openAddHoliday} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Add Holiday</Button>
                  </CardHeader>
                  <CardContent>
                    {loadingHolidays ? (
                      <p className="text-center py-8 text-gray-400">Loading holidays…</p>
                    ) : holidays.length===0 ? (
                      <p className="text-center py-8 text-gray-400">No holidays defined</p>
                    ) : (
                      <div className="space-y-4">
                        {holidays.map((h:any,idx:number)=>(
                          <div key={idx} className="p-4 border rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                              <h4 className="font-medium text-lg">{h.name}</h4>
                              <p className="text-sm text-gray-600">{formatHolidayDate(h.date)} • {h.type} {h.recurring?'• Recurring':''}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={()=>openEditHoliday(h)}>Edit</Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Holiday</AlertDialogTitle>
                                    <AlertDialogDescription>Are you sure you want to delete {h.name}?</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={()=>deleteHoliday(h)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Dialog for Add/Edit Holiday */}
              <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{holidayDialogMode==='add'?'Add Holiday':'Edit Holiday'}</DialogTitle>
                    <DialogDescription>Fill details and save.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="hname">Name</Label>
                      <Input id="hname" name="name" value={holidayForm.name} onChange={handleHolidayFormChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="hdate">Date</Label>
                      <Input id="hdate" name="date" type="date" value={holidayForm.date} onChange={handleHolidayFormChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="htype">Type</Label>
                      <Input id="htype" name="type" value={holidayForm.type} onChange={handleHolidayFormChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="hdesc">Description</Label>
                      <Textarea id="hdesc" name="description" value={holidayForm.description} onChange={handleHolidayFormChange} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="recurring" name="recurring" checked={holidayForm.recurring} onCheckedChange={(val)=>setHolidayForm(prev=>({...prev,recurring:val}))}/>
                      <Label htmlFor="recurring">Recurring annually</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={saveHoliday} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Save</Button>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}