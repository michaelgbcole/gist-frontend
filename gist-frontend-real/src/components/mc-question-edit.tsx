

import { motion } from 'framer-motion';
import { Edit3, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface MultipleChoiceProps {
  id: number;
  onUpdate: (id: number, question: string, options: string[], correctOptions: number[]) => void;
  onDeleteQuestion: (id: number) => void;
  initialQuestion?: string;
  initialOptions?: string[];
  initialCorrectOptions?: number[];
}

const MultipleChoiceEdit: React.FC<MultipleChoiceProps> = ({ 
  id, 
  onUpdate, 
  onDeleteQuestion,
  initialQuestion = '', 
  initialOptions = ['', ''], 
  initialCorrectOptions = [] 
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [question, setQuestion] = useState(initialQuestion);
  const [options, setOptions] = useState(initialOptions);
  const [correctOptions, setCorrectOptions] = useState<number[]>(initialCorrectOptions);
  const [isEditing, setIsEditing] = useState(!initialQuestion);

  useEffect(() => {
    if (initialQuestion) {
      setSubmitted(true);
    }
  }, [initialQuestion]);

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

  const handleDelete = () => {
    onDeleteQuestion(id);
  };

  return (
    <>
      {submitted && !isEditing ? (
       <>
       <div className="flex flex-col items-center space-y-4 padding pb-2">
         <div className="text-white rounded w-full text-left text-3xl flex justify-between items-center">
           {question}
           <div className="flex">
             <button onClick={handleEdit} className="ml-2 text-blue-500">
               <Edit3 />
             </button>
             <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={handleDelete}
               className="ml-2 text-red-500"
             >
               <X size={20} />
             </motion.button>
           </div>
         </div>
       </div>
            {options.map((option, index) => (
              <div key={index} className="text-white border border-gray-300 p-2 rounded w-full text-left">
                {option} {correctOptions.includes(index) && '(Correct)'}
              </div>
            ))}
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
