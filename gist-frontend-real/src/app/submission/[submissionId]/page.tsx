'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ResponsiveMenuBar from '@/components/nav-bar'
import Footer from '@/components/footer'
import { User } from '@supabase/auth-helpers-nextjs'
import dynamic from 'next/dynamic'

const AuthWrapper = dynamic(() => import('@/components/AuthWrapper'), { ssr: false })

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

function SubmissionViewerContent({ user }: { user: User }) {
  const params = useParams()
  const router = useRouter()
  const submissionId = params?.submissionId as string | undefined

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
    } catch (error) {
      console.error('Error fetching submission:', error)
      setError('Failed to load the submission. Please try again later.')
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
          {submission.answers.map((answer, index) => (
            <motion.div
              key={answer.questionId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-6 bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold mb-2">Question {index + 1}</h3>
              <p className="mb-2">Answer: {Array.isArray(answer.answerData) ? answer.answerData.join(', ') : answer.answerData}</p>
              <p className={`font-bold ${answer.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {answer.isCorrect ? 'Correct' : 'Incorrect'}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

export default function SubmissionViewer() {
  return (
    <AuthWrapper>
      {(user) => {
        if (user) {
          return <SubmissionViewerContent user={user} />
        }
      }}
    </AuthWrapper>
  )
}