"use client";
import React, { useState } from 'react';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import SAQTest from '@/components/saq-question-test';
import MultipleChoiceTest from '@/components/mc-question-test';

interface Question {
  id: number;
  type: string;
  question?: string;
  gist?: string;
  options?: string[];
  correctOptions?: number[];
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [title, setTitle] = useState('');
  const [formId, setFormId] = useState<number | null>(null);
  const [correctness, setCorrectness] = useState<{ [key: number]: boolean }>({});

  async function fetchQuestions(id: number) {
    const response = await fetch('/api/get-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    setQuestions(data.questions);
    setTitle(data.title);
  }

  const handleSelectionChange = (indices: number[]) => {
    setSelectedIndices(indices);
  };

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer);
  };

  const handleSubmit = async () => {
    const newCorrectness: { [key: number]: boolean } = {};
    for (const question of questions) {
      const payload = {
        questionId: question.id,
        typedAnswer: question.type === 'SAQ' ? currentAnswer : undefined,
        selectedAnswers: question.type === 'MultipleChoice' ? selectedIndices : undefined,
      };

      try {
        const response = await fetch('/api/grade-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        newCorrectness[question.id] = result.isCorrect;
        console.log(`Question ID: ${question.id}, Is Correct: ${result.isCorrect}`);
      } catch (error) {
        console.error(`Error grading question ID: ${question.id}`, error);
      }
    }
    setCorrectness(newCorrectness);
  };

  const handleFormIdSubmit = () => {
    if (formId !== null) {
      fetchQuestions(formId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ResponsiveMenuBar />
      <main className="flex-grow flex items-center justify-center bg-gray-900">
        <div className="w-full">
          <h1 className="text-3xl sm:text-6xl font-bold mb-4 text-center">{title}</h1>
          <div className='p-4'>
            <div className="flex justify-center mb-4">
              <input
                type="number"
                value={formId ?? ''}
                onChange={(e) => setFormId(Number(e.target.value))}
                placeholder="Enter form ID"
                className="border rounded p-2 bg-transparent text-white"
              />
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
                onClick={handleFormIdSubmit}
              >
                Load Form
              </button>
            </div>
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