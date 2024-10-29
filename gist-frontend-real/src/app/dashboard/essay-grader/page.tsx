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

type PrismaUser = {
  id: string;
  email: string;
  name: string | null;
  isPayer: boolean;
};

function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const [showBatchCreator, setShowBatchCreator] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
      }
    };
    getUser();
  }, [supabase]);

  const handleBatchNameSubmit = () => {
    setIsDialogOpen(false);
    setShowBatchCreator(true);
  };

  const handleCloseBatchCreator = () => {
    setShowBatchCreator(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
      <ResponsiveMenuBar />
      <div className="flex flex-col items-center justify-center flex-grow">
        <RubricMaker userId={user?.id ?? ''} />
        {!showBatchCreator && (
          <>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create A New Batch
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Batch Name</DialogTitle>
                </DialogHeader>
                <Input
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Batch Name"
                />
                <Button onClick={handleBatchNameSubmit}>
                  Submit
                </Button>
              </DialogContent>
            </Dialog>
          </>
        )}
        {showBatchCreator && <BatchCreator supabase={supabase} userId={user?.id ?? ''} name={batchName} onClose={handleCloseBatchCreator} />}
        <BatchDashboard userId={user?.id ?? ''} />
        
      </div>
      <Footer />
    </div>
  );
}

export default Dashboard;