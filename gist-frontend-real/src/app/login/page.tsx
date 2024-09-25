"use client";
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Footer from '@/components/footer';
import NavBar from '@/components/nav-bar';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FaGoogle } from 'react-icons/fa';

export default function Component() {
  const supabase = createClientComponentClient();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleGoogleAuth = async (isSignUp: boolean, role?: string) => {
    const redirectTo = `${window.location.origin}/auth/v1/callback?isSignUp=${isSignUp}${role ? `&role=${role}` : ''}`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          isSignUp: isSignUp ? 'true' : 'false',
          ...(role && { role }),
        },
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <NavBar />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">Welcome</CardTitle>
            <CardDescription className="text-center text-gray-500">
              Choose an option to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showRoleSelection ? (
              <>
                <Button
                  onClick={() => handleGoogleAuth(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <FaGoogle className="mr-2 h-4 w-4" /> Login with Google
                </Button>
                <Button
                  onClick={() => setShowRoleSelection(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <FaGoogle className="mr-2 h-4 w-4" /> Sign Up with Google
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleGoogleAuth(true, 'teacher')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  size="lg"
                >
                  Sign Up as Teacher
                </Button>
                <Button
                  onClick={() => handleGoogleAuth(true, 'student')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="lg"
                >
                  Sign Up as Student
                </Button>
                <Button
                  onClick={() => setShowRoleSelection(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  size="lg"
                >
                  Back
                </Button>
              </>
            )}
            <div className="text-center text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}