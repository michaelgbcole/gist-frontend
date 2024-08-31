'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
    children: (user: User | null) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
            } else {
                router.push('/');
            }
        };

        getUser();
    }, [supabase, router]);

    return <>{children(user)}</>;
};

export default AuthWrapper;