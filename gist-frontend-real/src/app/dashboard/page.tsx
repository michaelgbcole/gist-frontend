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
import { Copy, CreditCard, DollarSign, Edit, Eye, LogOut, LucideCreditCard, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

type Submission = {
    id: number;
    studentId: string;
    studentName?: string;
    score: number;
    createdAt: string;
  };
  
  type SubmissionData = {
    submissions: Submission[];
    averageScore: number;
  };
  

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
    const [submissionsData, setSubmissionsData] = useState<{ [formId: number]: SubmissionData }>({});
    const [selectedForm, setSelectedForm] = useState<Form | null>(null);
    const [expandedForms, setExpandedForms] = useState<Set<number>>(new Set());
    const [showAll, setShowAll] = useState(false);
    const [forms, setForms] = useState<Form[]>([]);
    const [viewAllModalOpen, setViewAllModalOpen] = useState(false);
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

    const openFormDialog = (form: Form) => {
        setSelectedForm(form);
        if (!submissionsData[form.id]) {
            fetchSubmissions(form.id);
        }
    };

    const closeFormDialog = () => {
        setSelectedForm(null);
    };

    const fetchSubmissions = async (formId: number) => {
        try {
            const response = await fetch(`/api/submissions/${formId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }
            const data: SubmissionData = await response.json();

            // Fetch user data for each submission
            const userPromises = data.submissions.map(sub =>
                fetch(`/api/user-data/${sub.studentId}`).then(res => res.json())
            );

            const users = await Promise.all(userPromises);

            // Map user data to submissions
            const submissionsWithUserNames = data.submissions.map((sub, index) => ({
                ...sub,
                studentName: users[index].name,
            }));

            setSubmissionsData(prev => ({
                ...prev,
                [formId]: { ...data, submissions: submissionsWithUserNames },
            }));
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast({
                title: "Error",
                description: "Failed to fetch submissions.",
                variant: "destructive",
            });
        }
    };

      // ... (previous code remains the same)

const renderSubmissions = (formId: number) => {
  const data = submissionsData[formId];
  if (!data) return <p>Loading submissions...</p>;

  

  return (
    <div className="mt-4">
      <p>Average Score: {data.averageScore.toFixed(2)}</p>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Score</TableHead>
            <TableHead className="text-white">Date</TableHead>
            <TableHead className='text-white'>View Submission</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.submissions.slice(0, showAll ? data.submissions.length : 5).map(sub => (
            <TableRow key={sub.id}>
              <TableCell className="border-t border-gray-700">{sub.studentName}</TableCell>
              <TableCell className="border-t border-gray-700">{sub.score}%</TableCell>
              <TableCell className="border-t border-gray-700">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="border-t border-gray-700">
                    <Link href={`/submission/${sub.id}`}>
                    <Button variant="secondary" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                    </Link>
                    </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!showAll && data.submissions.length > 5 && (
        <Button variant="secondary" onClick={() => setShowAll(true)} className="mt-2">
          Show All
        </Button>
      )}
    </div>
  );
};

// ... (rest of the code remains the same)


interface ViewAllSubmissionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submissions: Submission[];
  }
  

const ViewAllSubmissionsModal: React.FC<ViewAllSubmissionsModalProps> = ({
    open,
    onOpenChange,
    submissions,
  }) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-black text-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Score</TableHead>
                <TableHead className="text-white">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="border-t border-gray-700">
                    {sub.studentName}
                  </TableCell>
                  <TableCell className="border-t border-gray-700">
                    {sub.score}%
                  </TableCell>
                  <TableCell className="border-t border-gray-700">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="border-t border-gray-700">
                  <Link href={`/submission/${sub.id}`}>
                    <Button variant="secondary" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                </Link>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  };
  


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
                    You are on the trial version of Gist. You have {remainingForms} form{remainingForms === 1 ? '' : 's'} left. <button onClick={handleUpgrade} className="underline">Click here to upgrade</button>.
                </div>
            )}
            <div className="flex-grow p-8">
                <Card className="mb-8 bg-black text-white">
                    <CardHeader>
                        <CardTitle>Welcome to your Dashboard</CardTitle>
                        <CardDescription>
                            Email: {prismaUser.email}<br />
                            Name: {prismaUser.name || 'Not set'} <br />
                        </CardDescription>
                    </CardHeader>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forms.map((form) => (
                        <Card key={form.id} className="bg-black text-white cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => openFormDialog(form)}>
                            <CardContent className="p-6 flex items-center justify-center h-40">
                                <h3 className="text-xl font-semibold text-center">{form.title}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="mt-6 flex justify-between">
                    {prismaUser.isPayer || forms.length < 3 ? (
                        <>
                            <Button asChild variant='secondary'>
                                <Link href="/form-creator">
                                    <Plus className="mr-2 h-4 w-4" /> Create New Form
                                </Link>
                            </Button>
                            <Button onClick={handleSignOut} variant='destructive'>
                                <LogOut className="mr-2 h-4 w-4" /> Sign Out
                            </Button>
                        </>
                    ) : (
                        <p className="text-red-500">You have reached the limit of 3 forms. <button onClick={handleUpgrade} className="underline">Upgrade to create more forms</button>.</p>
                    )}
                </div>
            </div>
            <Footer />

            <Dialog open={!!selectedForm} onOpenChange={closeFormDialog}>
                {selectedForm && (
                    <DialogContent className="bg-black text-white">
                        <DialogHeader>
                            <DialogTitle className="flex justify-between items-center">
                                <span>{selectedForm.title}</span>
                                <Button variant="ghost" size="icon" onClick={closeFormDialog}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                            <Button
                                variant="secondary"
                                onClick={() => copyToClipboard(`${window.location.origin}/form/${selectedForm.uniqueLink}`)}
                                className="mr-2"
                            >
                                <Copy className="mr-2 h-4 w-4" /> Share Link
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => router.push(`/form-editor/${selectedForm.id}`)}
                                className="mr-2"
                            >
                                <Edit className="mr-2 h-4 w-4" /> Edit Form
                            </Button>
                        </div>
                       <DialogDescription className="mt-4">
  {submissionsData[selectedForm.id] ? (
    <div>
      <h4 className="text-lg font-semibold mb-2">Submission Data</h4>
      <p>Average Score: {submissionsData[selectedForm.id].averageScore.toFixed(2)}</p>
      {renderSubmissions(selectedForm.id)}
      {submissionsData[selectedForm.id].submissions.length > 5}
    </div>
  ) : (
    <p>Loading submission data...</p>
  )}
</DialogDescription>

                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}

    // ... (rest of the code remains the same)

export default Dashboard;