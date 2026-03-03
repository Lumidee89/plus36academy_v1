'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: string
  points: number
  options?: any
  order: number
}

interface Assessment {
  id: string
  title: string
  description: string
  type: string
  timeLimit: number
  questions: Question[]
  attempts: any[]
}

export default function TakeAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [attempt, setAttempt] = useState<any>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

  useEffect(() => {
    startAssessment()
  }, [assessmentId])

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit()
    }
  }, [timeLeft])

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev ? prev - 1 : 0)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft])

  async function startAssessment() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Start attempt
      const startRes = await fetch(`/api/student/assessments/${assessmentId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'start' }),
      })

      if (!startRes.ok) {
        const error = await startRes.json()
        throw new Error(error.error || 'Failed to start assessment')
      }

      const startData = await startRes.json()
      setAttempt(startData.data.attempt)

      // Fetch assessment details
      const detailsRes = await fetch(`/api/student/assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!detailsRes.ok) throw new Error('Failed to fetch assessment')

      const detailsData = await detailsRes.json()
      setAssessment(detailsData.data)

      // Set timer
      if (detailsData.data.timeLimit) {
        setTimeLeft(detailsData.data.timeLimit * 60)
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const timeSpent = assessment?.timeLimit 
        ? (assessment.timeLimit * 60) - (timeLeft || 0)
        : 0

      const res = await fetch(`/api/student/assessments/${assessmentId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'submit',
          answers,
          timeSpent,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit')
      }

      const data = await res.json()
      setResults(data.data)
      setShowResults(true)
    } catch (error: any) {
      setError(error.message)
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            {results.passed ? (
              <CheckCircle size={40} className="text-green-500" />
            ) : (
              <XCircle size={40} className="text-red-500" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-dark-300 mb-2">
            {results.passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          <p className="text-dark-400 mb-6">
            You scored {results.score?.toFixed(1)}% ({results.earnedPoints} / {results.totalPoints} points)
          </p>
          {results.passed ? (
            <p className="text-green-500 mb-6">You passed the {assessment?.type?.toLowerCase()}!</p>
          ) : (
            <p className="text-red-500 mb-6">You didn't meet the passing score.</p>
          )}
          <Link
            href="/dashboard/student/assessments"
            className="btn-primary inline-flex items-center gap-2"
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="card-dark rounded-2xl p-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-dark-600" />
        <h3 className="text-xl font-bold text-dark-300 mb-2">Assessment Not Found</h3>
        <Link href="/dashboard/student/assessments" className="btn-primary mt-4">
          Back to Assessments
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/student/assessments"
          className="inline-flex items-center gap-2 text-dark-400 hover:text-brand-400"
        >
          <ChevronLeft size={18} />
          Back to Assessments
        </Link>
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-dark-400">
            <Clock size={18} className="text-brand-400" />
            <span className={`font-mono ${timeLeft < 300 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-2">{assessment.title}</h1>
        <p className="text-dark-400">{assessment.description}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-dark-500">
          <span>{assessment.questions?.length || 0} questions</span>
          <span>•</span>
          <span>{assessment.questions?.reduce((sum, q) => sum + q.points, 0) || 0} total points</span>
        </div>
      </div>

      {/* Questions */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="space-y-4"
      >
        {assessment.questions?.map((question, qIndex) => (
          <div key={question.id} className="card-dark rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-dark-300">
                Question {qIndex + 1}
              </h3>
              <span className="text-sm text-dark-400">{question.points} points</span>
            </div>
            <p className="text-dark-300 mb-4">{question.text}</p>

            {/* Multiple Choice */}
            {question.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                {question.options?.map((option: string, oIndex: number) => (
                  <label key={oIndex} className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 cursor-pointer">
                    <input
                      type="radio"
                      name={question.id}
                      value={oIndex}
                      onChange={(e) => setAnswers({
                        ...answers,
                        [question.id]: parseInt(e.target.value),
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-dark-300 text-sm">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {question.type === 'TRUE_FALSE' && (
              <div className="flex gap-4">
                {['true', 'false'].map((value) => (
                  <label key={value} className="flex items-center gap-2 p-3 rounded-xl hover:bg-dark-800 cursor-pointer">
                    <input
                      type="radio"
                      name={question.id}
                      value={value}
                      onChange={(e) => setAnswers({
                        ...answers,
                        [question.id]: e.target.value === 'true',
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-dark-300 text-sm capitalize">{value}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Short Answer */}
            {question.type === 'SHORT_ANSWER' && (
              <input
                type="text"
                onChange={(e) => setAnswers({
                  ...answers,
                  [question.id]: e.target.value,
                })}
                className="input-dark w-full"
                placeholder="Your answer"
              />
            )}

            {/* Essay */}
            {question.type === 'ESSAY' && (
              <textarea
                onChange={(e) => setAnswers({
                  ...answers,
                  [question.id]: e.target.value,
                })}
                className="input-dark w-full h-32"
                placeholder="Write your answer here..."
              />
            )}
          </div>
        ))}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm rounded-xl p-3 flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary px-8 py-3"
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </form>
    </div>
  )
}