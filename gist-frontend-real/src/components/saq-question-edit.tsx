import React, { useState, useEffect } from 'react';

interface SAQProps {
  id: number;
  onUpdate: (id: number, question: string, gist: string) => void;
  initialQuestion?: string;
  initialGist?: string;
}

const SAQEdit: React.FC<SAQProps> = ({ 
  id, 
  onUpdate, 
  initialQuestion = '', 
  initialGist = '' 
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [question, setQuestion] = useState(initialQuestion);
  const [gist, setGist] = useState(initialGist);
  const [isEditing, setIsEditing] = useState(!initialQuestion);

  useEffect(() => {
    if (initialQuestion) {
      setSubmitted(true);
    }
  }, [initialQuestion]);

  const handleSubmit = () => {
    setSubmitted(true);
    setIsEditing(false);
    onUpdate(id, question, gist);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  };

  const handleGistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGist(e.target.value);
  };

  return (
    <>
      {submitted && !isEditing ? (
        <>
          <div className="flex flex-col items-center space-y-4 pb-2">
            <div className="text-white rounded w-full text-left text-3xl flex justify-between items-center">
              {question}
              <button onClick={handleEdit} className="ml-2 text-blue-500">
                ✏️
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="text-white border border-gray-300 p-2 rounded w-full text-left">
              {gist}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={handleQuestionChange}
            className="border border-gray-300 p-2 rounded text-black w-full text-center"
          />
          <input
            type="text"
            placeholder="Gist"
            value={gist}
            onChange={handleGistChange}
            className="border border-gray-300 p-2 rounded text-black w-full text-center"
          />
          <button
            onClick={handleSubmit}
            disabled={!question || !gist}
            className={`px-4 py-3 rounded mt-4 ${
              !question || !gist ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white'
            }`}
          >
            {isEditing ? 'Save' : 'Add Question'}
          </button>
        </div>
      )}
    </>
  );
};

export default SAQEdit;