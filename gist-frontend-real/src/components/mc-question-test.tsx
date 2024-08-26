"use client";
import React, { useState, useEffect } from 'react';

interface MultipleChoiceTestProps {
  id: number;
  onSelectionChange: (selectedIndices: number[]) => void;
}

const MultipleChoiceTest: React.FC<MultipleChoiceTestProps> = ({ id, onSelectionChange }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [correctOptions, setCorrectOptions] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

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
          setQuestion(data.question.question);
          setOptions(data.question.options);
          setCorrectOptions(data.question.correctOptions);
        } else {
          console.error('Error fetching data:', await response.json());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id]);

  const handleOptionClick = (index: number) => {
    let newSelectedIndices;
    if (selectedIndices.includes(index)) {
      newSelectedIndices = selectedIndices.filter((i) => i !== index);
    } else {
      newSelectedIndices = [...selectedIndices, index];
    }
    setSelectedIndices(newSelectedIndices);
    onSelectionChange(newSelectedIndices);
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 pb-2">
        <div className="text-white rounded w-full text-left text-3xl flex justify-between items-center">
          {question}
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4">
        {options.map((option, index) => (
          <button
            key={index}
            className={`text-white border border-gray-300 p-2 rounded mx-4 w-full ${selectedIndices.includes(index) ? 'bg-blue-500' : 'bg-transparent'}`}
            onClick={() => handleOptionClick(index)}
          >
            {option}
          </button>
        ))}
      </div>
    </>
  );
};

export default MultipleChoiceTest;