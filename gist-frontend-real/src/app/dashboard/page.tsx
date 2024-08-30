"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

type PrismaUser = {
  id: string;
  email: string;
  name: string | null;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch user data from Prisma
        const response = await fetch(`/api/user/${user.id}`);
        if (response.ok) {
          const userData: PrismaUser = await response.json();
          setPrismaUser(userData);
        }
      } else {
        router.push('/');
      }
    };

    getUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user || !prismaUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p>Email: {prismaUser.email}</p>
      <p>Name: {prismaUser.name || 'Not set'}</p>
      <button
        onClick={handleSignOut}
        className="mt-4 p-2 bg-red-500 text-white rounded"
      >
        Sign Out
      </button>
    </div>
  );
}