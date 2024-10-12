"use client";
import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { FaClipboardCheck, FaEdit } from 'react-icons/fa';
import AuthWrapper from '@/components/AuthWrapper';
import { useRouter } from 'next/dist/client/components/navigation';


type PrismaUser = {
    id: string;
    email: string;
    name: string | null;
    isPayer: boolean;
};

function Dashboard() {
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
                // Fetch user data from Prisma
                const response = await fetch(`/api/user-data/${user.id}`);
                if (response.ok) {
                    const userData: PrismaUser = await response.json();
                    setPrismaUser(userData);
                    // Fetch user's forms
                }
            } else {
                router.push('/');
            }
            setLoading(false);
        };
        getUser();
    }, [supabase, router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthWrapper>
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl font-bold mb-8">Welcome to the Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <Link href="/dashboard/quizzes" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <FaClipboardCheck className="mr-2" />
                        Gist Quizzes
                    </Link>
                    <div className="">
                    <Link href="/dashboard/essay-grader" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center transition-colors duration-300">
                        <FaEdit className="mr-2" />
                        Gist Essay Grader
                    </Link>
                    </div>
                </div>
            </div>
        </AuthWrapper>
    );
}

export default Dashboard;