'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Users, Search, Mail, Calendar, BookOpen, 
  Download, Filter, ChevronDown, User as UserIcon,
  MessageSquare, Award, Clock, CheckCircle, XCircle,
  ArrowLeft, ArrowRight, Star
} from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  enrolledAt: string
  lastActive?: string
  progress: number
  courseId: string
  courseTitle: string
  completedModules: number
  totalModules: number
  status: 'active' | 'completed' | 'suspended'
  grade?: number
}

export default function TutorStudentsPage() {
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
  })
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [courseFilter, statusFilter, pagination.page])

  async function fetchData() {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch tutor's courses for filter
      const coursesRes = await fetch('/api/courses?status=PUBLISHED', { headers })
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json()
        setCourses(coursesData.data || [])
      }

      // Fetch stats
      const statsRes = await fetch('/api/tutor/students/stats', { headers })
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      await fetchStudents()
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Mock data for demonstration
      setCourses(mockCourses)
      setStats({
        totalStudents: 234,
        activeStudents: 187,
        completedStudents: 47,
        averageProgress: 68,
      })
      setStudents(mockStudents)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStudents() {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '10',
        ...(courseFilter !== 'all' && { courseId: courseFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/tutor/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        const data = await res.json()
        setStudents(data.data || [])
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 1,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch students:', error)
      // Use filtered mock data
      let filtered = mockStudents
      if (courseFilter !== 'all') {
        filtered = filtered.filter(s => s.courseId === courseFilter)
      }
      if (statusFilter !== 'all') {
        filtered = filtered.filter(s => s.status === statusFilter)
      }
      if (search) {
        filtered = filtered.filter(s => 
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.email.toLowerCase().includes(search.toLowerCase())
        )
      }
      setStudents(filtered)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchStudents()
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-green-400'
    if (progress >= 50) return 'text-yellow-400'
    if (progress >= 25) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Active' },
      completed: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Completed' },
      suspended: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Suspended' },
    }
    const statusConfig = config[status as keyof typeof config] || config.active
    return (
      <span className={`${statusConfig.bg} ${statusConfig.text} px-2 py-1 rounded-lg text-xs font-medium`}>
        {statusConfig.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-black text-dark-300">My Students</h1>
        </div>
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading your students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-1">My Students</h1>
        <p className="text-dark-400">Track and manage students enrolled in your courses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.totalStudents}</div>
          <div className="text-dark-400 text-sm">Total Students</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.activeStudents}</div>
          <div className="text-dark-400 text-sm">Active Students</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Award size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.completedStudents}</div>
          <div className="text-dark-400 text-sm">Completed</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{stats.averageProgress}%</div>
          <div className="text-dark-400 text-sm">Avg. Progress</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 card-dark rounded-2xl p-4 flex items-center gap-2">
          <Search size={16} className="text-dark-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name or email..."
            className="flex-1 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
          />
          <button type="submit" className="btn-primary text-sm px-4 py-2">
            Search
          </button>
        </form>

        <div className="flex gap-2">
          <div className="relative">
            <select
              value={courseFilter}
              onChange={e => setCourseFilter(e.target.value)}
              className="card-dark rounded-2xl p-4 pr-10 appearance-none text-sm text-dark-300 cursor-pointer min-w-[180px]"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="card-dark rounded-2xl p-4 pr-10 appearance-none text-sm text-dark-300 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="suspended">Suspended</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          <button className="btn-secondary p-4">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-dark-600" />
          </div>
          <h3 className="text-xl font-bold text-dark-300 mb-2">No Students Yet</h3>
          <p className="text-dark-400 max-w-md mx-auto mb-6">
            You don't have any students enrolled in your courses yet. Once students enroll, they'll appear here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/tutor/courses"
              className="btn-primary inline-flex items-center gap-2"
            >
              <BookOpen size={16} />
              View Your Courses
            </Link>
            <Link
              href="/dashboard/tutor/upload"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Download size={16} />
              Add More Materials
            </Link>
          </div>
          
          {/* Tips for getting students */}
          {/* <div className="mt-8 pt-6 border-t border-dark-800">
            <h4 className="text-sm font-medium text-dark-400 mb-3">Tips to attract more students:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="text-sm font-medium text-dark-300">Complete your courses</p>
                  <p className="text-xs text-dark-500">Add all modules and materials</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-sm font-medium text-dark-300">Get reviews</p>
                  <p className="text-xs text-dark-500">Encourage students to leave feedback</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📢</span>
                <div>
                  <p className="text-sm font-medium text-dark-300">Promote your courses</p>
                  <p className="text-xs text-dark-500">Share on social media</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      ) : (
        <>
          {/* Students Grid/Table */}
          <div className="card-dark rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Student</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Course</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Enrolled</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Progress</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Status</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Last Active</th>
                    <th className="text-right px-6 py-4 text-dark-400 text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {student.name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-dark-300 text-sm">{student.name}</div>
                            <div className="text-dark-500 text-xs">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-dark-300 text-sm">{student.courseTitle}</div>
                        <div className="text-dark-500 text-xs">{student.completedModules}/{student.totalModules} modules</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-dark-400 text-sm">
                          <Calendar size={12} />
                          {new Date(student.enrolledAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                student.progress >= 75 ? 'bg-green-500' :
                                student.progress >= 50 ? 'bg-yellow-500' :
                                student.progress >= 25 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${getProgressColor(student.progress)}`}>
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-dark-400 text-sm">
                          <Clock size={12} />
                          {student.lastActive ? new Date(student.lastActive).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/tutor/students/${student.id}`}
                            className="p-2 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          >
                            <Users size={16} />
                          </Link>
                          <Link
                            href={`/dashboard/tutor/messages?student=${student.id}`}
                            className="p-2 rounded-lg text-dark-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          >
                            <MessageSquare size={16} />
                          </Link>
                          <Link
                            href={`/dashboard/tutor/students/${student.id}/progress`}
                            className="p-2 rounded-lg text-dark-400 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          >
                            <Award size={16} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-dark-800 flex items-center justify-between">
                <div className="text-sm text-dark-500">
                  Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} students
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary px-4 py-2 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary px-4 py-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="flex justify-end">
            <button className="btn-secondary inline-flex items-center gap-2 text-sm">
              <Download size={14} />
              Export Student List
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Mock data
const mockCourses = [
  { id: 'c1', title: 'Full-Stack Web Development' },
  { id: 'c2', title: 'React Masterclass' },
  { id: 'c3', title: 'Python for Beginners' },
  { id: 'c4', title: 'UI/UX Design Fundamentals' },
]

const mockStudents: Student[] = [
  {
    id: 's1',
    name: 'Chidi Okwu',
    email: 'chidi@example.com',
    enrolledAt: '2024-01-15',
    lastActive: '2024-02-10',
    progress: 75,
    courseId: 'c1',
    courseTitle: 'Full-Stack Web Development',
    completedModules: 6,
    totalModules: 8,
    status: 'active',
  },
  {
    id: 's2',
    name: 'Amina Hassan',
    email: 'amina@example.com',
    enrolledAt: '2024-01-20',
    lastActive: '2024-02-09',
    progress: 45,
    courseId: 'c2',
    courseTitle: 'React Masterclass',
    completedModules: 3,
    totalModules: 7,
    status: 'active',
  },
  {
    id: 's3',
    name: 'Seun Adewale',
    email: 'seun@example.com',
    enrolledAt: '2023-12-10',
    lastActive: '2024-02-08',
    progress: 100,
    courseId: 'c3',
    courseTitle: 'Python for Beginners',
    completedModules: 5,
    totalModules: 5,
    status: 'completed',
  },
  {
    id: 's4',
    name: 'Nkechi Obi',
    email: 'nkechi@example.com',
    enrolledAt: '2024-01-05',
    lastActive: '2024-01-28',
    progress: 20,
    courseId: 'c4',
    courseTitle: 'UI/UX Design Fundamentals',
    completedModules: 2,
    totalModules: 6,
    status: 'active',
  },
  {
    id: 's5',
    name: 'David Mensah',
    email: 'david@example.com',
    enrolledAt: '2023-12-01',
    lastActive: '2023-12-15',
    progress: 30,
    courseId: 'c1',
    courseTitle: 'Full-Stack Web Development',
    completedModules: 2,
    totalModules: 8,
    status: 'suspended',
  },
]