"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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

type RubricData = {
    [key: string]: {
        feedback: string;
        score: string;
    };
};

type Grade = {
    id: number;
    fileName: string;
    rubricData: string;
};

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
    const [selectedItem, setSelectedItem] = useState<string>('');
    const [batches, setBatches] = useState<Batch[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [currentFeedback, setCurrentFeedback] = useState<CriteriaFeedback[]>([]);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) throw error;
                
                if (user) {
                    setUser(user);
                    const response = await fetch(`/api/user-data/${user.id}`);
                    if (response.ok) {
                        const userData: PrismaUser = await response.json();
                        setPrismaUser(userData);
                    }
                } else {
                    await router.push('/');
                    return;
                }
            } catch (error) {
                console.error('Auth error:', error);
                await router.push('/');
                return;
            } finally {
                setLoading(false);
            }
        };
        
        getUser();
    }, [supabase, router]);

    useEffect(() => {
        if (user?.id) {
            fetchBatches();
            fetchGrades();
        }
    }, [user]);

    // New effect to handle batch query parameter
    useEffect(() => {
        const batchParam = searchParams?.get('batch');
        console.log('batchparam', batchParam)
        if (batchParam && batches.length > 0) {
            const batchId = parseInt(batchParam);
            handleItemSelect(`batch::${batchId}`);
            setIsSearchVisible(false);
        }
    }, [searchParams, batches, user]);

    const fetchBatches = async () => {
        try {
            const response = await fetch('/api/get-batches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id }),
            });
            
            if (response.ok) {
                const data = await response.json();
                setBatches(data.batches || []);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
            setBatches([]);
        }
    };

    const fetchGrades = async () => {
        try {
            const response = await fetch('/api/get-grades', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id }),
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.grades) {
                    setGrades(Array.isArray(data.grades) ? data.grades : []);
                } else {
                    setGrades([]);
                }
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
            setGrades([]);
        }
    };

    const handleItemSelect = (value: string) => {
        const [type, idStr] = value.split('::');
        const id = parseInt(idStr);
        console.log(value, "valuetupe")
        if (type === 'batch') {
            const batch = batches.find(b => b.id === id);
            if (batch) {
                try {
                    const parsedFeedback = JSON.parse(batch.overallFeedback);
                    setCurrentFeedback(parsedFeedback);
                } catch (error) {
                    console.error('Error parsing batch feedback:', error);
                    setCurrentFeedback([]);
                }
            }
        } else if (type === 'grade') {
            const grade = grades.find(g => g.id === id);
            if (grade && grade.rubricData) {
                try {
                    const rubricObject: RubricData = JSON.parse(grade.rubricData);
                    
                    const transformedFeedback: CriteriaFeedback[] = Object.entries(rubricObject).map(
                        ([criteriaName, criteriaData]) => ({
                            label: criteriaName,
                            feedback: criteriaData.feedback,
                            score: criteriaData.score
                        })
                    );
                    
                    setCurrentFeedback(transformedFeedback);
                } catch (error) {
                    console.error('Error parsing grade rubric data:', error);
                    setCurrentFeedback([]);
                }
            }
        }
        setSelectedItem(value);
        setIsSearchVisible(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthWrapper>
            <Frame>
                <div className="space-y-4">
                    {!isSearchVisible ? (
                        <Button 
                            variant="outline" 
                            className="w-[350px] justify-between"
                            onClick={() => setIsSearchVisible(true)}
                        >
                            <span>Search feedback...</span>
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    ) : (
                        <Card className="w-[350px]">
                            <Command>
                                <CommandInput 
                                    placeholder="Search feedback..." 
                                    autoFocus
                                />
                                <CommandList>
                                    <CommandEmpty>No results found.</CommandEmpty>
                                    <CommandGroup heading="Assignments">
                                        {batches.map((batch) => (
                                            <CommandItem
                                                key={`batch::${batch.id}`}
                                                value={batch.name}
                                                onSelect={() => handleItemSelect(`batch::${batch.id}`)}
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
                                                key={`grade::${grade.id}`}
                                                value={grade.fileName}
                                                onSelect={() => handleItemSelect(`grade::${grade.id}`)}
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
                    )}
                    
                    {currentFeedback && currentFeedback.length > 0 && (
                        <FilledRubric criteriaData={currentFeedback} />
                    )}
                </div>
            </Frame>
        </AuthWrapper>
    );
};

export default Dashboard;