'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, ArrowRight, Search, RefreshCw, Image as ImageIcon } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  price: number
  currency: string
  status?: string
  slug?: string
  thumbnail?: string
  createdAt?: string
  tutor?: { id: string; name: string }
  _count?: { enrollments: number; reviews: number }
  avgRating?: number
}

export default function TutorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  async function fetchCourses() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching courses with token:', token ? 'Present' : 'Missing')
      
      const res = await fetch(`/api/courses`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      
      console.log('Response status:', res.status)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch courses (${res.status})`)
      }
      
      const responseData = await res.json()
      console.log('Response data:', responseData)
      
      // Handle different response structures
      let coursesData = []
      if (responseData.data && Array.isArray(responseData.data)) {
        coursesData = responseData.data
      } else if (Array.isArray(responseData)) {
        coursesData = responseData
      } else if (responseData.courses && Array.isArray(responseData.courses)) {
        coursesData = responseData.courses
      }
      
      console.log('Processed courses:', coursesData)
      
      if (coursesData.length === 0) {
        console.log('No courses found for this tutor')
      }
      
      setCourses(coursesData)
    } catch (e: any) {
      console.error('Fetch error:', e)
      setError(e.message || 'Failed to load courses')
      // Don't set demo data on error - show empty state
      setCourses([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  async function deleteCourse(id: string) {
    if (!confirm('Delete this course? This action cannot be undone.')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete course')
      setCourses(prev => prev.filter(c => c.id !== id))
    } catch (e: any) {
      alert(e.message || 'Delete failed')
    }
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCourses()
  }

  const getStatusColor = (status: string = 'DRAFT') => {
    const colors = {
      PUBLISHED: 'bg-green-500/10 text-green-600',
      PENDING: 'bg-yellow-500/10 text-yellow-600',
      DRAFT: 'bg-gray-500/10 text-gray-600',
      REJECTED: 'bg-red-500/10 text-red-600',
      ARCHIVED: 'bg-gray-500/10 text-gray-600'
    }
    return colors[status as keyof typeof colors] || colors.DRAFT
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900">My Courses</h1>
          <p className="text-dark-400 text-sm">Create, edit, and manage your courses</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link href="/dashboard/tutor/courses/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> New Course
          </Link>
        </div>
      </div>

      <div className="card-dark rounded-2xl p-4 flex items-center gap-2">
        <Search size={16} className="text-dark-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search your courses..."
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-500"
        />
      </div>

      {loading ? (
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-dark-400">Loading your courses...</p>
        </div>
      ) : error ? (
        <div className="card-dark rounded-2xl p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchCourses}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          {courses.length === 0 ? (
            <>
              <p className="text-dark-400 mb-4">You haven't created any courses yet.</p>
              <Link href="/dashboard/tutor/courses/new" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Create your first course
              </Link>
            </>
          ) : (
            <p className="text-dark-400">No courses match your search.</p>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <div key={course.id} className="card-dark card-hover rounded-2xl overflow-hidden flex flex-col">
              {/* Thumbnail */}
              <Link href={`/dashboard/tutor/courses/${course.id}`} className="block group">
                <div className="aspect-video w-full bg-gradient-to-br from-dark-800 to-dark-900 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <ImageIcon size={32} className="text-dark-600 mb-2" />
                      <span className="text-xs text-dark-500">No thumbnail</span>
                    </div>
                  )}
                  
                  {/* Status Badge Overlay */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getStatusColor(course.status)}`}>
                      {course.status || 'DRAFT'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <Link href={`/dashboard/tutor/courses/${course.id}`} className="block group">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-dark-500 text-xs mt-1 line-clamp-2 mb-3">
                    {course.description}
                  </p>
                </Link>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="text-brand-600 font-bold">
                    {course.currency || 'NGN'} {Number(course.price || 0).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-3 text-dark-400">
                    <span className="flex items-center gap-1">
                      <span className="text-xs">👥</span> {course._count?.enrollments || 0}
                    </span>
                    {course.avgRating ? (
                      <span className="flex items-center gap-1">
                        <span className="text-xs">⭐</span> {course.avgRating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-dark-700 mt-auto">
                  <Link 
                    href={`/dashboard/tutor/courses/${course.id}`} 
                    className="flex-1 btn-secondary inline-flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                  <button 
                    onClick={() => deleteCourse(course.id)} 
                    className="flex-1 inline-flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/30"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {courses.length > 0 && (
        <div className="text-right">
          <Link href="/dashboard/tutor" className="text-brand-600 text-sm inline-flex items-center gap-1">
            Back to dashboard <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}