'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, Award, Clock, TrendingUp, Play, ArrowRight, Star, Calendar, Target, Flame } from 'lucide-react'

function StatCard({ icon, value, label, sub, color }: {
  icon: React.ReactNode, value: string | number, label: string, sub?: string, color: string
}) {
  return (
    <div className="card-dark rounded-2xl p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${color.replace('text-', 'bg-')}`} />
      <div className={`inline-flex p-3 rounded-xl ${color} bg-current/10 mb-4`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-dark-400 mb-1">{value}</div>
      <div className="text-dark-300 text-sm font-medium">{label}</div>
      {sub && <div className="text-dark-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function StudentDashboard() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    inProgress: 0,
    totalHours: 0,
    certificates: 0
  })
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      // Fetch student stats from the new endpoint
      const statsRes = await fetch('/api/student/stats', { headers })
      if (statsRes.ok) {
        const s = await statsRes.json()
        setStats(s.data)
      }

      // Fetch enrollments with progress
      const enrollmentsRes = await fetch('/api/student/enrollments?limit=10', { headers })
      if (enrollmentsRes.ok) {
        const e = await enrollmentsRes.json()
        setEnrollments(e.data || [])
      }

      // Fetch recommended courses (published courses the student isn't enrolled in)
      const coursesRes = await fetch('/api/courses?status=PUBLISHED&limit=4', { headers })
      if (coursesRes.ok) {
        const c = await coursesRes.json()
        // Filter out courses the student is already enrolled in
        const enrolledIds = new Set(enrollments.map((e: any) => e.courseId))
        const filtered = c.data?.filter((course: any) => !enrolledIds.has(course.id)) || []
        setRecommendedCourses(filtered)
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setStats({ enrolled: 0, inProgress: 0, completed: 0, totalHours: 0, certificates: 0 })
      setEnrollments([])
      setRecommendedCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate actual in-progress courses (enrolled but not completed)
  const inProgressCourses = enrollments.filter(e => e.status === 'ACTIVE' && e.progress < 100)
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED' || e.progress === 100)
  const hasActiveLearning = inProgressCourses.length > 0

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 bg-dark-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-dark rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-dark-800 animate-pulse mb-4" />
              <div className="h-8 w-20 bg-dark-800 animate-pulse mb-2" />
              <div className="h-4 w-24 bg-dark-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-1">
          Welcome back, {user?.name?.split(' ')[0] || 'Learner'} 👋
        </h1>
        <p className="text-dark-400">Keep the momentum going. You're doing great!</p>
      </div>

      {/* Stats - Stretched to fill screen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <StatCard
          icon={<BookOpen size={20} />}
          value={stats.enrolled || 0}
          label="Enrolled Courses"
          sub={`${stats.inProgress || 0} in progress`}
          color="text-blue-400"
        />
        <StatCard
          icon={<Target size={20} />}
          value={stats.inProgress || 0}
          label="In Progress"
          sub={stats.inProgress > 0 ? `${Math.round((stats.inProgress / (stats.enrolled || 1)) * 100)}% of total` : 'No active courses'}
          color="text-brand-400"
        />
        <StatCard
          icon={<Award size={20} />}
          value={stats.completed || 0}
          label="Completed"
          sub={`${stats.certificates || 0} certificates earned`}
          color="text-green-400"
        />
      </div>

      {/* Weekly Activity - Temporarily Hidden */}
      {/* <div className="card-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-300 flex items-center gap-2">
            <Calendar size={18} className="text-brand-400" />
            Weekly Activity
          </h2>
          <div className="flex items-center gap-1 text-sm text-dark-400">
            <span className="w-3 h-3 rounded-sm bg-brand-500" />
            <span className="mr-2">Active</span>
            <span className="w-3 h-3 rounded-sm bg-dark-700" />
            <span>Inactive</span>
          </div>
        </div>
      </div> */}

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-300">Continue Learning</h2>
          {inProgressCourses.length > 0 && (
            <Link href="/dashboard/student/courses" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {!hasActiveLearning ? (
          <div className="card-dark rounded-2xl p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-dark-300 mb-2">No Active Courses</h3>
            <p className="text-dark-400 max-w-md mx-auto mb-6">
              You're not currently learning any course. Browse our catalog and start your learning journey today!
            </p>
            <Link
              href="/dashboard/student/explore"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3"
            >
              <BookOpen size={16} />
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressCourses.slice(0, 3).map((enrollment) => (
              <div key={enrollment.id} className="card-dark card-hover rounded-2xl overflow-hidden">
                <div className="h-36 bg-gradient-to-br from-dark-300 to-dark-900 relative flex items-center justify-center">
                  {enrollment.course?.thumbnail ? (
                    <img 
                      src={enrollment.course.thumbnail} 
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                      <BookOpen size={24} className="text-brand-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-brand-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                    {enrollment.progress}%
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-dark-300 text-sm mb-1 line-clamp-2">
                    {enrollment.course?.title}
                  </h3>
                  <p className="text-dark-500 text-xs mb-3">by {enrollment.course?.tutor?.name || 'Instructor'}</p>

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

                  <Link href={`/dashboard/student/courses/${enrollment.courseId}`}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium
                      bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white transition-all duration-200">
                    <Play size={14} />
                    Continue Learning
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Courses Section (if any) */}
      {completedCourses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark-300">Recently Completed</h2>
            <Link href="/dashboard/student/certificates" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
              View certificates <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedCourses.slice(0, 3).map((enrollment) => (
              <div key={enrollment.id} className="card-dark rounded-2xl overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                <div className="h-24 bg-gradient-to-br from-green-500/10 to-green-600/10 relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Award size={20} className="text-green-400" />
                  </div>
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                    Completed
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-dark-300 text-sm mb-1 line-clamp-2">
                    {enrollment.course?.title}
                  </h3>
                  <p className="text-dark-500 text-xs mb-3">Completed on {new Date(enrollment.completedAt || enrollment.updatedAt).toLocaleDateString()}</p>

                  <Link href={`/dashboard/student/certificates/${enrollment.id}`}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium
                      bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all duration-200">
                    <Award size={14} />
                    View Certificate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-300">Recommended for You</h2>
          <Link href="/dashboard/student/explore" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
            Explore all <ArrowRight size={14} />
          </Link>
        </div>

        {recommendedCourses.length === 0 ? (
          <div className="card-dark rounded-2xl p-8 text-center">
            <p className="text-dark-400">No recommendations available at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedCourses.map((course) => (
              <div key={course.id} className="card-dark rounded-2xl overflow-hidden hover:border-brand-500/30 border border-dark-700 transition-all">
                <div className="h-32 bg-gradient-to-br from-dark-300 to-dark-900 flex items-center justify-center">
                  {course.thumbnail ? (
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen size={24} className="text-dark-500" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-dark-300 text-sm mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-dark-500 text-xs mb-2">by {course.tutor?.name || 'Instructor'}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-yellow-400">{course.avgRating?.toFixed(1) || '4.5'}</span>
                    </div>
                    <span className="text-brand-400 text-sm font-bold">
                      {course.currency || '₦'}{course.price?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <Link 
                    href={`/courses/${course.id}`}
                    className="block w-full text-center py-2 rounded-lg text-sm font-medium
                      bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white transition-all duration-200"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}