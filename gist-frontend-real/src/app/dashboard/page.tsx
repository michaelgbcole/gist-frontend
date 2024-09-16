"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, LogOut, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type PrismaUser = {
    id: string;
    email: string;
    name: string | null;
};

type Form = {
    id: number;
    title: string;
    uniqueLink: string;
};

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
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
                    // Fetch user's forms
                    const formsResponse = await fetch(`/api/forms/${user.id}`);
                    if (formsResponse.ok) {
                        const formsData: Form[] = await formsResponse.json();
                        setForms(formsData);
                    }
                }
            } else {
                router.push('/');
            }
            setLoading(false);
        };

        getUser();
    }, [supabase, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({
                title: "Link Copied",
                description: "The form link has been copied to your clipboard.",
            });
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
                <ResponsiveMenuBar />
                <div className="flex-grow p-8">
                    <Skeleton className="h-12 w-[250px] mb-4" />
                    <Skeleton className="h-4 w-[200px] mb-2" />
                    <Skeleton className="h-4 w-[150px] mb-8" />
                    <Skeleton className="h-8 w-[180px] mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!user || !prismaUser) {
        return (
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
                <ResponsiveMenuBar />
                <div className='flex-grow flex items-center justify-center'>
                    <Card>
                        <CardContent className="pt-6">
                            Make sure you have created an account!
                        </CardContent>
                    </Card>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
            <ResponsiveMenuBar />
            <div className="flex-grow p-8">
                <Card className="mb-8 bg-black text-white">
                    <CardHeader>
                        <CardTitle>Welcome to your Dashboard</CardTitle>
                        <CardDescription>
                            Email: {prismaUser.email}<br />
                            Name: {prismaUser.name || 'Not set'}
                        </CardDescription>
                    </CardHeader>
                </Card>
                
                <Card className='bg-black text-white'>
                    <CardHeader>
                        <CardTitle>Your Forms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {forms.length > 0 ? (
                            <div className="space-y-4">
                                {forms.map((form) => (
  <Link href={`/form/${form.uniqueLink}`} className="text-blue-400 hover:text-blue-300 flex-grow flex items-center justify-between p-4 bg-gray-800 rounded-lg" key={form.id}>
    <div className="flex-grow">
      {form.title}
    </div>
    <Button
      variant="outline"
      size="icon"
      onClick={() => copyToClipboard(`${window.location.origin}/form/${form.uniqueLink}`)}
      className='ml-4'
    >
      <Copy className="h-4 w-4" />
    </Button>
  </Link>
))}
                            </div>
                        ) : (
                            <p className="text-gray-400">You have not created any forms yet.</p>
                        )}
                        <div className="mt-6 flex justify-between">
                            <Button asChild>
                                <Link href="/form-creator">
                                    <Plus className="mr-2 h-4 w-4" /> Create New Form
                                </Link>
                            </Button>
                            <Button variant="destructive" onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}