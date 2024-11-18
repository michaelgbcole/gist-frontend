"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AuthWrapper from '@/components/AuthWrapper';
import Frame from '@/components/new-ui/main-frame';
import LineChart from '@/components/new-ui/charts/line-chart';
import WritingMetricsChart from '@/components/new-ui/charts/radar-chart';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
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
    overallFeedback: string; // Changed to string since API returns JSON string
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
                
                // Set the first batch as selected by default and parse its feedback
                if (data.batches.length > 0) {
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