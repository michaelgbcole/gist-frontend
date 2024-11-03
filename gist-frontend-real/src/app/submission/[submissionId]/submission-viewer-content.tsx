'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ResponsiveMenuBar from '@/components/nav-bar'
import Footer from '@/components/footer'

import dynamic from 'next/dynamic'
import { User } from '@supabase/supabase-js'



interface SubmissionData {
  id: number;
  studentId: string;
  formId: number;
  answers: {
    questionId: number;
    isCorrect: boolean;
    answerData: string[] | number[];
  }[];
  score: number;
  createdAt: string;
}

type Question = {
  id: number;
  question: string;
}

export default function SubmissionViewerContent({ user }: { user: User }) {
  const params = useParams()
  const router = useRouter()
  const submissionId = params?.submissionId as string | undefined

  const [questions, setQuestions] = useState<any[]>([])
  const [submission, setSubmission] = useState<SubmissionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (submissionId) {
      fetchSubmission(submissionId)
    }
  }, [submissionId])

  
async function fetchSubmission(id: string) {
  try {
    const response = await fetch(`/api/get-submission?id=${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch submission')
    }
    const data = await response.json()
    setSubmission(data.submission)
    const questionPromises = data.submission.answers.map((answer: { questionId: number }) =>
      fetchQuestion(answer.questionId)
    )
    await Promise.all(questionPromises)
  } catch (error) {
    console.error('Error fetching submission:', error)
    setError('Failed to load the submission. Please try again later.')
  }
}

async function fetchQuestion(id: number) {
  try {
    const response = await fetch(`/api/get-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
    if (!response.ok) {
      throw new Error('Failed to fetch question')
    }
    const data = await response.json()
    setQuestions((prevQuestions) => [...prevQuestions, { id, question: data.question }])
    console.log(questions, 'data')
    return data
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <ResponsiveMenuBar />
        <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500 text-white p-4 rounded-lg"
          >
            {error}
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        <ResponsiveMenuBar />
        <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl"
          >
            Loading...
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
          <h1 className="text-3xl sm:text-5xl font-bold mb-8 text-center">Submission View</h1>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4">Score: {submission.score}%</h2>
            <p>Submitted on: {new Date(submission.createdAt).toLocaleString()}</p>
          </div>
          {submission.answers.map((answer, index) => {
            console.log(answer.questionId, 'answer')

    const question = questions.find(q => q.id === answer.questionId)
    console.log(question, 'qieuwioq')
    return (
      <motion.div
        key={answer.questionId}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="mb-6 bg-gray-800 rounded-lg p-6 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-2">{question?.question?.question}</h3>
        <p className="mb-2">Answer: {Array.isArray(answer.answerData) ? answer.answerData.join(', ') : answer.answerData}</p>
        <p className={`font-bold ${answer.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
          {answer.isCorrect ? 'Correct' : 'Incorrect'}
        </p>
      </motion.div>
    )
  })}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}