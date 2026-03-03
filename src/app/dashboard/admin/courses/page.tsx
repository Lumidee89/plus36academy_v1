'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, CheckCircle, XCircle, Eye, Search, Clock, Filter } from 'lucide-react'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL') // PENDING, ALL, PUBLISHED, REJECTED
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [filter])

  async function fetchCourses() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const statusParam = filter !== 'ALL' ? `&status=${filter}` : ''
      const res = await fetch(`/api/courses?${statusParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setCourses(data.data || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function reviewCourse(courseId: string, approved: boolean, feedback?: string) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/courses/${courseId}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ approved, feedback }),
      })
      
      if (res.ok) {
        // Remove from list or update status
        setCourses(courses.filter(c => c.id !== courseId))
      }
    } catch (error) {
      console.error('Failed to review course:', error)
    }
  }

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.tutor?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-1">Course Reviews</h1>
        <p className="text-dark-400">Review and manage course submissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 card-dark rounded-2xl p-4 flex items-center gap-2">
          <Search size={16} className="text-dark-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses or tutors..."
            className="flex-1 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
          />
        </div>
        <div className="card-dark rounded-2xl p-2 flex items-center gap-1">
          <Filter size={16} className="text-dark-400 ml-2" />
          {['ALL', 'PENDING', 'PUBLISHED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f 
                  ? 'bg-brand-500 text-white' 
                  : 'text-dark-400 hover:text-dark-300 hover:bg-dark-800'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Courses Count */}
      {filter === 'PENDING' && (
        <div className="card-dark rounded-2xl p-4 flex items-center gap-3 border-l-4 border-yellow-500">
          <Clock size={20} className="text-yellow-500" />
          <div>
            <span className="font-bold text-yellow-500">{courses.length}</span>
            <span className="text-dark-400 ml-1">course(s) pending review</span>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {loading ? (
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400">No courses found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card-dark rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                {/* Thumbnail */}
                <div className="w-full lg:w-48 h-32 rounded-xl bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <BookOpen size={32} className="text-dark-600" />
                  )}
                </div>

                {/* Course Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-dark-300 text-lg">{course.title}</h3>
                      <p className="text-dark-400 text-sm mt-1 line-clamp-2">{course.description}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap ${
                      course.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                      course.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                      course.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {course.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <div className="text-dark-500 text-xs">Tutor</div>
                      <div className="text-dark-300 text-sm font-medium">{course.tutor?.name || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Price</div>
                      <div className="text-dark-300 text-sm font-medium">{course.currency} {course.price?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Level</div>
                      <div className="text-dark-300 text-sm font-medium">{course.level}</div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Submitted</div>
                      <div className="text-dark-300 text-sm font-medium">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {(course.tags || []).map((tag: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-dark-800 rounded-lg text-dark-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/dashboard/admin/courses/${course.id}`}
                    className="flex-1 lg:flex-none btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2"
                  >
                    <Eye size={16} /> Preview
                  </Link>
                  
                  {course.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => reviewCourse(course.id, true)}
                        className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600 text-white inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => {
                          const feedback = prompt('Enter feedback for rejection (optional):')
                          reviewCourse(course.id, false, feedback || undefined)
                        }}
                        className="flex-1 lg:flex-none bg-red-500 hover:bg-red-600 text-white inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}