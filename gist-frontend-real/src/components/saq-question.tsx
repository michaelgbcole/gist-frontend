import React, { useState } from 'react';

const SAQ = () => {
  const [submitted, setSubmitted] = useState(false);
  const [question, setQuestion] = useState('');
  const [gist, setGist] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
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
            onChange={(e) => setQuestion(e.target.value)}
            className="border border-gray-300 p-2 rounded text-black w-full text-center"
          />
          <input
            type="text"
            placeholder="Gist"
            value={gist}
            onChange={(e) => setGist(e.target.value)}
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

export default SAQ;