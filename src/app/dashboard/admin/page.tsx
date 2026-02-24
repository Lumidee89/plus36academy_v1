'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, BookOpen, DollarSign, TrendingUp, ShieldAlert, CheckCircle, Clock, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0, totalTutors: 0, totalCourses: 0,
    totalRevenue: 0, activeEnrollments: 0, completedEnrollments: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/users/stats', { headers }),
        fetch('/api/users?limit=5', { headers }),
      ])
      if (statsRes.ok) setStats((await statsRes.json()).data)
      if (usersRes.ok) setRecentUsers((await usersRes.json()).data || [])
    } catch {
      // Demo data
      setStats({ totalStudents: 12847, totalTutors: 96, totalCourses: 284, totalRevenue: 45820000, activeEnrollments: 3421, completedEnrollments: 8234 })
      setRecentUsers(mockUsers)
    }
  }

  const mockUsers = [
    { id: '1', name: 'Chidi Okwu', email: 'chidi@email.com', role: 'STUDENT', isActive: true, createdAt: new Date().toISOString() },
    { id: '2', name: 'Amina Hassan', email: 'amina@email.com', role: 'TUTOR', isActive: true, createdAt: new Date().toISOString() },
    { id: '3', name: 'Seun Adewale', email: 'seun@email.com', role: 'STUDENT', isActive: true, createdAt: new Date().toISOString() },
    { id: '4', name: 'Nkechi Obi', email: 'nkechi@email.com', role: 'TUTOR', isActive: false, createdAt: new Date().toISOString() },
    { id: '5', name: 'David Mensah', email: 'david@email.com', role: 'TUTOR', isActive: true, createdAt: new Date().toISOString() },
  ]

  const recentActivity = [
    { icon: '🎓', text: 'Chidi Okwu enrolled in Full-Stack Web Development', time: '2 min ago' },
    { icon: '💳', text: 'Payment of ₦25,000 received from Aisha Musa', time: '15 min ago' },
    { icon: '📚', text: 'Emeka Okafor published "Advanced React Patterns"', time: '1 hr ago' },
    { icon: '⚠️', text: 'Course "Python for Beginners" flagged for review', time: '2 hr ago' },
    { icon: '✅', text: 'Fatima Bello approved as new instructor', time: '3 hr ago' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">Admin Control Center</h1>
        <p className="text-dark-400">Platform overview and management</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: <Users size={20} />, value: stats.totalStudents.toLocaleString(), label: 'Total Students', change: '+12.3%', color: 'text-blue-400' },
          { icon: <BookOpen size={20} />, value: stats.totalCourses, label: 'Published Courses', change: '+8 this month', color: 'text-green-400' },
          { icon: <DollarSign size={20} />, value: `₦${(stats.totalRevenue / 1000000).toFixed(1)}M`, label: 'Total Revenue', change: '+23.5%', color: 'text-brand-400' },
          { icon: <Users size={20} />, value: stats.totalTutors, label: 'Active Tutors', change: '+5 pending', color: 'text-purple-400' },
          { icon: <TrendingUp size={20} />, value: stats.activeEnrollments.toLocaleString(), label: 'Active Enrollments', change: 'This month', color: 'text-yellow-400' },
          { icon: <CheckCircle size={20} />, value: stats.completedEnrollments.toLocaleString(), label: 'Completions', change: 'All time', color: 'text-teal-400' },
        ].map((s, i) => (
          <div key={i} className="card-dark rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`inline-flex p-3 rounded-xl ${s.color} bg-current/10`}>{s.icon}</div>
              <span className="text-green-400 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-lg">
                {s.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-dark-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="card-dark rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
            <h2 className="font-bold text-white">Recent Users</h2>
            <Link href="/dashboard/admin/users" className="text-brand-400 text-sm flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-dark-800">
            {(recentUsers.length ? recentUsers : mockUsers).map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center gap-4 hover:bg-dark-800/50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold flex-shrink-0">
                  {user.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{user.name}</div>
                  <div className="text-dark-500 text-xs truncate">{user.email}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                    user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                    user.role === 'TUTOR' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>{user.role}</span>
                  <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-dark-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card-dark rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800">
            <h2 className="font-bold text-white">Recent Activity</h2>
          </div>
          <div className="p-6 space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-dark-300 text-sm leading-relaxed">{activity.text}</p>
                  <div className="flex items-center gap-1 mt-1 text-dark-500 text-xs">
                    <Clock size={11} />
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick admin actions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/dashboard/admin/users?pending=true', icon: <ShieldAlert size={20} />, label: 'Pending Tutors', count: 5, color: 'text-yellow-400' },
            { href: '/dashboard/admin/courses', icon: <BookOpen size={20} />, label: 'Review Courses', count: 3, color: 'text-blue-400' },
            { href: '/dashboard/admin/users', icon: <Users size={20} />, label: 'Manage Users', count: null, color: 'text-purple-400' },
            { href: '/dashboard/admin/revenue', icon: <DollarSign size={20} />, label: 'Revenue Report', count: null, color: 'text-green-400' },
          ].map((action, i) => (
            <Link key={i} href={action.href}
              className="card-dark card-hover rounded-2xl p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${action.color} bg-current/10`}>{action.icon}</div>
              <div>
                <div className="text-white text-sm font-medium">{action.label}</div>
                {action.count !== null && (
                  <div className="text-brand-400 text-xs font-bold">{action.count} pending</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
