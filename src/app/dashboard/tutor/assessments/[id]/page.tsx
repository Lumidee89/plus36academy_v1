'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, Edit, Eye, Users, Clock, 
  Calendar, BookOpen, CheckCircle, XCircle, 
  AlertCircle, Download, Printer, Share2,
  BarChart3, PieChart, TrendingUp
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

interface Assessment {
  id: string
  title: string
  description: string
  type: 'TEST' | 'EXAM'
  isPublished: boolean
  timeLimit?: number
  passingScore?: number
  maxAttempts: number
  shuffleQuestions: boolean
  showResults: boolean
  createdAt: string
  course: {
    id: string
    title: string
  }
  questions: Question[]
  _count?: {
    questions: number
    attempts: number
  }
}

export default function ViewAssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assessment, setAssessment] = useState<Assessment | null>(null)

  useEffect(() => {
    fetchAssessment()
  }, [assessmentId])

  async function fetchAssessment() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tutor/assessments/${assessmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch assessment')

      setAssessment(data.data)
    } catch (error: any) {
      console.error('Error fetching assessment:', error)
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
    })
  }

  const getStatusBadge = (published: boolean) => {
    return published ? (
      <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <CheckCircle size={12} />
        Published
      </span>
    ) : (
      <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
        <AlertCircle size={12} />
        Draft
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="card-dark rounded-2xl p-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <h3 className="text-xl font-bold text-dark-300 mb-2">Assessment Not Found</h3>
        <p className="text-dark-400 mb-6">{error || 'The assessment you\'re looking for doesn\'t exist.'}</p>
        <Link
          href="/dashboard/tutor/assessments"
          className="btn-primary inline-flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back to Assessments
        </Link>
      </div>
    )
  }

  // Safe access to counts with default values
  const questionCount = assessment._count?.questions || assessment.questions?.length || 0
  const attemptCount = assessment._count?.attempts || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/tutor/assessments"
            className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-brand-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-black text-dark-300 mb-1">{assessment.title}</h1>
            <p className="text-dark-400">{assessment.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(assessment.isPublished)}
          <Link
            href={`/dashboard/tutor/assessments/${assessment.id}/edit`}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Edit size={16} />
            Edit Assessment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{questionCount}</div>
          <div className="text-dark-400 text-sm">Total Questions</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{attemptCount}</div>
          <div className="text-dark-400 text-sm">Total Attempts</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{assessment.timeLimit || '∞'}</div>
          <div className="text-dark-400 text-sm">Time Limit (mins)</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{assessment.passingScore || 0}%</div>
          <div className="text-dark-400 text-sm">Passing Score</div>
        </div>
      </div>

      {/* Assessment Details */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info */}
          <div className="card-dark rounded-2xl p-6">
            <h2 className="text-lg font-bold text-dark-300 mb-4">Course Information</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <BookOpen size={24} className="text-brand-400" />
              </div>
              <div>
                <Link 
                  href={`/dashboard/tutor/courses/${assessment.course.id}`}
                  className="text-lg font-semibold text-dark-300 hover:text-brand-400 transition-colors"
                >
                  {assessment.course.title}
                </Link>
                <p className="text-sm text-dark-400 mt-1">Course ID: {assessment.course.id}</p>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="card-dark rounded-2xl p-6">
            <h2 className="text-lg font-bold text-dark-300 mb-4">Questions ({assessment.questions?.length || 0})</h2>
            <div className="space-y-4">
              {assessment.questions && assessment.questions.length > 0 ? (
                assessment.questions.map((question, index) => (
                  <div key={question.id} className="border border-dark-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-dark-300">Question {index + 1}</h3>
                      <span className="text-xs px-2 py-1 bg-dark-800 rounded-lg text-dark-400">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                    <p className="text-dark-300 text-sm mb-3">{question.text}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-brand-500/10 text-brand-400 rounded-lg">
                        {question.type?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Show options for multiple choice */}
                    {question.type === 'MULTIPLE_CHOICE' && question.options && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-dark-400 mb-1">Options:</p>
                        {question.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 text-sm">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                              question.correctAnswer === optIndex 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-dark-800 text-dark-400'
                            }`}>
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className={question.correctAnswer === optIndex ? 'text-green-500' : 'text-dark-300'}>
                              {opt}
                            </span>
                            {question.correctAnswer === optIndex && (
                              <CheckCircle size={12} className="text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show correct answer for true/false */}
                    {question.type === 'TRUE_FALSE' && (
                      <div className="mt-2">
                        <span className="text-xs text-dark-400">Correct Answer: </span>
                        <span className="text-sm text-green-500 font-medium">
                          {question.correctAnswer ? 'True' : 'False'}
                        </span>
                      </div>
                    )}

                    {/* Show explanation if available */}
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-dark-800/50 rounded-lg">
                        <p className="text-xs text-dark-400 mb-1">Explanation:</p>
                        <p className="text-sm text-dark-300">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-dark-400 py-4">No questions added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Stats */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="card-dark rounded-2xl p-6">
            <h2 className="text-lg font-bold text-dark-300 mb-4">Assessment Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Type</span>
                <span className="text-dark-300 font-medium">{assessment.type}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Time Limit</span>
                <span className="text-dark-300 font-medium">{assessment.timeLimit || 'No limit'} minutes</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Passing Score</span>
                <span className="text-dark-300 font-medium">{assessment.passingScore || 0}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Max Attempts</span>
                <span className="text-dark-300 font-medium">{assessment.maxAttempts}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dark-800">
                <span className="text-dark-400">Shuffle Questions</span>
                <span className={`font-medium ${assessment.shuffleQuestions ? 'text-green-500' : 'text-dark-400'}`}>
                  {assessment.shuffleQuestions ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-dark-400">Show Results</span>
                <span className={`font-medium ${assessment.showResults ? 'text-green-500' : 'text-dark-400'}`}>
                  {assessment.showResults ? 'Immediately' : 'After Review'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-dark rounded-2xl p-6">
            <h2 className="text-lg font-bold text-dark-300 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/dashboard/tutor/assessments/${assessment.id}/edit`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 text-dark-300 transition-colors"
              >
                <Edit size={18} className="text-brand-400" />
                <span>Edit Assessment</span>
              </Link>
              <Link
                href={`/dashboard/tutor/assessments/${assessment.id}/results`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 text-dark-300 transition-colors"
              >
                <Users size={18} className="text-green-400" />
                <span>View Results</span>
              </Link>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 text-dark-300 transition-colors w-full text-left"
              >
                <Printer size={18} className="text-purple-400" />
                <span>Print Assessment</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied to clipboard!')
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-800 text-dark-300 transition-colors w-full text-left"
              >
                <Share2 size={18} className="text-blue-400" />
                <span>Share Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}