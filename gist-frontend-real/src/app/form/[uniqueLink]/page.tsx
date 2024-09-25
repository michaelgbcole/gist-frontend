'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertTriangle, Send } from 'lucide-react'
import ResponsiveMenuBar from '@/components/nav-bar'
import Footer from '@/components/footer'
import SAQTest from '@/components/saq-question-test'
import MultipleChoiceTest from '@/components/mc-question-test'
import { User } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'

const AuthWrapper = dynamic(() => import('@/components/AuthWrapper'), { ssr: false })

interface Question {
  id: number
  type: string
  question: string
  gist?: string
  options: string[]
  correctOptions: number[]
}

function FormSubmissionContent({ user }: { user: User }) {
  const params = useParams()
  const router = useRouter()
  const uniqueLink = params?.uniqueLink as string | undefined

  const [questions, setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [correctness, setCorrectness] = useState<{ [key: number]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (uniqueLink) {
      fetchQuestions(uniqueLink)
    }
  }, [uniqueLink])

  async function fetchQuestions(link: string) {
    try {
      const response = await fetch(`/api/get-form?uniqueLink=${link}`)
      if (!response.ok) {
        throw new Error('Failed to fetch form')
      }
      const data = await response.json()
      setQuestions(data.questions)
      setTitle(data.form.title)
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Failed to load the form. Please try again later.')
    }
  }

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer)
  }

  const handleSelectionChange = (indices: number[]) => {
    setSelectedIndices(indices)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const newCorrectness: { [key: number]: boolean } = {}
    for (const question of questions) {
      const payload = {
        questionId: question.id,
        typedAnswer: question.type === 'SAQ' ? currentAnswer : undefined,
        selectedAnswers: question.type === 'MultipleChoice' ? selectedIndices : undefined,
      }

      try {
        const response = await fetch('/api/grade-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const result = await response.json()
        newCorrectness[question.id] = result.isCorrect
        console.log(`Question ID: ${question.id}, Is Correct: ${result.isCorrect}`)
      } catch (error) {
        console.error(`Error grading question ID: ${question.id}`, error)
        setError('An error occurred while submitting your answers. Please try again.')
      }
    }
    setCorrectness(newCorrectness)
    setIsSubmitting(false)
    console.log('Form submitted')
  }

  if (!uniqueLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AlertTriangle size={48} className="text-yellow-500 mb-4 mx-auto" />
          <h1 className="text-2xl font-bold text-center">Error: No unique link provided</h1>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <ResponsiveMenuBar />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <h1 className="text-3xl sm:text-5xl font-bold mb-8 text-center">{title}</h1>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500 text-white p-4 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}
          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-8 bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                {question.type === 'SAQ' ? (
                  <SAQTest id={question.id} onAnswerChange={handleAnswerChange} />
                ) : (
                  <MultipleChoiceTest id={question.id} onSelectionChange={handleSelectionChange} />
                )}
                <AnimatePresence>
                  {correctness[question.id] !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className={`mt-4 flex items-center ${
                        correctness[question.id] ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {correctness[question.id] ? (
                        <Check className="mr-2" />
                      ) : (
                        <X className="mr-2" />
                      )}
                      {correctness[question.id] ? 'Correct' : 'Incorrect'}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2"
                >
                  <Send size={20} />
                </motion.div>
              ) : (
                <Send size={20} className="mr-2" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

export default function FormSubmission() {
  const router = useRouter()

  return (
    <AuthWrapper>
      {(user) => {
        if (user) {
          return <FormSubmissionContent user={user} />
        }
      }}
    </AuthWrapper>
  )
}