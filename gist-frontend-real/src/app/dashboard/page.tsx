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
import { Copy, CreditCard, DollarSign, LogOut, LucideCreditCard, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';

type PrismaUser = {
    id: string;
    email: string;
    name: string | null;
    isPayer: boolean;
};

type StripeUser = {
    stripeId: string;
    isPayer: boolean;
}
type Form = {
    id: number;
    title: string;
    uniqueLink: string;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
    const [stripeUser, setStripeUser] = useState<StripeUser | null>(null);
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
                const response = await fetch(`/api/user-data/${user.id}`);
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

    const remainingForms = 3 - forms.length;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800">
            <ResponsiveMenuBar />
            {!prismaUser.isPayer && (
                <div className="bg-yellow-500 text-black p-4 text-center">
                    You are on the trial version of Gist. You have {remainingForms} form{remainingForms===1 ? '' : 's'} left. <button onClick={handleUpgrade} className="underline">Click here to upgrade</button>.
                </div>
            )}
            <div className="flex-grow p-8">
                <Card className="mb-8 bg-black text-white">
                    <CardHeader>
                        <CardTitle>Welcome to your Dashboard</CardTitle>
                        <CardDescription>
                            Email: {prismaUser.email}<br />
                            Name: {prismaUser.name || 'Not set'} <br />
                            Is Payer: {prismaUser.isPayer ? 'Yes' : 'No'}
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
                                    <div key={form.id} className="flex items-center justify-between bg-gray-800 rounded-lg">
                                        <Link href={`/form/${form.uniqueLink}`} className="text-blue-400 hover:text-blue-300 flex-grow p-6">
                                            {form.title}
                                        </Link>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={() => copyToClipboard(`${window.location.origin}/form/${form.uniqueLink}`)}
                                            className='m-4'
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400">You have not created any forms yet.</p>
                        )}
                        <div className="mt-6 flex justify-between">
                            {prismaUser.isPayer || forms.length < 3 ? (
                                <Button asChild>
                                    <Link href="/form-creator">
                                        <Plus className="mr-2 h-4 w-4" /> Create New Form
                                    </Link>
                                </Button>
                            ) : (
                                <p className="text-red-500">You have reached the limit of 3 forms. <button onClick={handleUpgrade} className="underline">Upgrade to create more forms</button>.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Footer />
        </div>
    );
}

export default Dashboard;