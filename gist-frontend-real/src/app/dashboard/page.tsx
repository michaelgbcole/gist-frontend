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

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
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
                console.log(response)
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

  return (
    <AuthWrapper>
        <Frame>
            <div className='flex gap-4 p-4'>
        <LineChart />
        <WritingMetricsChart user={prismaUser?.id} />
        </div>
    </Frame>
    </AuthWrapper>
  );
};

export default Dashboard;