'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  FileText, 
  User, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Coffee,
  Activity
} from 'lucide-react';

export default function EmployeeDashboard() {
  const [user, setUser] = useState<{name:string; email:string; avatar?:string}>({name:'', email:''});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.employee) {
        setUser({
          name: parsed.employee.name || parsed.user.displayName,
          email: parsed.employee.email,
          avatar: parsed.employee.photo_url,
        });
      } else {
        setUser({
          name: parsed.user.displayName,
          email: parsed.user.email,
        });
      }
    }
  }, []);

  const todayStats = {
    checkedIn: '08:37 AM',
    totalHours: '8:20',
    breakTime: '45 min',
    status: 'Present'
  };

  const leaveBalance = {
    casual: 12,
    sick: 8,
    earned: 15,
    total: 35
  };

  const recentTimesheets = [
    { date: '2025-01-25', project: 'Website Redesign', hours: '8:30', status: 'approved' },
    { date: '2025-01-24', project: 'Mobile App UI', hours: '8:15', status: 'approved' },
    { date: '2025-01-23', project: 'Brand Guidelines', hours: '8:45', status: 'pending' },
  ];

  const quickActions = [
    { icon: Clock, label: 'Check In/Out', action: 'timesheet', color: 'blue' },
    { icon: Calendar, label: 'Apply Leave', action: 'leave', color: 'green' },
    { icon: FileText, label: 'View Payslip', action: 'payslip', color: 'purple' },
    { icon: User, label: 'Update Profile', action: 'profile', color: 'orange' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Employee Dashboard" user={user} />
        
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Good Morning, {user.name}! 👋</h2>
                  <p className="text-blue-100">Ready to make today productive?</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-100">Today's Date</p>
                  <p className="text-xl font-semibold">Jan 26, 2025</p>
                </div>
              </div>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Check-in Time</p>
                      <p className="text-2xl font-bold text-green-600">{todayStats.checkedIn}</p>
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
                      <p className="text-sm font-medium text-gray-600">Hours Today</p>
                      <p className="text-2xl font-bold text-blue-600">{todayStats.totalHours}</p>
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
                      <p className="text-sm font-medium text-gray-600">Break Time</p>
                      <p className="text-2xl font-bold text-orange-600">{todayStats.breakTime}</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Coffee className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 mt-1">
                        {todayStats.status}
                      </Badge>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used actions for easy access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-24 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-300"
                    >
                      <action.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leave Balance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Leave Balance
                  </CardTitle>
                  <CardDescription>Your remaining leave balance for this year</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Casual Leave</span>
                      <Badge variant="outline">{leaveBalance.casual} days</Badge>
                    </div>
                    <Progress value={(leaveBalance.casual / 20) * 100} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Sick Leave</span>
                      <Badge variant="outline">{leaveBalance.sick} days</Badge>
                    </div>
                    <Progress value={(leaveBalance.sick / 15) * 100} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Earned Leave</span>
                      <Badge variant="outline">{leaveBalance.earned} days</Badge>
                    </div>
                    <Progress value={(leaveBalance.earned / 25) * 100} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Available</span>
                      <Badge className="bg-green-100 text-green-800">{leaveBalance.total} days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Timesheets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Timesheets
                  </CardTitle>
                  <CardDescription>Your latest timesheet entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTimesheets.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{entry.project}</p>
                          <p className="text-xs text-gray-500">{entry.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{entry.hours}</p>
                          <Badge
                            variant={entry.status === 'approved' ? 'default' : 'secondary'}
                            className={entry.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Timesheets
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Current Timer */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Play className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Currently Working On</h3>
                      <p className="text-gray-600">Website Redesign - Frontend Development</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">02:45:33</p>
                    <p className="text-sm text-gray-500">Active Time</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Timer
                  </Button>
                  <Button size="sm" variant="outline">
                    Switch Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}