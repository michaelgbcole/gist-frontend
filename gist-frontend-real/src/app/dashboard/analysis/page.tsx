"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthWrapper from '@/components/AuthWrapper';
import Frame from '@/components/new-ui/main-frame';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import FilledRubric from '@/components/new-ui/filled-rubric';

type PrismaUser = {
    id: string;
    email: string;
    name: string | null;
    isPayer: boolean;
};

type CriteriaFeedback = {
    label: string;
    feedback: string;
    score: string;
};

type Batch = {
    name: string;
    overallFeedback: string;
};

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [batches, setBatches] = useState<Batch[]>([]);
    const [currentFeedback, setCurrentFeedback] = useState<CriteriaFeedback[]>([]);
    
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

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
            } else {
                router.push('/');
            }
            setLoading(false);
        };
        getUser();
    }, [supabase, router]);

    useEffect(() => {
        if (user?.id) {
            fetchBatches();
        }
    }, [user]);

    useEffect(() => {
        // Get the batch name from URL parameters and select it
        const batchFromUrl = searchParams?.get('batch');
        if (batchFromUrl && batches.length > 0) {
            const decodedBatchName = decodeURIComponent(batchFromUrl);
            handleBatchChange(decodedBatchName);
        }
    }, [searchParams, batches]);

    const parseFeedback = (feedbackString: string): CriteriaFeedback[] => {
        try {
            return JSON.parse(feedbackString);
        } catch (error) {
            console.error('Error parsing feedback:', error);
            return [];
        }
    };

    const fetchBatches = async () => {
        try {
            const response = await fetch('/api/get-batches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user?.id }),
            });
    
            if (response.ok) {
                const data = await response.json();
                setBatches(data.batches);
                
                // Check for URL parameter after batches are loaded
                const batchFromUrl = searchParams?.get('batch');
                if (batchFromUrl) {
                    const decodedBatchName = decodeURIComponent(batchFromUrl);
                    setSelectedBatch(decodedBatchName);
                    const selectedBatchData = data.batches.find(
                        (batch: Batch) => batch.name === decodedBatchName
                    );
                    if (selectedBatchData) {
                        const parsedFeedback = parseFeedback(selectedBatchData.overallFeedback);
                        setCurrentFeedback(parsedFeedback);
                    }
                } else if (data.batches.length > 0) {
                    // If no URL parameter, select first batch as default
                    setSelectedBatch(data.batches[0].name);
                    const parsedFeedback = parseFeedback(data.batches[0].overallFeedback);
                    setCurrentFeedback(parsedFeedback);
                }
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const handleBatchChange = (value: string) => {
        setSelectedBatch(value);
        const selectedBatchData = batches.find(batch => batch.name === value);
        if (selectedBatchData) {
            const parsedFeedback = parseFeedback(selectedBatchData.overallFeedback);
            setCurrentFeedback(parsedFeedback);
            // Update URL when batch is changed
            router.push(`/dashboard/analysis?batch=${encodeURIComponent(value)}`, { scroll: false });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthWrapper>
            <Frame>
                <div className="space-y-4">
                    <Select value={selectedBatch} onValueChange={handleBatchChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map((batch) => (
                                <SelectItem key={batch.name} value={batch.name}>
                                    {batch.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    {currentFeedback && (
                        <FilledRubric criteriaData={currentFeedback} />
                    )}
                </div>
            </Frame>
        </AuthWrapper>
    );
};

export default Dashboard;