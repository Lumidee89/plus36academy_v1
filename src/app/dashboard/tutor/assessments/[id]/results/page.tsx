'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, Users, Award, TrendingUp, 
  Download, Filter, Search, Eye, CheckCircle, XCircle,
  Clock, Calendar, BarChart3, PieChart, AlertCircle
} from 'lucide-react'

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
  answers: any
}

interface Assessment {
  id: string
  title: string
  description: string
  type: 'TEST' | 'EXAM'
  passingScore: number
  questions: any[]
  _count: {
    attempts: number
  }
}

export default function AssessmentResultsPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, passed, failed

  useEffect(() => {
    fetchResults()
  }, [assessmentId])

  async function fetchResults() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/tutor/assessments/${assessmentId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch results')

      setAssessment(data.data.assessment)
      setAttempts(data.data.attempts || [])
    } catch (error: any) {
      console.error('Error fetching results:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateStats = () => {
    if (attempts.length === 0) {
      return {
        total: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
        highestScore: 0,
      }
    }

    const passed = attempts.filter(a => a.passed).length
    const scores = attempts.map(a => a.score)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length

    return {
      total: attempts.length,
      passed,
      failed: attempts.length - passed,
      averageScore: Math.round(average),
      highestScore: Math.max(...scores),
    }
  }

  const stats = calculateStats()

  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = attempt.student.name.toLowerCase().includes(search.toLowerCase()) ||
                         attempt.student.email.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'passed') return matchesSearch && attempt.passed
    if (filter === 'failed') return matchesSearch && !attempt.passed
    
    return matchesSearch
  })

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
        <h3 className="text-xl font-bold text-dark-300 mb-2">Results Not Found</h3>
        <p className="text-dark-400 mb-6">{error || 'Unable to load results'}</p>
        <Link
          href={`/dashboard/tutor/assessments/${assessmentId}`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Back to Assessment
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/tutor/assessments/${assessmentId}`}
            className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-brand-400 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-black text-dark-300 mb-1">Assessment Results</h1>
            <p className="text-dark-400">{assessment.title}</p>
          </div>
        </div>
        <button
          onClick={() => {
            // Export functionality
            const csv = [
              ['Student', 'Email', 'Score', 'Passed', 'Time Spent', 'Submitted At'],
              ...attempts.map(a => [
                a.student.name,
                a.student.email,
                `${a.score}%`,
                a.passed ? 'Yes' : 'No',
                formatTime(a.timeSpent),
                formatDate(a.submittedAt),
              ])
            ].map(row => row.join(',')).join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${assessment.title}-results.csv`
            a.click()
          }}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Download size={16} />
          Export Results
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.total}</div>
          <div className="text-dark-400 text-sm">Total Attempts</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.passed}</div>
          <div className="text-dark-400 text-sm">Passed</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
              <XCircle size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.failed}</div>
          <div className="text-dark-400 text-sm">Failed</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.averageScore}%</div>
          <div className="text-dark-400 text-sm">Average Score</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 card-dark rounded-2xl p-4 flex items-center gap-2">
          <Search size={16} className="text-dark-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students..."
            className="flex-1 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="card-dark rounded-2xl p-4 text-sm text-dark-300 outline-none min-w-[140px]"
        >
          <option value="all">All Results</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Results List */}
      {filteredAttempts.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-dark-600" />
          <h3 className="text-xl font-bold text-dark-300 mb-2">No Results Yet</h3>
          <p className="text-dark-400">
            {search || filter !== 'all' 
              ? 'No results match your search criteria.'
              : 'No students have taken this assessment yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => (
            <div key={attempt.id} className="card-dark rounded-2xl p-6 hover:bg-dark-800/50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Student Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg">
                    {attempt.student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-300">{attempt.student.name}</h3>
                    <p className="text-xs text-dark-400">{attempt.student.email}</p>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      attempt.passed ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {attempt.score}%
                    </div>
                    <div className="text-xs text-dark-400">Score</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-medium text-dark-300">
                      {formatTime(attempt.timeSpent)}
                    </div>
                    <div className="text-xs text-dark-400">Time Spent</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-dark-300">
                      {formatDate(attempt.submittedAt)}
                    </div>
                    <div className="text-xs text-dark-400">Submitted</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/tutor/assessments/${assessmentId}/results/${attempt.id}`}
                    className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2"
                  >
                    <Eye size={14} />
                    View Details
                  </Link>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-2">
                {attempt.passed ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-lg">
                    <CheckCircle size={12} />
                    Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded-lg">
                    <XCircle size={12} />
                    Failed
                  </span>
                )}
                {attempt.score >= assessment.passingScore ? (
                  <span className="text-xs text-green-500">
                    ✓ Met passing score ({assessment.passingScore}%)
                  </span>
                ) : (
                  <span className="text-xs text-red-500">
                    ✗ Below passing score ({assessment.passingScore}%)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}