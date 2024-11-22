"use client";
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import { Badge } from '@/components/ui/badge';
import AuthWrapper from '@/components/AuthWrapper';
import Frame from '@/components/new-ui/main-frame';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import FilledRubric from '@/components/new-ui/filled-rubric';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// Types
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
    id: number;
    name: string;
    overallFeedback: string;
};

type Grade = {
    id: number;
    fileName: string;
    rubricData: string;
};

// Search component
const SearchButton = ({ onClick }: { onClick: () => void }) => (
    <Button 
        variant="outline" 
        className="w-[350px] justify-between"
        onClick={onClick}
    >
        <span>Search feedback...</span>
        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
);

const SearchDialog = ({ 
    batches, 
    grades, 
    onSelect 
}: {
    batches: Batch[];
    grades: Grade[];
    onSelect: (type: string, id: number) => void;
}) => (
    <Card className="w-[350px]">
        <Command>
            <CommandInput placeholder="Search feedback..." autoFocus />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Assignments">
                    {batches.map((batch) => (
                        <CommandItem
                            key={batch.id}
                            // Use a unique identifier that includes both type and id
                            value={`batch-${batch.id}-${batch.name}`}
                            onSelect={() => onSelect('batch', batch.id)}
                            className="flex items-center justify-between"
                        >
                            <span>{batch.name}</span>
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                                Assignment
                            </Badge>
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Essays">
                    {grades.map((grade) => (
                        <CommandItem
                            key={grade.id}
                            // Use a unique identifier that includes both type and id
                            value={`grade-${grade.id}-${grade.fileName}`}
                            onSelect={() => onSelect('grade', grade.id)}
                            className="flex items-center justify-between"
                        >
                            <span>{grade.fileName}</span>
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                Essay
                            </Badge>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </Command>
    </Card>
);

// Dashboard component
const Dashboard = () => {
    // State
    const [user, setUser] = useState<User | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [currentFeedback, setCurrentFeedback] = useState<CriteriaFeedback[]>([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Hooks
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Authentication effect
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error || !user) {
                    throw error || new Error('No user found');
                }
                setUser(user);
            } catch (error) {
                console.error('Auth error:', error);
                router.push('/');
            }
        };

        checkAuth();
    }, [supabase, router]);

    // Data fetching effect
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                // Fetch batches
                const batchesRes = await fetch('/api/get-batches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                });
                const batchesData = await batchesRes.json();
                setBatches(batchesData.batches || []);

                // Fetch grades
                const gradesRes = await fetch('/api/get-grades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id }),
                });
                const gradesData = await gradesRes.json();
                setGrades(gradesData.grades || []);

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // URL parameter effect
    useEffect(() => {
        const batchId = searchParams?.get('batch');
        if (!batchId || batches.length === 0) return;

        const batch = batches.find(b => b.id === parseInt(batchId));
        if (batch) {
            try {
                const feedback = JSON.parse(batch.overallFeedback);
                setCurrentFeedback(feedback);
            } catch (error) {
                console.error('Error parsing batch feedback:', error);
                setCurrentFeedback([]);
            }
        }
    }, [searchParams, batches]);

    // Handlers
    const handleSelect = (type: string, id: number) => {
        if (type === 'batch') {
            const batch = batches.find(b => b.id === id);
            if (batch) {
                try {
                    const feedback = JSON.parse(batch.overallFeedback);
                    setCurrentFeedback(feedback);
                } catch (error) {
                    console.error('Error parsing batch feedback:', error);
                    setCurrentFeedback([]);
                }
            }
        } else if (type === 'grade') {
            const grade = grades.find(g => g.id === id);
            if (grade?.rubricData) {
                try {
                    const rubricData = JSON.parse(grade.rubricData);
                    const feedback = Object.entries(rubricData).map(
                        ([label, data]: [string, any]) => ({
                            label,
                            feedback: data.feedback,
                            score: data.score
                        })
                    );
                    setCurrentFeedback(feedback);
                } catch (error) {
                    console.error('Error parsing grade feedback:', error);
                    setCurrentFeedback([]);
                }
            }
        }
        setIsSearchVisible(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthWrapper>
            <Frame>
                <div className="space-y-4">
                    {isSearchVisible ? (
                        <SearchDialog 
                            batches={batches}
                            grades={grades}
                            onSelect={handleSelect}
                        />
                    ) : (
                        <SearchButton onClick={() => setIsSearchVisible(true)} />
                    )}
                    
                    {currentFeedback.length > 0 && (
                        <FilledRubric criteriaData={currentFeedback} />
                    )}
                </div>
            </Frame>
        </AuthWrapper>
    );
};

export default Dashboard;