"use client";

import React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  const handleGoogleAuth = async (isSignUp: boolean) => {
    const redirectTo = `${window.location.origin}/auth/callback?isSignUp=${isSignUp}`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          isSignUp: isSignUp ? 'true' : 'false', // Pass isSignUp as a query parameter
        },
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Welcome</h2>
        <button
          onClick={() => handleGoogleAuth(false)}
          className="w-full p-2 mb-4 bg-blue-500 text-white rounded"
        >
          Login with Google
        </button>
        <button
          onClick={() => handleGoogleAuth(true)}
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          Sign Up with Google
        </button>
      </div>
    </div>
  );
}