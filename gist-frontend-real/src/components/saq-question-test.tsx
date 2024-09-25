// src/components/saq-question-test.tsx
"use client";
import React, { useState, useEffect } from 'react';

interface SAQTestProps {
  id: number;
  onAnswerChange: (answer: string) => void;
}

const SAQTest: React.FC<SAQTestProps> = ({ id, onAnswerChange }) => {
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log(data.question.question);
          setQuestion(data.question.question);
        } else {
          console.error('Error fetching data:', await response.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswer = e.target.value;
    setAnswer(newAnswer);
    onAnswerChange(newAnswer);
  };

  return (
    <>
      <div className="flex flex-col space-y-4 pb-2 w-full">
        <div className="text-white rounded text-left text-3xl flex justify-between items-center">
          {question}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <textarea
          className="text-white border border-gray-300 p-2 rounded mx-4 w-full h-32 bg-transparent"
          style={{ textAlign: 'left', verticalAlign: 'top' }}
          onChange={handleAnswerChange}
          value={answer}
        />
      </div>
    </>
  );
};

export default SAQTest;