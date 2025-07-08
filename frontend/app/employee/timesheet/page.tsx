'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Play, Pause, Store as Stop, Plus, CalendarIcon, Timer, BarChart3, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function TimesheetPage() {
  const [currentTimer, setCurrentTimer] = useState({
    isRunning: false,
    project: 'Website Redesign',
    task: 'Frontend Development',
    elapsed: '02:45:33'
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newEntry, setNewEntry] = useState({
    project: '',
    task: '',
    hours: '',
    minutes: '',
    description: ''
  });

  const user = {
    name: 'Ravikrishna J',
    email: 'ravikrishna@epicallayouts.com'
  };

  const projects = [
    'Website Redesign',
    'Mobile App UI',
    'Brand Guidelines',
    'E-commerce Platform',
    'Client Portal'
  ];

  const todaysEntries = [
    {
      id: 1,
      project: 'Website Redesign',
      task: 'Frontend Development',
      duration: '02:45:33',
      description: 'Implementing responsive navbar and hero section',
      status: 'running'
    },
    {
      id: 2,
      project: 'Mobile App UI',
      task: 'Design Review',
      duration: '01:30:00',
      description: 'Reviewing wireframes and providing feedback',
      status: 'completed'
    }
  ];

  const weeklyStats = {
    totalHours: '42:30',
    averageDaily: '8:30',
    projectBreakdown: [
      { project: 'Website Redesign', hours: '18:45', percentage: 44 },
      { project: 'Mobile App UI', hours: '12:30', percentage: 29 },
      { project: 'Brand Guidelines', hours: '8:15', percentage: 19 },
      { project: 'Client Portal', hours: '3:00', percentage: 8 }
    ]
  };

  const toggleTimer = () => {
    setCurrentTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const addManualEntry = () => {
    // Handle manual entry addition
    console.log('Adding manual entry:', newEntry);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Timesheet Management" user={user} />
        
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Current Timer */}
            <Card className={`${currentTimer.isRunning ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-gray-50'} transition-all duration-300`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${currentTimer.isRunning ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Timer className={`h-6 w-6 ${currentTimer.isRunning ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {currentTimer.isRunning ? 'Currently Working On' : 'Ready to Start'}
                      </h3>
                      <p className="text-gray-600">
                        {currentTimer.project} - {currentTimer.task}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${currentTimer.isRunning ? 'text-green-600' : 'text-gray-400'}`}>
                      {currentTimer.elapsed}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentTimer.isRunning ? 'Active Time' : 'Stopped'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={toggleTimer}
                    className={currentTimer.isRunning ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {currentTimer.isRunning ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Timer
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Timer
                      </>
                    )}
                  </Button>
                  <Button variant="outline" disabled={!currentTimer.isRunning}>
                    <Stop className="h-4 w-4 mr-2" />
                    Stop & Save
                  </Button>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Switch Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="today" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="today">Today's Entries</TabsTrigger>
                <TabsTrigger value="manual">Add Entry</TabsTrigger>
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Today's Entries */}
              <TabsContent value="today" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Today's Time Entries
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(), 'EEEE, MMMM do, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {todaysEntries.map((entry) => (
                        <div key={entry.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{entry.project}</h4>
                                <Badge 
                                  variant={entry.status === 'running' ? 'default' : 'secondary'}
                                  className={entry.status === 'running' ? 'bg-green-100 text-green-800' : ''}
                                >
                                  {entry.status === 'running' ? '● Running' : 'Completed'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{entry.task}</p>
                              <p className="text-xs text-gray-500">{entry.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg">{entry.duration}</p>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="outline">Delete</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manual Entry */}
              <TabsContent value="manual" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Manual Time Entry
                    </CardTitle>
                    <CardDescription>
                      Add time entries for work completed offline
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="project">Project</Label>
                        <Select value={newEntry.project} onValueChange={(value) => setNewEntry(prev => ({ ...prev, project: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project} value={project}>
                                {project}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="task">Task Description</Label>
                      <Input
                        id="task"
                        placeholder="e.g., Frontend Development"
                        value={newEntry.task}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, task: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hours">Hours</Label>
                        <Input
                          id="hours"
                          type="number"
                          placeholder="8"
                          min="0"
                          max="24"
                          value={newEntry.hours}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, hours: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minutes">Minutes</Label>
                        <Input
                          id="minutes"
                          type="number"
                          placeholder="30"
                          min="0"
                          max="59"
                          value={newEntry.minutes}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, minutes: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what you worked on..."
                        value={newEntry.description}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <Button onClick={addManualEntry} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Entry
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Weekly View */}
              <TabsContent value="weekly" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      This Week's Summary
                    </CardTitle>
                    <CardDescription>
                      January 20 - January 26, 2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{weeklyStats.totalHours}</p>
                        <p className="text-sm text-gray-600">Total Hours</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{weeklyStats.averageDaily}</p>
                        <p className="text-sm text-gray-600">Daily Average</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">5</p>
                        <p className="text-sm text-gray-600">Days Worked</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Project Breakdown</h4>
                      {weeklyStats.projectBreakdown.map((project, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{project.project}</span>
                            <span className="text-sm text-gray-600">{project.hours}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${project.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Productivity Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">+12%</p>
                          <p className="text-sm text-gray-600">vs. Last Week</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="font-semibold text-blue-600">Peak Hours</p>
                            <p className="text-sm text-gray-600">9-11 AM</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="font-semibold text-purple-600">Most Productive</p>
                            <p className="text-sm text-gray-600">Tuesday</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span>Hours This Month</span>
                          <span className="font-semibold">124:30</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span>Working Days</span>
                          <span className="font-semibold">18/22</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span>Overtime Hours</span>
                          <span className="font-semibold text-orange-600">8:30</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span>Efficiency Score</span>
                          <span className="font-semibold text-green-600">94%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}