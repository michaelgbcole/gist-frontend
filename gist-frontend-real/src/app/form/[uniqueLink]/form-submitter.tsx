'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertTriangle, Send } from 'lucide-react'
import ResponsiveMenuBar from '@/components/nav-bar'
import Footer from '@/components/footer'
import SAQTest from '@/components/saq-question-test'
import MultipleChoiceTest from '@/components/mc-question-test'
import dynamic from 'next/dynamic'
import { User } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const AuthWrapper = dynamic(() => import('@/components/AuthWrapper'), { ssr: false })

interface Question {
  id: number
  type: string
  question: string
  gist?: string
  options: string[]
  correctOptions: number[]
}

export default function FormSubmissionContent({ user }: { user: User }) {
  const params = useParams()
  const router = useRouter()
  const uniqueLink = params?.uniqueLink as string | undefined

  const [questions, setQuestions] = useState<Question[]>([])
  const [title, setTitle] = useState('')
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: number]: string }>({})
  const [selectedIndices, setSelectedIndices] = useState<{ [key: number]: number[] }>({})
  const [percentage, setPercentage] = useState<number | null>(null)
  const [correctness, setCorrectness] = useState<{ [key: number]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const handleAnswerChange = (questionId: number, answer: string) => {
    setCurrentAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }))
  }

  const handleSelectionChange = (questionId: number, indices: number[]) => {
    setSelectedIndices(prevState => ({
      ...prevState,
      [questionId]: indices
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const payloads = questions.map((question) => ({
      questionId: question.id,
      typedAnswer: question.type === 'SAQ' ? currentAnswers[question.id] : undefined,
      selectedAnswers: question.type === 'MultipleChoice' ? selectedIndices[question.id] : undefined,
    }))
    console.log('payloads:', payloads)

    try {
      const response = await fetch('/api/grade-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payloads, user, uniqueLink }),
      })

      const results = await response.json()
      const newCorrectness = results.results.reduce((acc: Record<string, boolean>, result: { questionId: string, isCorrect: boolean }) => {
        acc[result.questionId] = result.isCorrect
        return acc
      }, {} as Record<string, boolean>)
      const percentage = results.score as number
      setPercentage(percentage)
      setCorrectness(newCorrectness)
      setIsSubmitted(true)
      console.log('Form submitted')
    } catch (error) {
      console.error('Error grading questions', error)
      setError('An error occurred while submitting your answers. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted && percentage !== null) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <ResponsiveMenuBar />
        <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-3xl text-center"
          >
            <h1 className="text-3xl sm:text-5xl font-bold mb-8">{title}</h1>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-6xl font-bold mb-4"
            >
              Your Score
            </motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-6xl sm:text-8xl font-bold text-blue-500"
            >
              {percentage.toFixed(2)}%
            </motion.div>
          </motion.div>
        </main>
        <Footer />
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
            {questions
              .filter((question) => question.question)
              .map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-8 bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                {question.type === 'SAQ' ? (
                  <SAQTest
                    id={question.id}
                    onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                  />
                ) : (
                  <MultipleChoiceTest
                    id={question.id}
                    onSelectionChange={(indices) => handleSelectionChange(question.id, indices)}
                  />
                )}
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


