'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from 'react-spring'
import { ChevronRight, CheckCircle, Book, Brain, Clock, Star, BarChart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import NavBar from '@/components/nav-bar'
import Footer from '@/components/footer'

const StaticStarryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const stars: { x: number; y: number; radius: number }[] = []
    const starCount = 200

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5
      })
    }

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'

      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    drawStars()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" />
}

export default function GistLandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const testimonials = [
    { name: 'Sarah Johnson', role: 'High School History Teacher', content: 'Gist has cut my grading time by 80%. I now have more time to focus on improving my teaching methods.' },
    { name: 'Dr. Michael Lee', role: 'High School English Teacher', content: 'The Essay Grader tool is a game-changer. It provides consistent and fair grading, which my students appreciate.' },
    { name: 'Emily Chen', role: 'Education Coordinator', content: 'Gist helps us identify trends and improve our curriculum.' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen bg-black text-white relative">
      <StaticStarryBackground />
      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6">
          <NavBar />
        </header>

        <main>
          <section className="container mx-auto px-4 py-20">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-bold mb-6 text-white">Revolutionize Your Grading with AI</h1>
              <p className="text-xl mb-8 text-gray-300">Gist cuts teacher grading time by ~80% with powerful AI tools. Spend less time grading and more time teaching.</p>
              <a href="/login">
                <Button size="lg" className="mr-4 bg-blue-400 text-black hover:bg-blue-500">
                  Get Started <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </motion.div>
          </section>

          <section id="features" className="py-20">
            <div className="container mx-auto px-4">
              <motion.h2
                className="text-3xl font-bold text-center mb-12 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Powerful Tools for Educators
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Brain, title: 'Essay Grader', description: 'AI-powered tool to grade essays quickly and consistently.' },
                  { icon: CheckCircle, title: 'Quizzes', description: 'Create and grade quizzes effortlessly with our intelligent system.' },
                  { icon: BarChart, title: 'Analytics (Coming Soon)', description: 'Gain insights into class performance and identify areas for improvement.' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-800 p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="how-it-works" className="py-20">
            <div className="container mx-auto px-4">
              <motion.h2
                className="text-3xl font-bold text-center mb-12 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                How Gist Transforms Your Grading Process
              </motion.h2>
              <div className="flex justify-center">
                <motion.ol className="relative border-l border-gray-700">
                  {[
                    { title: 'Upload Assignments', description: 'Submit essays or quizzes to the Gist platform.' },
                    { title: 'AI Grading', description: 'Our advanced AI grades assignments with high accuracy.' },
                    { title: 'Review Results', description: 'Quickly review AI-graded assignments and make adjustments if needed.' },
                    { title: 'Analyze Performance', description: 'Use analytics to gain insights into class and individual student performance.' },
                  ].map((step, index) => (
                    <motion.li
                      key={index}
                      className="mb-10 ml-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                    >
                      <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-900 rounded-full -left-4 ring-4 ring-gray-800">
                        <Book className="w-4 h-4 text-blue-400" />
                      </span>
                      <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                      <p className="text-base text-gray-300">{step.description}</p>
                    </motion.li>
                  ))}
                </motion.ol>
              </div>
            </div>
          </section>

          <section id="testimonials" className="py-20">
            <div className="container mx-auto px-4">
              <motion.h2
                className="text-3xl font-bold text-center mb-12 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                What Educators Are Saying
              </motion.h2>
              <motion.div
                className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Star className="h-8 w-8 text-yellow-400 mb-4" />
                <p className="text-lg mb-4 text-gray-300">{testimonials[currentTestimonial].content}</p>
                <div>
                  <p className="font-semibold text-white">{testimonials[currentTestimonial].name}</p>
                  <p className="text-gray-400">{testimonials[currentTestimonial].role}</p>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <motion.h2
                className="text-3xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Ready to Revolutionize Your Grading?
              </motion.h2>
              <motion.p
                className="text-xl mb-8 text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Join Gist today and experience the power of AI-assisted grading. Save time, improve consistency, and gain valuable insights into your class performance.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <a href='/login'>
                <Button size="lg" className="mr-4 bg-blue-400 text-black hover:bg-blue-500">
                  Start Your Free Trial
                </Button>
                </a>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}