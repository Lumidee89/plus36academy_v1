'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, User, CheckCircle, XCircle, Clock,
  Calendar, Award, MessageSquare, Send
} from 'lucide-react'

interface Question {
  id: string
  text: string
  type: string
  points: number
  options?: any[]
  correctAnswer?: any
  explanation?: string
}

interface StudentAnswer {
  id: string
  questionId: string
  answer: any
  isCorrect: boolean | null
  pointsEarned: number
  feedback?: string
  question: Question
}

interface Attempt {
  id: string
  student: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  score: number
  passed: boolean
  timeSpent: number
  startedAt: string
  submittedAt: string
  questionAnswers: StudentAnswer[]
}

export default function StudentResultPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string
  const attemptId = params.attemptId as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchResult()
  }, [attemptId])

  async function fetchResult() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tutor/assessments/${assessmentId}/results/${attemptId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch result')

      setAttempt(data.data)
    } catch (error: any) {
      console.error('Error fetching result:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} min ${secs} sec`
  }

  const handleSubmitFeedback = async (questionId: string, feedbackText: string) => {
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tutor/assessments/${assessmentId}/results/${attemptId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionId,
          feedback: feedbackText,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit feedback')

      // Refresh to show updated feedback
      fetchResult()
      setFeedback('')
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !attempt) {
    return (
      <div className="card-dark rounded-2xl p-12 text-center">
        <h3 className="text-xl font-bold text-dark-300 mb-2">Result Not Found</h3>
        <p className="text-dark-400 mb-6">{error || 'Unable to load student result'}</p>
        <Link
          href={`/dashboard/tutor/assessments/${assessmentId}/results`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back to Results
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/tutor/assessments/${assessmentId}/results`}
          className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-brand-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-display text-3xl font-black text-dark-300">Student Result</h1>
      </div>

      {/* Student Info Card */}
      <div className="card-dark rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-2xl">
            {attempt.student.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-dark-300 mb-1">{attempt.student.name}</h2>
            <p className="text-dark-400">{attempt.student.email}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${attempt.passed ? 'text-green-500' : 'text-red-500'}`}>
              {attempt.score}%
            </div>
            <div className="text-dark-400 text-sm">
              {attempt.passed ? 'Passed' : 'Failed'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-800">
          <div className="text-center">
            <div className="text-dark-400 text-sm mb-1">Started</div>
            <div className="text-dark-300 font-medium">{formatDate(attempt.startedAt)}</div>
          </div>
          <div className="text-center">
            <div className="text-dark-400 text-sm mb-1">Submitted</div>
            <div className="text-dark-300 font-medium">{formatDate(attempt.submittedAt)}</div>
          </div>
          <div className="text-center">
            <div className="text-dark-400 text-sm mb-1">Time Spent</div>
            <div className="text-dark-300 font-medium">{formatTime(attempt.timeSpent)}</div>
          </div>
        </div>
      </div>

      {/* Answers Review */}
      <div className="card-dark rounded-2xl p-6">
        <h2 className="text-lg font-bold text-dark-300 mb-4">Answer Review</h2>
        <div className="space-y-6">
          {attempt.questionAnswers.map((answer, index) => (
            <div key={answer.id} className="border border-dark-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-dark-300">Question {index + 1}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-dark-800 rounded-lg text-dark-400">
                    {answer.question.points} pts
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    answer.isCorrect === true ? 'bg-green-500/10 text-green-500' :
                    answer.isCorrect === false ? 'bg-red-500/10 text-red-500' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {answer.isCorrect === true ? 'Correct' :
                     answer.isCorrect === false ? 'Incorrect' :
                     'Pending Review'}
                  </span>
                </div>
              </div>

              <p className="text-dark-300 text-sm mb-3">{answer.question.text}</p>

              {/* Student's Answer */}
              <div className="mb-3">
                <p className="text-xs text-dark-400 mb-1">Student's Answer:</p>
                <div className="p-3 bg-dark-800/50 rounded-lg">
                  {answer.question.type === 'MULTIPLE_CHOICE' && answer.question.options && (
                    <p className="text-sm text-dark-300">
                      Option {String.fromCharCode(65 + answer.answer)}: {answer.question.options[answer.answer]}
                    </p>
                  )}
                  {answer.question.type === 'TRUE_FALSE' && (
                    <p className="text-sm text-dark-300">{answer.answer ? 'True' : 'False'}</p>
                  )}
                  {(answer.question.type === 'SHORT_ANSWER' || answer.question.type === 'ESSAY') && (
                    <p className="text-sm text-dark-300 whitespace-pre-wrap">{answer.answer}</p>
                  )}
                </div>
              </div>

              {/* Correct Answer (for objective questions) */}
              {answer.question.type !== 'ESSAY' && answer.question.correctAnswer !== undefined && (
                <div className="mb-3">
                  <p className="text-xs text-dark-400 mb-1">Correct Answer:</p>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    {answer.question.type === 'MULTIPLE_CHOICE' && answer.question.options && (
                      <p className="text-sm text-green-500">
                        Option {String.fromCharCode(65 + answer.question.correctAnswer)}: {answer.question.options[answer.question.correctAnswer]}
                      </p>
                    )}
                    {answer.question.type === 'TRUE_FALSE' && (
                      <p className="text-sm text-green-500">{answer.question.correctAnswer ? 'True' : 'False'}</p>
                    )}
                    {answer.question.type === 'SHORT_ANSWER' && (
                      <p className="text-sm text-green-500">{answer.question.correctAnswer}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Points Earned */}
              <div className="mb-3 flex items-center gap-2">
                <Award size={14} className="text-yellow-500" />
                <span className="text-sm text-dark-300">
                  Points earned: {answer.pointsEarned} / {answer.question.points}
                </span>
              </div>

              {/* Teacher Feedback */}
              {answer.feedback && (
                <div className="mb-3 p-3 bg-brand-500/10 rounded-lg">
                  <p className="text-xs text-brand-400 mb-1">Your Feedback:</p>
                  <p className="text-sm text-dark-300">{answer.feedback}</p>
                </div>
              )}

              {/* Feedback Form (for essay questions) */}
              {answer.question.type === 'ESSAY' && (
                <div className="mt-3">
                  <textarea
                    placeholder="Add feedback for student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="input-dark w-full h-20 mb-2"
                  />
                  <button
                    onClick={() => handleSubmitFeedback(answer.questionId, feedback)}
                    disabled={submitting || !feedback.trim()}
                    className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2"
                  >
                    <Send size={14} />
                    Submit Feedback
                  </button>
                </div>
              )}

              {/* Explanation */}
              {answer.question.explanation && (
                <div className="mt-3 p-3 bg-dark-800/50 rounded-lg">
                  <p className="text-xs text-dark-400 mb-1">Explanation:</p>
                  <p className="text-sm text-dark-300">{answer.question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start">
        <Link
          href={`/dashboard/tutor/assessments/${assessmentId}/results`}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back to Results
        </Link>
      </div>
    </div>
  )
}