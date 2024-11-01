"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import GradeDetails from './grade-details';
import RubricMaker from './rubric-creator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { User } from '@supabase/supabase-js';
import BatchCreator from './batch-creator';

interface Batch {
  id: string;
  name: string;
  status: string;
  fileUrls: string[];
}

interface Grade {
  id: string;
  score: string;
  feedback: string;
  fileName: string;
  rubricData: string;
}

type PrismaUser = {
  id: string;
  email: string;
  name: string | null;
  isPayer: boolean;
};


type BatchDashboardProps = {
  userId: string;
  supabase: any;
  canCreateBatch: boolean;
};

const BatchDashboard: React.FC<BatchDashboardProps> = ({ userId, supabase, canCreateBatch }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [expandedGradeId, setExpandedGradeId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showBatchCreator, setShowBatchCreator] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch('/api/get-batches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch batches');
        }
        const data = await response.json();
        setBatches(data.batches);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch batches",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, [userId]);

  const handleBatchSelect = async (batchId: string) => {
    setSelectedBatchId(batchId);
    setLoading(true);
    try {
      const response = await fetch('/api/get-grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchId }),
      });
      if (!response.ok) {
        throw new Error('Failed to fetch grades');
      }
      const data = await response.json();
      setGrades(data.grades);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch grades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleGradeDetails = (gradeId: string) => {
    setExpandedGradeId(expandedGradeId === gradeId ? null : gradeId);
  };

  const handleBatchNameSubmit = () => {
    setIsDialogOpen(false);
    setShowBatchCreator(true);
  };

  const handleCloseBatchCreator = () => {
    setShowBatchCreator(false);
  };


  return (
    <div className='w-full p-8'>
    <Card className='max-w-full'>
      <div className='max-w-full'>
      <CardHeader>
        <CardTitle>Batch Dashboard</CardTitle>
      </CardHeader>
      <CardContent className=''>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
          <div className='flex gap-4'>
            <Select onValueChange={handleBatchSelect} >
              <SelectTrigger>
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <RubricMaker userId={userId} />

        {!showBatchCreator && canCreateBatch&& (
          <>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create A New Batch
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Batch Name</DialogTitle>
                </DialogHeader>
                <Input
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="Batch Name"
                />
                <Button onClick={handleBatchNameSubmit}>
                  Submit
                </Button>
              </DialogContent>
            </Dialog>
            
          </>
        )}
        {showBatchCreator && canCreateBatch && <BatchCreator supabase={supabase} userId={userId} name={batchName} onClose={handleCloseBatchCreator} />}
        </div>
            {selectedBatchId && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => (
                    <React.Fragment key={grade.id}>
                      <TableRow>
                        <TableCell>{grade.fileName}</TableCell>
                        <TableCell>{grade.score}</TableCell>
                        <TableCell>
                          <Button onClick={() => toggleGradeDetails(grade.id)}>
                            {expandedGradeId === grade.id ? <ChevronUp /> : <ChevronDown />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedGradeId === grade.id && (
                        <TableRow>
                          <TableCell colSpan={4}>
                            <GradeDetails
                              finalScore={grade.score}
                              overallFeedback={grade.feedback}
                              rubricData={grade.rubricData}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
      </div>
    </Card>
    </div>
  );
};

export default BatchDashboard;