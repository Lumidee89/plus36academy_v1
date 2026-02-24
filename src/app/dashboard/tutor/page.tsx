'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Users, DollarSign, TrendingUp, Plus, ArrowRight, Eye, Edit, ToggleLeft } from 'lucide-react'

export default function TutorDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [stats, setStats] = useState({ totalCourses: 0, publishedCourses: 0, totalStudents: 0, totalRevenue: 0 })
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchData()
  }, [])

  async function fetchData() {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [statsRes, coursesRes] = await Promise.all([
        fetch('/api/users/stats', { headers }),
        fetch('/api/courses?status=all', { headers }),
      ])
      if (statsRes.ok) setStats((await statsRes.json()).data)
      if (coursesRes.ok) setCourses((await coursesRes.json()).data?.slice(0, 5) || [])
    } catch {
      // Mock data
      setStats({ totalCourses: 4, publishedCourses: 3, totalStudents: 234, totalRevenue: 1250000 })
      setCourses(mockCourses)
    }
  }

  const mockCourses = [
    { id: '1', title: 'Full-Stack Web Development', status: 'PUBLISHED', _count: { enrollments: 147 }, price: 25000 },
    { id: '2', title: 'React Masterclass', status: 'PUBLISHED', _count: { enrollments: 87 }, price: 20000 },
    { id: '3', title: 'Node.js & API Design', status: 'DRAFT', _count: { enrollments: 0 }, price: 22000 },
    { id: '4', title: 'TypeScript Deep Dive', status: 'PUBLISHED', _count: { enrollments: 62 }, price: 18000 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-black text-white mb-1">
            Tutor Hub 🎓
          </h1>
          <p className="text-dark-400">Here's how your courses are performing</p>
        </div>
        <Link href="/dashboard/tutor/courses/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} />
          New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <BookOpen size={20} />, value: stats.totalCourses, label: 'Total Courses', color: 'text-blue-400' },
          { icon: <Eye size={20} />, value: stats.publishedCourses, label: 'Published', color: 'text-green-400' },
          { icon: <Users size={20} />, value: stats.totalStudents, label: 'Total Students', color: 'text-purple-400' },
          { icon: <DollarSign size={20} />, value: `₦${(stats.totalRevenue / 1000).toFixed(0)}K`, label: 'Total Earnings', color: 'text-brand-400' },
        ].map((s, i) => (
          <div key={i} className="card-dark rounded-2xl p-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${s.color.replace('text-', 'bg-')}`} />
            <div className={`inline-flex p-3 rounded-xl mb-4 ${s.color} bg-current/10`}>{s.icon}</div>
            <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-dark-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/dashboard/tutor/courses/new', icon: '📚', label: 'Create Course', desc: 'Start from scratch' },
            { href: '/dashboard/tutor/upload', icon: '📁', label: 'Upload Material', desc: 'PDF, Video, Image' },
            { href: '/dashboard/tutor/students', icon: '👥', label: 'View Students', desc: 'Manage learners' },
            { href: '/dashboard/tutor/earnings', icon: '💰', label: 'Earnings Report', desc: 'Track revenue' },
          ].map((action, i) => (
            <Link key={i} href={action.href}
              className="card-dark card-hover rounded-2xl p-5 text-center group">
              <div className="text-3xl mb-3">{action.icon}</div>
              <div className="font-semibold text-white text-sm mb-1 group-hover:text-brand-400 transition-colors">
                {action.label}
              </div>
              <div className="text-dark-500 text-xs">{action.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Courses table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Your Courses</h2>
          <Link href="/dashboard/tutor/courses" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase tracking-wider">Course</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase tracking-wider">Students</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {(courses.length ? courses : mockCourses).map((course) => (
                  <tr key={course.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white text-sm">{course.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                        course.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400' :
                        course.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-dark-600 text-dark-300'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-dark-300 text-sm">
                      {course._count?.enrollments || 0}
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-medium">
                      ₦{course.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/tutor/courses/${course.id}`}
                          className="p-2 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-all">
                          <Edit size={14} />
                        </Link>
                        <Link href={`/dashboard/tutor/upload?courseId=${course.id}`}
                          className="p-2 rounded-lg text-dark-400 hover:text-green-400 hover:bg-green-500/10 transition-all">
                          <TrendingUp size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
