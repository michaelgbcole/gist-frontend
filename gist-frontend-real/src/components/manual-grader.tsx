import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Criterion {
  name: string;
  points: number;
  description: string;
}

interface RubricJSON {
  title: string;
  criteria: Criterion[];
  total_points: number;
}

interface ManualGraderProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (grades: any) => void;
  rubric: RubricJSON;
  currentFile: string;
}

interface GradeState {
  [key: string]: {
    score: string;
    feedback: string;
  };
}

const ManualGrader = ({ isOpen, onClose, onSubmit, rubric, currentFile }: ManualGraderProps) => {
  const [grades, setGrades] = useState<GradeState>({});

  const handleScoreChange = (criterionName: string, score: string) => {
    const maxPoints = rubric.criteria.find(c => c.name === criterionName)?.points || 0;
    const numericScore = parseInt(score);
    
    if (isNaN(numericScore) || numericScore < 0 || numericScore > maxPoints) {
      return;
    }

    setGrades(prev => ({
      ...prev,
      [criterionName]: {
        ...prev[criterionName],
        score: `${score}/${maxPoints}`
      }
    }));
  };

  const handleFeedbackChange = (criterionName: string, feedback: string) => {
    setGrades(prev => ({
      ...prev,
      [criterionName]: {
        ...prev[criterionName],
        feedback
      }
    }));
  };

  const handleSubmit = () => {
    onSubmit(grades);
    setGrades({});
    onClose();
  };

  const isComplete = () => {
    return rubric.criteria.every(criterion => 
      grades[criterion.name]?.score && grades[criterion.name]?.feedback
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4">
            Grading: {currentFile}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {rubric.criteria.map((criterion) => (
            <Card key={criterion.name} className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{criterion.name}</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-16 text-center bg-[#85e0a3] font-bold"
                    placeholder="0"
                    min={0}
                    max={criterion.points}
                    onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                    value={grades[criterion.name]?.score?.split('/')[0] || ''}
                  />
                  <span className="text-gray-500">/ {criterion.points}</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-line">
                {criterion.description}
              </div>
              
              <Textarea
                placeholder="Enter feedback..."
                className="w-full resize-none"
                value={grades[criterion.name]?.feedback || ''}
                onChange={(e) => handleFeedbackChange(criterion.name, e.target.value)}
              />
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className={`${
              isComplete() 
                ? "bg-[#85e0a3] hover:bg-[#75d093]" 
                : "bg-gray-300 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={!isComplete()}
          >
            Submit Grades
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualGrader;
