'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Clock, Star, PlayCircle, BarChart2, Search, Filter } from 'lucide-react'

interface EnrolledCourse {
  id: string
  course: {
    id: string
    title: string
    description: string
    thumbnail: string
    level: string
    duration?: string
    tutor: {
      id: string
      name: string
      avatar?: string
    }
    _count?: {
      modules: number
      materials: number
    }
  }
  progress: number
  status: string
  completedAt?: string
  createdAt: string
}

export default function StudentCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, in-progress, completed

  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  async function fetchEnrolledCourses() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/student/enrollments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!res.ok) throw new Error('Failed to fetch courses')
      
      const data = await res.json()
      setEnrolledCourses(data.data || [])
    } catch (error) {
      console.error('Error fetching enrolled courses:', error)
      // For demo/development, show mock data
      setEnrolledCourses(mockEnrolledCourses)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for development
  const mockEnrolledCourses: EnrolledCourse[] = [
    {
      id: '1',
      course: {
        id: 'c1',
        title: 'Full-Stack Web Development',
        description: 'Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB to become a full-stack developer.',
        thumbnail: '/images/courses/web-dev.jpg',
        level: 'Beginner',
        duration: '40 hours',
        tutor: {
          id: 't1',
          name: 'Emeka Okafor',
        },
        _count: {
          modules: 12,
          materials: 48,
        },
      },
      progress: 65,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      course: {
        id: 'c2',
        title: 'Data Science & Analytics',
        description: 'Master Python, pandas, NumPy, and machine learning algorithms.',
        thumbnail: '/images/courses/data-science.jpg',
        level: 'Intermediate',
        duration: '35 hours',
        tutor: {
          id: 't2',
          name: 'Amina Hassan',
        },
        _count: {
          modules: 10,
          materials: 42,
        },
      },
      progress: 30,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      course: {
        id: 'c3',
        title: 'UI/UX Design Masterclass',
        description: 'Learn design principles, Figma, user research, and prototyping.',
        thumbnail: '/images/courses/ui-ux.jpg',
        level: 'Beginner',
        duration: '25 hours',
        tutor: {
          id: 't3',
          name: 'Taiwo Adeyemi',
        },
        _count: {
          modules: 8,
          materials: 32,
        },
      },
      progress: 100,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]

  const filteredCourses = enrolledCourses.filter(enrollment => {
    const matchesSearch = enrollment.course.title.toLowerCase().includes(search.toLowerCase()) ||
                         enrollment.course.tutor.name.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'all') return matchesSearch
    if (filter === 'in-progress') return matchesSearch && enrollment.progress < 100
    if (filter === 'completed') return matchesSearch && enrollment.progress === 100
    
    return matchesSearch
  })

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress >= 75) return 'bg-brand-500'
    if (progress >= 50) return 'bg-yellow-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-1">My Courses</h1>
        <p className="text-dark-400">Continue learning where you left off</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 card-dark rounded-2xl p-4 flex items-center gap-2">
          <Search size={16} className="text-dark-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your courses..."
            className="flex-1 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
          />
        </div>
        <div className="card-dark rounded-2xl p-2 flex items-center gap-1">
          <Filter size={16} className="text-dark-400 ml-2" />
          {[
            { value: 'all', label: 'All' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.value 
                  ? 'bg-brand-500 text-white' 
                  : 'text-dark-400 hover:text-dark-300 hover:bg-dark-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading your courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-dark-600" />
          <h3 className="text-xl font-bold text-dark-300 mb-2">No courses yet</h3>
          <p className="text-dark-400 mb-6">You haven't enrolled in any courses yet.</p>
          <Link 
            href="/dashboard/student/explore" 
            className="btn-primary inline-flex items-center gap-2"
          >
            <BookOpen size={16} /> Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCourses.map((enrollment) => (
            <div key={enrollment.id} className="card-dark rounded-2xl overflow-hidden hover:shadow-xl transition-all">
              <div className="flex flex-col md:flex-row">
                {/* Course Thumbnail */}
                <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-dark-800 to-dark-900 relative">
                  {enrollment.course.thumbnail ? (
                    <img 
                      src={enrollment.course.thumbnail} 
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-dark-600" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      enrollment.course.level === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                      enrollment.course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {enrollment.course.level}
                    </span>
                  </div>
                </div>

                {/* Course Details */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-dark-300 mb-1">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-dark-400 text-sm line-clamp-2">
                        {enrollment.course.description}
                      </p>
                    </div>
                    {enrollment.status === 'COMPLETED' && (
                      <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Tutor Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                      {enrollment.course.tutor.name[0]}
                    </div>
                    <span className="text-dark-400 text-sm">
                      {enrollment.course.tutor.name}
                    </span>
                  </div>

                  {/* Course Stats */}
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-dark-400 text-sm">
                      <Clock size={14} className="text-brand-400" />
                      {enrollment.course.duration || 'Self-paced'}
                    </div>
                    <div className="flex items-center gap-1 text-dark-400 text-sm">
                      <BookOpen size={14} className="text-brand-400" />
                      {enrollment.course._count?.modules || 0} modules
                    </div>
                    <div className="flex items-center gap-1 text-dark-400 text-sm">
                      <PlayCircle size={14} className="text-brand-400" />
                      {enrollment.course._count?.materials || 0} lessons
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-dark-400">Progress</span>
                      <span className="text-dark-300 font-medium">{enrollment.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(enrollment.progress)} transition-all duration-300`}
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/student/courses/${enrollment.course.id}`}
                      className="flex-1 btn-primary inline-flex items-center justify-center gap-2 py-3"
                    >
                      {enrollment.progress === 0 ? 'Start Course' : 
                       enrollment.progress === 100 ? 'Review Course' : 'Continue Learning'}
                      <PlayCircle size={16} />
                    </Link>
                    <Link
                      href={`/dashboard/student/courses/${enrollment.course.id}/progress`}
                      className="btn-secondary inline-flex items-center justify-center gap-2 py-3"
                    >
                      <BarChart2 size={16} />
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {enrolledCourses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Total Courses', value: enrolledCourses.length, icon: <BookOpen size={20} /> },
            { label: 'In Progress', value: enrolledCourses.filter(e => e.progress < 100).length, icon: <Clock size={20} /> },
            { label: 'Completed', value: enrolledCourses.filter(e => e.progress === 100).length, icon: <Star size={20} /> },
            { label: 'Avg. Progress', value: Math.round(enrolledCourses.reduce((acc, e) => acc + e.progress, 0) / enrolledCourses.length) + '%', icon: <BarChart2 size={20} /> },
          ].map((stat, i) => (
            <div key={i} className="card-dark rounded-2xl p-4 text-center">
              <div className="text-brand-400 mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-2xl font-bold text-dark-300">{stat.value}</div>
              <div className="text-dark-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}