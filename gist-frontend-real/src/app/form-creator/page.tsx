"use client";
import React, { useState, useEffect } from 'react';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import SAQ from '@/components/saq-question';
import MultipleChoice from '@/components/mc-question';

interface Question {
  id: number;
  type: 'SAQ' | 'MultipleChoice';
  question?: string;
  gist?: string;
}

export default function Home() {
    const [questionList, setQuestionList] = useState<Question[]>([]);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [title, setTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(true);
  
    const handleButtonClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      setShowMenu(true);
    };
  
    const handleDeleteButtonClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      setShowDeleteMenu(true);
    };
  
    const addSAQ = () => {
      setQuestionList([...questionList, { id: questionList.length, type: 'SAQ' }]);
      setShowMenu(false);
    };
  
    const addMultipleChoice = () => {
      setQuestionList([...questionList, { id: questionList.length, type: 'MultipleChoice' }]);
      setShowMenu(false);
    };
  
    const deleteQuestion = (id: number) => {
      setQuestionList(questionList.filter((question) => question.id !== id));
      setShowDeleteMenu(false);
    };
  
    const handleTitleSubmit = () => {
      setIsEditingTitle(false);
    };
  
    const handlePublish = () => {
      console.log('Publishing...');
      questionList.forEach((q) => {
        if (q.type === 'SAQ') {
          console.log(`Question ${q.id}:`);
          console.log(`Question: ${q.question}`);
          console.log(`Gist: ${q.gist}`);
        }
      });
    };

    const handleSAQUpdate = (id: number, question: string, gist: string) => {
        setQuestionList((prevList) =>
          prevList.map((q) =>
            q.id === id ? { ...q, type: 'SAQ', question, gist } : q
          )
        );
      };
      
      
  
    useEffect(() => {
      const handleClickOutside = () => {
        setShowMenu(false);
        setShowDeleteMenu(false);
      };
      if (showMenu || showDeleteMenu) {
        document.addEventListener('click', handleClickOutside);
      } else {
        document.removeEventListener('click', handleClickOutside);
      }
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }, [showMenu, showDeleteMenu]);
  
    return (
      <div className="min-h-screen flex flex-col" onClick={(e) => e.stopPropagation()}>
        <ResponsiveMenuBar />
        <main className="flex-grow flex items-center justify-center bg-gray-900 p-4 sm:p-12">
          <div className="text-center w-full max-w-4xl">
            <div className="flex flex-col items-center justify-center">
              {isEditingTitle ? (
                <>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title here"
                    className="text-3xl sm:text-6xl font-bold mb-4 text-black p-2 rounded text-center w-full sm:w-auto"
                  />
                  <button
                    onClick={handleTitleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded ml-0 sm:ml-2 mt-2 sm:mt-0 m-8"
                  >
                    Submit
                  </button>
                </>
              ) : (
                <h1 className="text-3xl sm:text-6xl font-bold mb-4">{title}</h1>
              )}
            </div>
            {questionList.map((question) => (
              <div className='p-4' key={question.id}>
                {question.type === 'SAQ' ? (
                  <SAQ id={question.id} onUpdate={handleSAQUpdate} />
                ) : (
                  <MultipleChoice />
                )}
              </div>
            ))}
            <div className="flex space-x-2 justify-center mt-4">
              <button
                onClick={handleButtonClick}
                className="bg-blue-500 text-white w-10 h-10 rounded items-center justify-center p-2"
              >
                {' + '}
              </button>
              <button
                onClick={handleDeleteButtonClick}
                className="bg-red-500 text-white w-10 h-10 rounded items-center justify-center p-2"
              >
                {' - '}
              </button>
            </div>
            {showMenu && (
              <div className="absolute left-1/2 right-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow-lg w-64 sm:w-128" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={addSAQ}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full"
                >
                  Add SAQ
                </button>
                <div className='m-2'>
                </div>
                <button
                  onClick={addMultipleChoice}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full"
                >
                  Add Multiple Choice
                </button>
              </div>
            )}
            {showDeleteMenu && (
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-white p-2 rounded shadow-lg w-auto sm:w-128" onClick={(e) => e.stopPropagation()}>
                {questionList.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => deleteQuestion(question.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded m-0.5"
                  >
                    Delete {question.type} {question.id}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handlePublish}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
            >
              Publish
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
}