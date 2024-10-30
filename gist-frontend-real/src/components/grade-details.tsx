import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CriteriaFeedback {
  feedback: string;
  score: string;
}

interface GradeDetailsProps {
  finalScore: string;
  overallFeedback: string;
  rubricData: string;
}

type response = Record<string, CriteriaFeedback>; 

const GradeDetails: React.FC<GradeDetailsProps> = ({ finalScore, overallFeedback, rubricData }) => {
  const [showMore, setShowMore] = useState(false);
  const rubricdatareal: response = JSON.parse(rubricData)
  return (
    <div className='max-w-full overflow-hidden'>
      <p><strong>Overall Feedback:</strong> {overallFeedback}</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Criteria</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rubricdatareal && Object.entries(rubricdatareal).map(([criterion, feedback]) => (
              <TableRow key={criterion}>
                <TableCell>{criterion}</TableCell>
                <TableCell>{feedback?.feedback}</TableCell>
                <TableCell>{feedback?.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
};

export default GradeDetails;