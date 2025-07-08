'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Shield } from 'lucide-react';

import {
  auth, googleProvider, db
} from '../lib/firebase';
import {
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  doc, getDoc, setDoc
} from 'firebase/firestore';

export default function SignIn() {
  const [isLoading, setIsLoading]     = useState(false);
  const [selectedTab, setSelectedTab] = useState<'employee' | 'admin'>('employee');
  const [error, setError]             = useState<string>('');
  const router                        = useRouter();

  // If already logged in, redirect immediately
  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      const { role } = JSON.parse(session);
      router.replace(role === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    }
  }, [router]);

  const initializeDefaultRoles = async () => {
    const adminRef    = doc(db, 'roles', 'admins');
    const adminSnap   = await getDoc(adminRef);
    const employeeRef = doc(db, 'roles', 'employees');
    const employeeSnap= await getDoc(employeeRef);

    if (!adminSnap.exists()) {
      await setDoc(adminRef,    { emails: ['thirupathip.aiml2023@citchennai.net'] });
    }
    if (!employeeSnap.exists()) {
      await setDoc(employeeRef, { emails: ['vengi@citchennai.net'] });
    }

    // re-fetch
    const { emails: admins    } = (await getDoc(adminRef)).data()!;
    const { emails: employees } = (await getDoc(employeeRef)).data()!;

    return { admins, employees };
  };

  /**
   * Call backend API (`/employees/{email}`) to make sure the employee exists
   * in the Google Sheet before allowing sign-in.
   */
  const verifyEmployeeExists = async (email: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${apiBase}/employees/${encodeURIComponent(email)}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null; // network / server error – treat as not found
    }
  };

  const handleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      let verifiedEmployee: any = null; // will hold employee data if employee login

      const { user } = await signInWithPopup(auth, googleProvider);

      if (!user.email?.endsWith('@citchennai.net')) {
        await signOut(auth);
        throw new Error('Please use your organization email to sign in.');
      }

      const email = user.email.toLowerCase();
      const { admins, employees } = await initializeDefaultRoles();

      // Admin flow
      if (selectedTab === 'admin') {
        if (!admins.includes(email)) {
          await signOut(auth);
          throw new Error('Only the specified admin account is allowed.');
        }
      }
      // Employee flow
      else {
        // Verify presence in Employee Sheet via backend
        const empData = await verifyEmployeeExists(email);
        if (!empData) {
          await signOut(auth);
          throw new Error('Employee record not found. Please contact HR.');
        }
        // Save for later
        verifiedEmployee = empData;
      }

      // Success → persist & redirect
      const session:any = {
        user: {
          email,
          displayName: user.displayName || email.split('@')[0]
        },
        role: selectedTab,
      };

      // Attach employee details (including photo_url) for employee role
      if (selectedTab === 'employee') {
        session.employee = verifiedEmployee;
      }
      localStorage.setItem('userSession', JSON.stringify(session));

      router.push(selectedTab === 'admin' ? '/admin/dashboard' : '/employee/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* …background elements… */}

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EPICAL LAYOUTS
          </h1>
          <p className="text-gray-600 mt-2">HR Management System</p>
        </div>

        <Card className="glass backdrop-blur-xl border-white/30 shadow-2xl animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to access your workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="employee"
              onValueChange={(val) => setSelectedTab(val as 'employee' | 'admin')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Employee
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Admin
                </TabsTrigger>
              </TabsList>

              <TabsContent value="employee" className="space-y-4">
                <Button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  {/* Google Icon + spinner… identical to before */}
                  {isLoading
                    ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Signing in…</>)
                    : 'Sign in with Google'
                  }
                </Button>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <Button
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  {isLoading
                    ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Signing in…</>)
                    : 'Sign in with Google'
                  }
                </Button>
              </TabsContent>
            </Tabs>

            {/* error message */}
            {error && (
              <p className="mt-4 text-center text-red-600">{error}</p>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Login with Company domain
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in">
          <p>© 2025 EPICAL LAYOUTS PVT LTD. All rights reserved.</p>
          <p className="mt-1">Secure • Professional • Efficient</p>
        </div>
      </div>
    </div>
  );
}
