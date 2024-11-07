"use client"
import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import BatchCreator from '@/components/batch-creator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import RubricMaker from '@/components/rubric-creator';
import { Table } from '@/components/ui/table';
import BatchDashboard from '@/components/batch-dashboard';
import { toast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';

type PrismaUser = {
  id: string;
  email: string;
  name: string | null;
  isPayer: boolean;
};
interface Batch {
  id: string;
  name: string;
  status: string;
  fileUrls: string[];
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const response = await fetch(`/api/user-data/${user.id}`);
        if (response.ok) {
          const userData: PrismaUser = await response.json();
          setPrismaUser(userData);
        }
        const response2 = await fetch('/api/get-batches', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });
        if (response2.ok) {
          const data = await response2.json();
          setBatches(data.batches);
        }
      }
    };
    getUser();
  }, [supabase]);


  const handleUpgrade = async () => {
    if (!user) {
        toast({
            title: "Error",
            description: "You must be logged in to upgrade.",
            variant: "destructive",
        });
        return;
    }
    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.id,
            }),
        });
        if (!response.ok) {
            throw new Error('Failed to create checkout session');
        }
        const { sessionId } = await response.json();
        const stripe = await stripePromise;
        if (!stripe) {
            throw new Error('Stripe failed to load');
        }
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    } catch (err) {
        console.error('Error:', err);
        toast({
            title: "Error",
            description: "An error occurred while processing your request.",
            variant: "destructive",
        });
    }
};

  const remainingBatchs = 3 - batches.length;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <ResponsiveMenuBar />
      {prismaUser?.isPayer == false && (
                <div className="bg-yellow-500 text-black p-4 text-center">
                    You are on the trial version of Gist. You have {remainingBatchs} batch{remainingBatchs === 1 ? '' : 's'} left. <button onClick={handleUpgrade} className="underline">Click here to upgrade</button>.
                </div>
            )}
      <div className="flex flex-col flex-grow">
        <BatchDashboard userId={user?.id ?? ''} supabase={supabase} canCreateBatch={remainingBatchs>0 || prismaUser?.isPayer ? true : false}/>
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;