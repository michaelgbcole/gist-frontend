"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';

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
        };

        getUser();
    }, [supabase, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (!user || !prismaUser) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col">
        <ResponsiveMenuBar />
        <div className="flex-grow p-8 bg-gray-900">
            <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
            <p>Email: {prismaUser.email}</p>
            <p>Name: {prismaUser.name || 'Not set'}</p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">Your Forms</h2>
            {forms.length > 0 ? (
    <ul className="space-y-2">
        {forms.map((form) => (
            <Link legacyBehavior href={`/form/${form.uniqueLink}`} key={form.id}>
                <a className="block bg-gray-500 p-4 rounded text-white">
                    {form.title}
                </a>
            </Link>
        ))}
    </ul>
) : (
    <p>You haven't created any forms yet.</p>
)}
<Link legacyBehavior href="/form-creator">
    <a className="mt-4 inline-block p-2 bg-blue-500 text-white rounded">
        Create New Form
    </a>
</Link>

<button
    onClick={handleSignOut}
    className="mt-4 p-2 bg-red-500 text-white rounded ml-4"
>
    Sign Out
</button>
        </div>
        <Footer />
        </div>
    );
}