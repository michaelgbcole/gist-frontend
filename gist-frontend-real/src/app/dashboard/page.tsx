"use client";
import React, { useEffect, useState } from 'react';
import AuthWrapper from '@/components/AuthWrapper';
import Frame from '@/components/new-ui/main-frame';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import PerformanceChart from '@/components/new-ui/charts/line-graph';

interface StudentAssignment {
  assignmentId: string;
  grade: number;
  rubricId: string;
  date?: string;
  rubricData: {
    [criteria: string]: number;  // Now contains decimal scores (e.g., 0.9 for 18/20)
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

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [loadingChart, setLoadingChart] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  // Handle user authentication and fetch user data
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
    };
    getUser();
  }, [supabase, router]);

  // Fetch student performance data
  useEffect(() => {
    const fetchAllData = async () => {
      if (user?.id) {
        try {
          setLoadingChart(true);
          const response = await fetch('/api/get-all-analytics-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ teacherId: user.id }), // Changed from userId to teacherId
          });

          if (response.ok) {
            const { studentData } = await response.json();
            setStudentData(studentData);
            console.log('Student data:', studentData);
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

  return (
    <AuthWrapper>
      <Frame>
        <div className='flex gap-4 p-4'>
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