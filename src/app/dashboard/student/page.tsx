'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Award, Clock, TrendingUp, Play, ArrowRight, Star } from 'lucide-react'

function StatCard({ icon, value, label, sub, color }: {
  icon: React.ReactNode, value: string | number, label: string, sub?: string, color: string
}) {
  return (
    <div className="card-dark rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${color}`} />
      <div className={`inline-flex p-3 rounded-xl ${color} bg-current/10 mb-4`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-dark-300 text-sm font-medium">{label}</div>
      {sub && <div className="text-dark-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function StudentDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [stats, setStats] = useState({ enrolled: 0, completed: 0, inProgress: 0 })
  const [enrollments, setEnrollments] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchData()
  }, [])

  async function fetchData() {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [statsRes, enrollmentsRes] = await Promise.all([
        fetch('/api/users/stats', { headers }),
        fetch('/api/enrollments', { headers }),
      ])

      if (statsRes.ok) {
        const s = await statsRes.json()
        setStats(s.data)
      }
      if (enrollmentsRes.ok) {
        const e = await enrollmentsRes.json()
        setEnrollments(e.data?.slice(0, 4) || [])
      }
    } catch (e) {
      // Use mock data for demo
      setStats({ enrolled: 3, completed: 1, inProgress: 2 })
      setEnrollments(mockEnrollments)
    }
  }

  const mockEnrollments = [
    {
      id: '1',
      course: { title: 'Full-Stack Web Development', thumbnail: null, tutor: { name: 'Emeka Okafor' } },
      progress: 65,
      status: 'ACTIVE',
    },
    {
      id: '2',
      course: { title: 'Data Science & Analytics', thumbnail: null, tutor: { name: 'Amina Hassan' } },
      progress: 30,
      status: 'ACTIVE',
    },
    {
      id: '3',
      course: { title: 'UI/UX Design Masterclass', thumbnail: null, tutor: { name: 'Taiwo Adeyemi' } },
      progress: 100,
      status: 'COMPLETED',
    },
  ]

  const recommendedCourses = [
    { title: 'Digital Marketing & Growth', tutor: 'Chisom Eze', rating: 4.8, price: 18000 },
    { title: 'Cybersecurity Fundamentals', tutor: 'David Mensah', rating: 4.9, price: 35000 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Learner'} 👋
        </h1>
        <p className="text-dark-400">Keep the momentum going. You're doing great!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen size={20} />}
          value={stats.enrolled}
          label="Enrolled Courses"
          color="text-blue-400"
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          value={stats.inProgress}
          label="In Progress"
          sub="Keep going!"
          color="text-brand-400"
        />
        <StatCard
          icon={<Award size={20} />}
          value={stats.completed}
          label="Completed"
          sub="Certificates earned"
          color="text-green-400"
        />
        <StatCard
          icon={<Clock size={20} />}
          value="24h"
          label="Learning Streak"
          sub="This week"
          color="text-purple-400"
        />
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Continue Learning</h2>
          <Link href="/dashboard/student/courses" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(enrollments.length ? enrollments : mockEnrollments).map((enrollment) => (
            <div key={enrollment.id} className="card-dark card-hover rounded-2xl overflow-hidden">
              <div className="h-36 bg-gradient-to-br from-dark-800 to-dark-900 relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                  <BookOpen size={24} className="text-brand-400" />
                </div>
                {enrollment.status === 'COMPLETED' && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                    ✓ Completed
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
                  {enrollment.course.title}
                </h3>
                <p className="text-dark-500 text-xs mb-3">by {enrollment.course.tutor?.name}</p>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-dark-400">Progress</span>
                    <span className="text-brand-400 font-medium">{enrollment.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${enrollment.progress}%` }}
                    />
                  </div>
                </div>

                <Link href={`/dashboard/student/courses/${enrollment.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium
                    bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white transition-all duration-200">
                  <Play size={14} />
                  {enrollment.status === 'COMPLETED' ? 'Review Course' : 'Continue'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recommended for You</h2>
          <Link href="/dashboard/student/explore" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
            Explore all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {recommendedCourses.map((course, i) => (
            <div key={i} className="card-dark rounded-2xl p-4 flex items-center gap-4 hover:border-brand-500/30 border border-dark-700 transition-all">
              <div className="w-16 h-16 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm mb-1 truncate">{course.title}</h3>
                <p className="text-dark-500 text-xs mb-2">by {course.tutor}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-yellow-400">{course.rating}</span>
                  </div>
                  <span className="text-brand-400 text-sm font-bold">₦{course.price.toLocaleString()}</span>
                </div>
              </div>
              <Link href="/dashboard/student/explore" className="btn-ghost text-xs px-3 py-2 flex-shrink-0">
                Enroll
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
