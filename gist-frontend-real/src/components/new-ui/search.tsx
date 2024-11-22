// components/FeedbackSearch.tsx
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
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

type FeedbackSearchProps = {
    userId: string;
    className?: string;
};

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

export const FeedbackSearch = ({ userId, className = "" }: FeedbackSearchProps) => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch batches
                const batchesRes = await fetch('/api/get-batches', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });
                const batchesData = await batchesRes.json();
                setBatches(batchesData.batches || []);

                // Fetch grades
                const gradesRes = await fetch('/api/get-grades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });
                const gradesData = await gradesRes.json();
                setGrades(gradesData.grades || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    const handleSelect = (type: string, id: number) => {
        setIsSearchVisible(false);
        if (type === 'batch') {
            router.push(`/analysis?batch=${id}`);
        } else if (type === 'grade') {
            router.push(`/analysis?grade=${id}`);
        }
    };

    if (isLoading) {
        return null; // or a loading spinner if preferred
    }

    return (
        <div className={className}>
            {isSearchVisible ? (
                <SearchDialog 
                    batches={batches}
                    grades={grades}
                    onSelect={handleSelect}
                />
            ) : (
                <SearchButton onClick={() => setIsSearchVisible(true)} />
            )}
        </div>
    );
};