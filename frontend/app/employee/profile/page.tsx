'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  Edit3, 
  Save, 
  Camera,
  Shield,
  Clock,
  Award,
  FileText
} from 'lucide-react';

export default function EmployeeProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  // Keep form inputs controlled by starting with default empty strings
  const [profileData, setProfileData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    joiningDate: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    bio: '',
    photo: '',
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<{name:string; email:string}>({name:'', email:''});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.employee) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
        setProfileData({
          name: parsed.employee.name || parsed.user.displayName,
          email: parsed.employee.email,
          phone: parsed.employee.contact || '',
          designation: parsed.employee.position || '',
          department: parsed.employee.department || '',
          joiningDate: parsed.employee.joining_date || '',
          address: '',
          emergencyContact: '',
          bloodGroup: '',
          bio: '',
          photo: `${apiBase}/employees/${encodeURIComponent(parsed.employee.email)}/photo?${Date.now()}`,
        });
        setUser({ name: parsed.employee.name || parsed.user.displayName, email: parsed.employee.email });
      }
    }
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev:any) => ({ ...prev, [field]: value }));
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileData?.email) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    setIsUploadingPhoto(true);
    const pending = toast({ title: 'Updating profile photo…', duration: 60000 });
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`${apiBase}/employees/${encodeURIComponent(profileData.email)}/photo`, {
        method: 'PUT',
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      // Refresh photo by busting cache
      setProfileData((prev:any) => ({ ...prev, photo: `${apiBase}/employees/${encodeURIComponent(profileData.email)}/photo?${Date.now()}` }));
      pending.dismiss();
      toast({ title: 'Profile photo updated', variant: 'success', duration: 3000 });
    } catch (err) {
      console.error(err);
      pending.dismiss();
      toast({ title: 'Error', description: 'Failed to update photo', variant: 'destructive', duration: 3000 });
    } finally {
      setIsUploadingPhoto(false);
      // Clear file input value so same file selection triggers change again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const achievements = [
    { title: 'Employee of the Month', date: 'December 2024', type: 'recognition' },
    { title: 'Project Excellence Award', date: 'October 2024', type: 'achievement' },
    { title: '5 Years Service', date: 'March 2024', type: 'milestone' }
  ];

  const skills = [
    'React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Git', 'Figma'
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="My Profile" user={user} />
        
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card className="shadow-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-white border-0">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-0">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Profile Information</CardTitle>
                {/* Edit button removed */}
              </CardHeader>

              <CardContent className="pt-6 pb-8">
                <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-10 items-start">
                  {/* Avatar + basic meta */}
                  <div className="flex flex-col items-center text-center md:col-span-1">
                    <div className="relative">
                      <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
                        <AvatarImage src={profileData?.photo || '/api/placeholder/160/160'} className="object-cover object-center" />
                        {isUploadingPhoto && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-full">
                            <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                          </div>
                        )}
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {profileData?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Button size="icon" disabled={isUploadingPhoto} onClick={handleCameraClick} className="absolute bottom-2 right-2 rounded-full h-10 w-10 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handlePhotoSelected}
                      />
                    </div>
                    <h2 className="text-xl font-semibold mt-4">{profileData?.name}</h2>
                    <p className="text-sm text-gray-600">{profileData?.designation}</p>
                    <p className="text-sm text-gray-500">{profileData?.department}</p>
                  </div>

                  {/* Detail grid */}
                  <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Full Name</p>
                      <p className="font-medium text-gray-900">{profileData?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="font-medium text-gray-900 break-words">{profileData?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact Number</p>
                      <p className="font-medium text-gray-900">{profileData?.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Designation</p>
                      <p className="font-medium text-gray-900">{profileData?.designation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Department</p>
                      <p className="font-medium text-gray-900">{profileData?.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Joining Date</p>
                      <p className="font-medium text-gray-900">{profileData?.joiningDate || profileData?.joining_date || '—'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {false && (
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Personal Information */}
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Manage your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData?.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData?.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData?.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergency">Emergency Contact</Label>
                        <Input
                          id="emergency"
                          value={profileData?.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="blood">Blood Group</Label>
                        <Select value={profileData?.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)} disabled={!isEditing}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="joining">Joining Date</Label>
                        <Input
                          id="joining"
                          type="date"
                          value={profileData?.joiningDate}
                          onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={profileData?.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData?.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Professional Information */}
              <TabsContent value="professional" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Work Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Designation</Label>
                        <Input value={profileData?.designation} disabled={!isEditing} readOnly={!isEditing} />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={profileData?.department} disabled={!isEditing}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Employee ID</Label>
                        <Input value="EMP001" disabled readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>Reporting Manager</Label>
                        <Input value="John Smith" disabled readOnly />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Skills & Expertise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <Button variant="outline" className="mt-4 w-full">
                          Add Skill
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Achievements */}
              <TabsContent value="achievements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements & Recognition
                    </CardTitle>
                    <CardDescription>
                      Your accomplishments and milestones at EPICAL LAYOUTS
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                            <Award className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.date}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {achievement.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Documents & Certificates
                    </CardTitle>
                    <CardDescription>
                      Upload and manage your professional documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Resume/CV</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Upload
                        </Button>
                      </div>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Educational Certificates</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Upload
                        </Button>
                      </div>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">ID Proof</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Upload
                        </Button>
                      </div>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Other Documents</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Upload
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}