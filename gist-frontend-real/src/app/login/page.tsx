"use client";

import React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Footer from '@/components/footer';
import ResponsiveMenuBar from '@/components/nav-bar';

export default function Home() {
  const supabase = createClientComponentClient();

  const handleGoogleAuth = async (isSignUp: boolean) => {
    const redirectTo = `${window.location.origin}/auth/v1/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          isSignUp: isSignUp ? 'true' : 'false',
        },
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ResponsiveMenuBar />
      <main className="flex-grow flex items-center justify-center bg-gray-900 p-4 sm:p-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Welcome</h2>
          <button
            onClick={() => handleGoogleAuth(false)}
            className="w-full p-3 mb-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Login with Google
          </button>
          <button
            onClick={() => handleGoogleAuth(true)}
            className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
          >
            Sign Up with Google
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}