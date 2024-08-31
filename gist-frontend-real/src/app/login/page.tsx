"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();
  const supabase = createClientComponentClient();


  const handleGoogleLogin = async () => {
    console.log('google login')
    console.log(window.location.origin)
    const redirectTo = `${window.location.origin}/auth/callback`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    if (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <button
          onClick={handleGoogleLogin}
          className="w-full p-2 mt-4 bg-red-500 text-white rounded"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}