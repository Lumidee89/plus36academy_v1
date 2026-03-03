'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileQuestion, Plus, Eye, Edit, Users, ChevronRight } from 'lucide-react'

interface Assessment {
  id: string
  title: string
  description: string
  type: 'TEST' | 'EXAM'
  courseId: string
  course: {
    id: string
    title: string
  }
  isPublished: boolean
  _count: {
    questions: number
    attempts: number
  }
}

export default function TutorAssessmentsPage() {
  const [loading, setLoading] = useState(true)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [filter, setFilter] = useState('all') // all, published, draft

  useEffect(() => {
    fetchAssessments()
  }, [])

  async function fetchAssessments() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tutor/assessments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        const data = await res.json()
        setAssessments(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssessments = assessments.filter(a => {
    if (filter === 'published') return a.isPublished
    if (filter === 'draft') return !a.isPublished
    return true
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-dark-300 mb-2">Tests & Exams</h1>
          <p className="text-dark-400">Create and manage course assessments</p>
        </div>
        <Link
          href="/dashboard/tutor/assessments/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus size={16} />
          New Assessment
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'published', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <FileQuestion size={32} className="text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-dark-300 mb-2">No Assessments Yet</h3>
          <p className="text-dark-400 mb-6">Create your first assessment for your students.</p>
          <Link
            href="/dashboard/tutor/assessments/new"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus size={16} />
            Create Assessment
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAssessments.map((assessment) => (
            <div key={assessment.id} className="card-dark rounded-2xl p-6 hover:bg-dark-800/50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-dark-300 mb-1">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-dark-400 mb-2">{assessment.description}</p>
                      <p className="text-xs text-dark-500">
                        Course: {assessment.course.title}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      assessment.isPublished
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {assessment.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-dark-500 text-xs">Type</div>
                      <div className="text-dark-300 text-sm font-medium">{assessment.type}</div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Questions</div>
                      <div className="text-dark-300 text-sm font-medium">{assessment._count.questions}</div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Attempts</div>
                      <div className="text-dark-300 text-sm font-medium flex items-center gap-1">
                        <Users size={12} />
                        {assessment._count.attempts}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <Link
                    href={`/dashboard/tutor/assessments/${assessment.id}`}
                    className="btn-secondary text-sm py-2 px-4 inline-flex items-center justify-center gap-2"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  <Link
                    href={`/dashboard/tutor/assessments/${assessment.id}/edit`}
                    className="btn-primary text-sm py-2 px-4 inline-flex items-center justify-center gap-2"
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/tutor/assessments/${assessment.id}/results`}
                    className="btn-ghost text-sm py-2 px-4 inline-flex items-center justify-center gap-2"
                  >
                    <Users size={14} />
                    Results
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}