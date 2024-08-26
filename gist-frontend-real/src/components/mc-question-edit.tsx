

import React, { useState } from 'react';

interface MultipleChoiceProps {
  id: number;
  onUpdate: (id: number, question: string, options: string[], correctOptions: number[]) => void;
}

const MultipleChoiceEdit: React.FC<MultipleChoiceProps> = ({ id, onUpdate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctOptions, setCorrectOptions] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index: number) => {
    if (correctOptions.includes(index)) {
      setCorrectOptions(correctOptions.filter((i) => i !== index));
    } else {
      setCorrectOptions([...correctOptions, index]);
    }
  };

  const handleAddOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setCorrectOptions(correctOptions.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setIsEditing(false);
    onUpdate(id, question, options, correctOptions);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <>
      {submitted && !isEditing ? (
        <>
          <div className="flex flex-col items-center space-y-4 padding pb-2">
            <div className="text-white rounded w-full text-left text-3xl flex justify-between items-center">
              {question}
              <button onClick={handleEdit} className="ml-2 text-blue-500">
                ✏️
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            {options.map((option, index) => (
              <div key={index} className="text-white border border-gray-300 p-2 rounded w-full text-left">
                {option} {correctOptions.includes(index) && '(Correct)'}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <input
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border border-gray-300 p-2 rounded text-black w-full"
          />
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 w-full">
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="border border-gray-300 p-2 rounded text-black flex-grow"
              />
              <input
                type="checkbox"
                checked={correctOptions.includes(index)}
                onChange={() => handleCorrectOptionChange(index)}
              />
              <button
                onClick={() => handleRemoveOption(index)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
          {options.length < 8 && (
            <button
              onClick={handleAddOption}
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
            >
              Add Option
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!question || options.some((option) => !option) || correctOptions.length === 0}
            className={`px-4 py-3 rounded mt-4 ${
              !question || options.some((option) => !option) || correctOptions.length === 0
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white'
            }`}
          >
            {isEditing ? 'Save' : 'Add Question'}
          </button>
        </div>
      )}
    </>
  );
};

export default MultipleChoiceEdit;
