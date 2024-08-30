// src/app/form/[uniqueLink]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import SAQTest from '@/components/saq-question-test';
import MultipleChoiceTest from '@/components/mc-question-test';

interface Question {
  id: number;
  type: string;
  question: string;
  gist?: string;
  options: string[];
  correctOptions: number[];
}

export default function FormSubmission() {
  const params = useParams();
  const uniqueLink = params?.uniqueLink as string | undefined;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [title, setTitle] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [correctness, setCorrectness] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (uniqueLink) {
      fetchQuestions(uniqueLink);
    }
  }, [uniqueLink]);

  async function fetchQuestions(link: string) {
    try {
      const response = await fetch(`/api/get-form?uniqueLink=${link}`);
      if (!response.ok) {
        throw new Error('Failed to fetch form');
      }
      const data = await response.json();
      setQuestions(data.questions);
      setTitle(data.form.title);
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Handle error (e.g., show error message to user)
    }
  }

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer);
  };

  const handleSelectionChange = (indices: number[]) => {
    setSelectedIndices(indices);
  };

  const handleSubmit = async () => {
    // Implement submission logic here
    console.log('Form submitted');
  };

  if (!uniqueLink) {
    return <div>Error: No unique link provided</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ResponsiveMenuBar />
      <main className="flex-grow flex items-center justify-center bg-gray-900">
        <div className="w-full">
          <h1 className="text-3xl sm:text-6xl font-bold mb-4 text-center">{title}</h1>
          <div className='p-4'>
            <div>
              {questions.map((question) => (
                <div key={question.id} className='pb-16'>
                  {question.type === 'SAQ' ? (
                    <SAQTest id={question.id} onAnswerChange={handleAnswerChange} />
                  ) : (
                    <MultipleChoiceTest id={question.id} onSelectionChange={handleSelectionChange} />
                  )}
                  {correctness[question.id] !== undefined && (
                    <div className={`mt-2 ${correctness[question.id] ? 'text-green-500' : 'text-red-500'}`}>
                      {correctness[question.id] ? 'Correct' : 'Incorrect'}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}