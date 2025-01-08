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
import Quickview from '@/components/new-ui/quick-view';
import PerformanceChart from '@/components/new-ui/charts/line-graph';

interface StudentAssignment {
    assignmentId: string;
    grade: number;
    rubricId: string;
    date?: string; // You might want to add this to your input data
    rubricData: {
      [criteria: string]: number;  // e.g., grammar: 0.59
    };
  }
  
  interface StudentData {
    id: string;
    name: string;
    class: string;
    assignmentData: StudentAssignment[];
  }


type PrismaUser = {
    id: string;
    email: string;
    name: string | null;
    isPayer: boolean;
};

type Batch = {
    id: number;
    title: string;
    score: string;
    feedback: string;
    originalName: string; // Added to store the original batch name for navigation
};

type FeedbackCriteria = {
    label: string;
    feedback: string;
    score: string;
};

type InitialBatch = {
    id: number;
    name: string | null;
    overallFeedback: string | null;
};

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [studentData, setStudentData] = useState<StudentData[]>([]);
    const [loadingChart, setLoadingChart] = useState(true);

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
        fetchBatches();
    }, [supabase, router]);

    useEffect(() => {
        fetchBatches();
    }, [user]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (user?.id) {
                try {
                    setLoadingChart(true);
                    const response = await fetch('/api/get-all-student-data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: user.id }),
                    });

                    if (response.ok) {
                        const { studentData } = await response.json();
                        setStudentData(studentData);
                    }
                } catch (error) {
                    console.error('Error fetching student data:', error);
                } finally {
                    setLoadingChart(false);
                }
            }
        };

        fetchAllData();
    }, [user?.id]);

    const fetchBatches = async () => {
        if (user?.id) {
            console.log('running')
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
                const transformedBatches = data.batches.map((batch: InitialBatch, index: number) => {
                    let feedbackArray: FeedbackCriteria[] = [];
                    let averageScore = 0;
                    let compiledFeedback = '';

                    if (batch.overallFeedback) {
                        try {
                            feedbackArray = JSON.parse(batch.overallFeedback);
                            
                            if (Array.isArray(feedbackArray) && feedbackArray.length > 0) {
                                const scores = feedbackArray.map(item => 
                                    parseInt(item.score?.split('/')[0] || '0')
                                );
                                averageScore = Math.round(
                                    scores.reduce((a, b) => a + b, 0) / scores.length
                                );
                                
                                compiledFeedback = feedbackArray
                                    .map(item => `${item.label || ''}: ${item.feedback || ''}`)
                                    .filter(text => text !== ': ')
                                    .join('\n');
                            }
                        } catch (error) {
                            console.error('Error parsing feedback:', error);
                        }
                    }
                    

                    return {
                        id: batch.id,
                        title: batch.name || '',
                        score: averageScore ? `${averageScore}/10` : '',
                        feedback: compiledFeedback || '',
                        originalName: batch.name || '', // Store original name for navigation
                    };
                });

                setBatches(transformedBatches);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    }
    };

    const handleDetailsClick = (batchName: number) => {
        const encodedBatchName = encodeURIComponent(batchName);
        router.push(`/dashboard/analysis?batch=${encodedBatchName}`);
    };

    return (
        <AuthWrapper>
            <Frame>
                <div className='flex gap-4 p-4'>
                    {/* <Quickview 
                        essays={batches} 
                        onDetailsClick={(essayId) => {
                            const batch = batches.find(b => b.id === essayId);
                            if (batch) {
                                handleDetailsClick(essayId);
                            }
                        }}
                    /> */}
                    <PerformanceChart 
                        data={studentData} 
                        loading={loadingChart}
                    />
                </div>
            </Frame>
        </AuthWrapper>
    );
};

export default Dashboard;