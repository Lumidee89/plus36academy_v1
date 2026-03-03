'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Mail, Phone, Calendar, User as UserIcon,
  BookOpen, Users, DollarSign, Star, Clock, CheckCircle,
  XCircle, Shield, Award, Edit2, MessageSquare
} from 'lucide-react'

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchUserDetails()
  }, [params.id])

  async function fetchUserDetails() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch user')
      setUser(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </button>
          <div className="h-8 w-48 bg-dark-800 rounded-lg animate-pulse" />
        </div>
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl font-black text-dark-300">User Not Found</h1>
        </div>
        <div className="card-dark rounded-2xl p-12 text-center">
          <UserIcon size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400 mb-4">{error || 'User not found'}</p>
          <Link href="/dashboard/admin/users" className="btn-primary">
            Back to Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl font-black text-dark-300">{user.name}</h1>
            <p className="text-dark-400 text-sm mt-1">User Profile • Joined {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <Link
          href={`/dashboard/admin/users/${user.id}/edit`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Edit2 size={16} /> Edit User
        </Link>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {user.name[0]}
            </div>
            <div>
              <div className="text-sm text-dark-500 mb-1">User ID</div>
              <div className="text-dark-300 text-sm font-mono">{user.id.slice(0, 8)}...</div>
            </div>
          </div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail size={16} className="text-dark-400" />
            <span className="text-sm text-dark-400">Email</span>
          </div>
          <a href={`mailto:${user.email}`} className="text-dark-300 hover:text-brand-400">
            {user.email}
          </a>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Phone size={16} className="text-dark-400" />
            <span className="text-sm text-dark-400">Phone</span>
          </div>
          {user.phone ? (
            <a href={`tel:${user.phone}`} className="text-dark-300 hover:text-brand-400">
              {user.phone}
            </a>
          ) : (
            <span className="text-dark-500">Not provided</span>
          )}
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={16} className="text-dark-400" />
            <span className="text-sm text-dark-400">Role & Status</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
              user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
              user.role === 'TUTOR' ? 'bg-purple-500/10 text-purple-400' :
              'bg-blue-500/10 text-blue-400'
            }`}>
              {user.role}
            </span>
            <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-dark-300">{user.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-dark rounded-2xl p-6">
        <div className="flex gap-4 border-b border-dark-800 mb-6">
          {['overview', 'courses', 'enrollments', 'payments', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab 
                  ? 'text-brand-500 border-b-2 border-brand-500' 
                  : 'text-dark-400 hover:text-dark-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {user.bio && (
              <div>
                <h3 className="text-sm font-medium text-dark-400 mb-2">Bio</h3>
                <p className="text-dark-300 text-sm">{user.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {user.role === 'TUTOR' && (
                <>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <BookOpen size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">{user.totalCourses || 0}</div>
                    <div className="text-xs text-dark-500">Courses</div>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <Users size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">{user.totalStudents || 0}</div>
                    <div className="text-xs text-dark-500">Students</div>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <Star size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">{user.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-dark-500">Avg Rating</div>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <DollarSign size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">₦{(user.totalRevenue || 0).toLocaleString()}</div>
                    <div className="text-xs text-dark-500">Revenue</div>
                  </div>
                </>
              )}

              {user.role === 'STUDENT' && (
                <>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <BookOpen size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">{user.totalEnrollments || 0}</div>
                    <div className="text-xs text-dark-500">Enrollments</div>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <Award size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">{user.completedCourses || 0}</div>
                    <div className="text-xs text-dark-500">Completed</div>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <Clock size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">{user.inProgressCourses || 0}</div>
                    <div className="text-xs text-dark-500">In Progress</div>
                  </div>
                  <div className="bg-dark-800/50 rounded-xl p-4 text-center">
                    <DollarSign size={20} className="mx-auto mb-2 text-dark-400" />
                    <div className="text-xl font-bold text-dark-300">₦{(user.totalSpent || 0).toLocaleString()}</div>
                    <div className="text-xs text-dark-500">Total Spent</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && user.role === 'TUTOR' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-400">Courses ({user.taughtCourses?.length || 0})</h3>
            {user.taughtCourses?.length === 0 ? (
              <p className="text-dark-500 text-center py-8">No courses yet</p>
            ) : (
              <div className="space-y-3">
                {user.taughtCourses?.map((course: any) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/admin/courses/${course.id}`}
                    className="block bg-dark-800/30 hover:bg-dark-800/50 rounded-xl p-4 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-dark-300">{course.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                          <span>Price: {course.currency} {course.price}</span>
                          <span>•</span>
                          <span>Students: {course._count?.enrollments || 0}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        course.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-400' :
                        course.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'enrollments' && user.role === 'STUDENT' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-dark-400">Enrollments ({user.enrollments?.length || 0})</h3>
            {user.enrollments?.length === 0 ? (
              <p className="text-dark-500 text-center py-8">No enrollments yet</p>
            ) : (
              <div className="space-y-3">
                {user.enrollments?.map((enrollment: any) => (
                  <div key={enrollment.id} className="bg-dark-800/30 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-dark-300">{enrollment.course?.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-dark-500">
                          <span>Progress: {enrollment.progress}%</span>
                          <span>•</span>
                          <span>Enrolled: {new Date(enrollment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        enrollment.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
                        enrollment.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {enrollment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}