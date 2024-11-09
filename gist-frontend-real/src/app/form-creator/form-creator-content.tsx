"use client";
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Edit3, Check, X, AlertTriangle, Save } from 'lucide-react'
import ResponsiveMenuBar from '@/components/nav-bar'
import Footer from '@/components/footer'
import SAQ from '@/components/saq-question-edit'
import MultipleChoice from '@/components/mc-question-edit'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button';

interface Question {
  id: number
  type: 'SAQ' | 'MultipleChoice'
  question?: string
  gist?: string
  options?: string[]
  correctOptions?: number[]
}

export default function FormCreatorContent({ user }: { user: User }) {
  const [questionList, setQuestionList] = useState<Question[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  const addQuestion = (type: 'SAQ' | 'MultipleChoice') => {
    setQuestionList([...questionList, { id: questionList.length, type }])
    setShowAddModal(false)
  }

  const deleteQuestion = (id: number) => {
    setQuestionList(questionList.filter((question) => question.id !== id))
  }

  const handleTitleSubmit = () => {
    setIsEditingTitle(false)
  }

  const handlePublishForm = async () => {
    setIsPublishing(true)
    try {
      // Add questions to the database
      for (const question of questionList) {
        if (question?.gist || question?.correctOptions) {
        const response = await fetch('/api/add-question', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(question),
        })


        if (!response.ok) {
          console.error('Error adding question')
          setErrorMessage('Failed to publish the form. Make sure you are not exceeding the limit!')
          setIsPublishing(false)
          return
        }
      }
      }

      // Publish the form
      const response = await fetch('/api/publish-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          questionList,
          creatorId: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.location.href = '/dashboard/quizzes'
      } else {
        setErrorMessage('Failed to publish the form. Make sure you are not exceeding the limit!')
        console.error('Error publishing:', await response.json())
      }
    } catch (error) {
      console.error('Error publishing:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSAQUpdate = (id: number, question: string, gist: string) => {
    setQuestionList((prevList) =>
      prevList.map((q) =>
        q.id === id ? { ...q, type: 'SAQ', question, gist } : q
      )
    );
  };

  const handleMCUpdate = (id: number, question: string, options: string[], correctOptions: number[]) => {
    setQuestionList((prevList) =>
      prevList.map((q) =>
        q.id === id ? { ...q, type: 'MultipleChoice', question, options, correctOptions } : q
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <ResponsiveMenuBar />
      <main className="flex-grow flex flex-col items-center justify-start p-4 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center w-full max-w-4xl"
        >
          <div className="flex flex-col items-center justify-center mb-8">
            {isEditingTitle ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full"
              >
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  placeholder="Enter title here"
                  className="text-3xl sm:text-5xl font-bold mb-4 bg-transparent border-b-2 border-blue-500 text-center w-full focus:outline-none"
                />
                <Button
                  onClick={handleTitleSubmit}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-blue-500"
                >
                  <Check size={24} />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <h1 className="text-3xl sm:text-5xl font-bold mb-4">{title}</h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                >
                  <Edit3 size={20} />
                </button>
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {questionList.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-6 bg-gray-800 rounded-lg p-6 relative"
              >
                {question.type === 'SAQ' ? (
                  <SAQ id={question.id} onUpdate={handleSAQUpdate} onDeleteQuestion={deleteQuestion} />
                ) : (
                  <MultipleChoice id={question.id} onUpdate={handleMCUpdate} onDeleteQuestion={deleteQuestion} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            >
              <Plus size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePublishForm}
              className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center"
            >
              <Save size={20} className="mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish'}
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 p-6 rounded-lg"
            >
              <h2 className="text-2xl font-bold mb-4">Add Question</h2>
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addQuestion('SAQ')}
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                  Add SAQ
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addQuestion('MultipleChoice')}
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                  Add Multiple Choice
                </motion.button>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddModal(false)}
                className="absolute top-2 right-2 text-gray-400"
              >
                <X size={20} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}