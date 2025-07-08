'use client';

import { Bell, Search, User, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function Header({ title, user }: HeaderProps) {
  // Try to get user from localStorage if not provided
  let displayUser = user;
  if (!displayUser && typeof window !== 'undefined') {
    const session = localStorage.getItem('userSession');
    if (session) {
      const parsed = JSON.parse(session);
      displayUser = {
        name: parsed.user.displayName,
        email: parsed.user.email,
        avatar: parsed.employee ? `${(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000')}/employees/${encodeURIComponent(parsed.employee.email)}/photo` : undefined,
      };
    }
  }
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    router.push('/');
  };
  return (
    <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">Welcome back to your workspace</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            className="w-64 pl-10"
          />
        </div>

        {/* Notifications */}
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={displayUser?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {displayUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {displayUser && (
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium">{displayUser.name}</p>
                  <p className="text-xs text-gray-500">{displayUser.email}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}