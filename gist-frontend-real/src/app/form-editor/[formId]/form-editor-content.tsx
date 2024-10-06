'use client';
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Edit3, Check, X, AlertTriangle, Save } from 'lucide-react'
import ResponsiveMenuBar from '@/components/nav-bar'
import Footer from '@/components/footer'
import SAQ from '@/components/saq-question-edit'
import MultipleChoice from '@/components/mc-question-edit'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface Question {
  id: number
  type: 'SAQ' | 'MultipleChoice'
  question?: string
  gist?: string
  options?: string[]
  correctOptions?: number[]
}

interface FormEditorContentProps {
  user: User
  formId: string
}

export default function FormEditorContent({ user, formId }: FormEditorContentProps) {
  const router = useRouter()
  const [questionList, setQuestionList] = useState<Question[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)


  useEffect(() => {
    if (formId) {
      fetchFormData(formId)
    }
  }, [formId])

  const fetchFormData = async (id: string) => {
    try {
      const response = await fetch(`/api/get-form-edit?formId=${id}&userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setTitle(data.title)
        setQuestionList(data.questions)
      } else {
        setIsError(true)
        console.error('Error fetching form data')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addQuestion = (type: 'SAQ' | 'MultipleChoice') => {
    setQuestionList([...questionList, { id: Date.now(), type }])
    setShowAddModal(false)
  }

  const deleteQuestion = (id: number) => {
    setQuestionList(questionList.filter((question) => question.id !== id))
  }

  const handleTitleSubmit = () => {
    setIsEditingTitle(false)
  }

  const handleSaveForm = async () => {
    if (!formId || typeof formId !== 'string') {
      console.error('Invalid form ID')
      return
    }

    try {
      const response = await fetch('/api/update-form', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          title,
          questionList,
          userId: user.id,
        }),
      })

      if (response.ok) {
        alert('Form saved successfully!')
        router.push('/dashboard/quizzes') // Redirect to dashboard after saving
      } else {
        console.error('Error saving form:', await response.json())
      }
    } catch (error) {
      console.error('Error saving form:', error)
    }
  }


  const handleSAQUpdate = (id: number, question: string, gist: string) => {
    setQuestionList((prevList) =>
      prevList.map((q) =>
        q.id === id ? { ...q, type: 'SAQ', question, gist } : q
      )
    )
  }

  const handleMCUpdate = (id: number, question: string, options: string[], correctOptions: number[]) => {
    setQuestionList((prevList) =>
      prevList.map((q) =>
        q.id === id ? { ...q, type: 'MultipleChoice', question, options, correctOptions } : q
      )
    )
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (isError) {
    return <div className="flex justify-center items-center h-screen min-h-screen flex-col bg-gray-900 text-white">
      <ResponsiveMenuBar />
      <main className="flex-grow flex flex-col items-center p-4 sm:p-12">
        Error! Make sure you are logged into the right account.
      </main>
    </div>
  }

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
                  placeholder="Enter title here"
                  className="text-3xl sm:text-5xl font-bold mb-4 bg-transparent border-b-2 border-blue-500 text-center w-full focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleTitleSubmit}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-blue-500"
                >
                  <Check size={24} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <h1 className="text-3xl sm:text-5xl font-bold mb-4">{title}</h1>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditingTitle(true)}
                  className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                >
                  <Edit3 size={20} />
                </motion.button>
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
                  <SAQ
                    id={question.id}
                    onUpdate={handleSAQUpdate}
                    onDeleteQuestion={deleteQuestion}
                    initialQuestion={question.question}
                    initialGist={question.gist}
                  />
                ) : (
                  <MultipleChoice
                    id={question.id}
                    onUpdate={handleMCUpdate}
                    onDeleteQuestion={deleteQuestion}
                    initialQuestion={question.question}
                    initialOptions={question.options}
                    initialCorrectOptions={question.correctOptions}
                  />
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteQuestion(question.id)}
                  className="absolute top-2 right-2 text-red-500"
                >
                  <X size={20} />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-8 right-8 flex flex-col items-end space-y-4"
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
              onClick={handleSaveForm}
              className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center"
            >
              <Save size={20} className="mr-2" />
              Save Changes
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