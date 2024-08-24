'use client';
import React, { useState, useEffect } from 'react';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import SAQ from '@/components/saq-question';
import MultipleChoice from '@/components/mc-question';

export default function Home() {
  const [questionList, setQuestionList] = useState<{ id: number, type: 'SAQ' | 'MultipleChoice' }[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowMenu(true);
  };

  const addSAQ = () => {
    setQuestionList([...questionList, { id: questionList.length, type: 'SAQ' }]);
    setShowMenu(false);
  };

  const addMultipleChoice = () => {
    setQuestionList([...questionList, { id: questionList.length, type: 'MultipleChoice' }]);
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowMenu(false);
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="min-h-screen flex flex-col" onClick={(e) => e.stopPropagation()}>
      <ResponsiveMenuBar />
      <main className="flex-grow flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome to form-creator</h1>
          <p className="text-2xl">This is the future of education...</p>

          {questionList.map((question) => (
            <div className='p-4' key={question.id}>
              {question.type === 'SAQ' ? <SAQ /> : <MultipleChoice />}
            </div>
          ))}
        
         
        <button
            onClick={handleButtonClick}
            className="bg-blue-500 text-white w-10 h-10 rounded mt-4 items-center justify-center p-2"
          >
            {' + '}
          </button>

          {showMenu && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow-lg w-128" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={addSAQ}
                className="bg-green-500 text-white px-4 py-2 rounded m-2"
              >
                Add SAQ
              </button>
              <button
                onClick={addMultipleChoice}
                className="bg-green-500 text-white px-4 py-2 rounded m-2"
              >
                Add Multiple Choice
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}