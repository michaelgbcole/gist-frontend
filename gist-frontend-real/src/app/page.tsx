'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSpring, animated } from 'react-spring'
import { ChevronRight, CheckCircle, Book, Brain, Clock, Star, Link } from 'lucide-react'
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

export default function GistDarkLandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const testimonials = [
    { name: 'Sarah Johnson', role: 'High School Teacher', content: 'Gist has revolutionized my grading process. It\'s accurate, fast, and gives me more time to focus on teaching.' },
    { name: 'Dr. Michael Lee', role: 'University Professor', content: 'The AI-powered insights from Gist have helped me identify areas where my students need more support. It\'s an invaluable tool.' },
    { name: 'Emily Chen', role: 'Education Coordinator', content: 'Gist has streamlined our entire assessment process. The time saved is incredible, and the analytics are top-notch.' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const floatingAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: async (next) => {
      while (true) {
        await next({ transform: 'translateY(10px)' })
        await next({ transform: 'translateY(0px)' })
      }
    },
    config: { duration: 2000 },
  })

  return (
    <div className="min-h-screen bg-black text-white relative">
      <StaticStarryBackground />
      <div className="relative z-10">
        <header className="container mx-auto px-4 py-6">
          <NavBar />
        </header>

        <main>
          <section className="container mx-auto px-4 py-20 flex items-center justify-between">
            <motion.div
              className="w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-bold mb-6 text-white">Grade Smarter, Not Harder</h2>
              <p className="text-xl mb-8 text-gray-300">Gist uses advanced AI to grade tests quickly and accurately, giving you more time to focus on what matters most - teaching.</p>
              <a href="/login">
                <Button size="lg" className="mr-4 bg-blue-400 text-black hover:bg-blue-500">
                  Get Started <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </motion.div>
            {/* <animated.div style={floatingAnimation} className="w-1/2">
              <motion.img
                src="/placeholder.svg?height=400&width=400"
                alt="AI Grading Illustration"
                className="w-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </animated.div> */}
          </section>

          <section id="features" className="py-20">
            <div className="container mx-auto px-4">
              <motion.h3
                className="text-3xl font-bold text-center mb-12 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Features that Make Grading a Breeze
              </motion.h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Brain, title: 'AI-Powered Grading', description: 'Our advanced AI accurately grades tests in seconds.' },
                  { icon: Clock, title: 'Time-Saving', description: 'Reduce grading time by up to 90%, giving you more time to teach.' },
                  { icon: CheckCircle, title: 'Accuracy', description: 'Consistent and unbiased grading for every student.' },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="bg-gray-800 p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
                    <h4 className="text-xl font-semibold mb-2 text-white">{feature.title}</h4>
                    <p className="text-gray-300">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="how-it-works" className="py-20">
            <div className="container mx-auto px-4">
              <motion.h3
                className="text-3xl font-bold text-center mb-12 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                How Gist Works
              </motion.h3>
              <div className="flex justify-center">
                <motion.ol className="relative border-l border-gray-700">
                  {[
                    { title: 'Upload Tests', description: 'Scan or upload your tests to the Gist platform.' },
                    { title: 'AI Analysis', description: 'Our AI analyzes and grades the tests with high accuracy.' },
                    { title: 'Review Results', description: 'Review the graded tests and AI-generated insights.' },
                    { title: 'Provide Feedback', description: 'Use the results to provide targeted feedback to students.' },
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
              <motion.h3
                className="text-3xl font-bold text-center mb-12 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                What Educators Are Saying (These are definetely real I promise)
              </motion.h3>
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
              <motion.h3
                className="text-3xl font-bold mb-6 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Ready to Transform Your Grading Process?
              </motion.h3>
              <motion.p
                className="text-xl mb-8 text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Join thousands of educators who are saving time and improving their teaching with Gist.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <a href='/login'>
                <Button size="lg" className="mr-4 bg-blue-400 text-black hover:bg-blue-500">
                  Start Free Trial
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