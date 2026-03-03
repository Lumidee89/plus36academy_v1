'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, BookOpen, Users, Mail, Phone, Calendar,
  CheckCircle, XCircle, Clock, Award, Star, MessageSquare,
  DollarSign, Eye, Edit, User as UserIcon, MapPin, Globe
} from 'lucide-react'

export default function AdminTutorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [tutor, setTutor] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, courses, reviews

  useEffect(() => {
    fetchTutorDetails()
  }, [params.id])

  async function fetchTutorDetails() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch tutor details
      const tutorRes = await fetch(`/api/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const tutorData = await tutorRes.json()
      setTutor(tutorData.data)

      // Fetch tutor's courses
      const coursesRes = await fetch(`/api/courses?tutorId=${params.id}&status=all`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const coursesData = await coursesRes.json()
      setCourses(coursesData.data || [])

    } catch (error) {
      console.error('Failed to fetch tutor details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Active' },
      SUSPENDED: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Suspended' },
      PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || { bg: 'bg-gray-500/10', text: 'text-gray-500', label: status }
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`}>
        {config.label}
      </span>
    )
  }

  const getCourseStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Published' },
      PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending' },
      REJECTED: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rejected' },
      DRAFT: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Draft' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return (
      <span className={`${config.bg} ${config.text} px-2 py-1 rounded-lg text-xs font-medium`}>
        {config.label}
      </span>
    )
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
          <p className="text-dark-400">Loading tutor details...</p>
        </div>
      </div>
    )
  }

  if (!tutor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl font-black text-dark-300">Tutor Not Found</h1>
        </div>
        <div className="card-dark rounded-2xl p-12 text-center">
          <UserIcon size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400">The tutor you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/admin/tutors" className="btn-primary inline-flex items-center gap-2 mt-4">
            Back to Tutors
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
            <h1 className="font-display text-2xl font-black text-dark-300">{tutor.name}</h1>
            <p className="text-dark-400 text-sm mt-1">Tutor Profile</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(tutor.status || 'ACTIVE')}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card-dark rounded-2xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white font-bold text-3xl">
              {tutor.name?.charAt(0) || 'T'}
            </div>
            <h2 className="text-xl font-bold text-dark-300 mb-1">{tutor.name}</h2>
            <p className="text-sm text-dark-500 mb-4">Member since {new Date(tutor.createdAt).toLocaleDateString()}</p>
            
            <div className="flex justify-center gap-2 mb-4">
              <span className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-xs font-medium">
                Tutor
              </span>
              {tutor.isVerified && (
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </span>
              )}
            </div>

            {tutor.bio && (
              <p className="text-sm text-dark-400 text-left">{tutor.bio}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="card-dark rounded-2xl p-6">
            <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
              <Mail size={16} /> Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-dark-500" />
                <a href={`mailto:${tutor.email}`} className="text-dark-300 hover:text-brand-500">
                  {tutor.email}
                </a>
              </div>
              {tutor.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-dark-500" />
                  <a href={`tel:${tutor.phone}`} className="text-dark-300 hover:text-brand-500">
                    {tutor.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="card-dark rounded-2xl p-6">
            <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
              <Award size={16} /> Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <BookOpen size={20} className="mx-auto mb-2 text-dark-400" />
                <div className="text-xl font-bold text-dark-300">{courses.length}</div>
                <div className="text-xs text-dark-500">Courses</div>
              </div>
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <Users size={20} className="mx-auto mb-2 text-dark-400" />
                <div className="text-xl font-bold text-dark-300">
                  {courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0)}
                </div>
                <div className="text-xs text-dark-500">Students</div>
              </div>
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <Star size={20} className="mx-auto mb-2 text-dark-400" />
                <div className="text-xl font-bold text-dark-300">
                  {courses.length > 0 
                    ? (courses.reduce((acc, c) => acc + (c.avgRating || 0), 0) / courses.length).toFixed(1)
                    : '0.0'}
                </div>
                <div className="text-xs text-dark-500">Avg Rating</div>
              </div>
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <DollarSign size={20} className="mx-auto mb-2 text-dark-400" />
                <div className="text-xl font-bold text-dark-300">
                  ₦{courses.reduce((acc, c) => acc + (c.totalRevenue || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-dark-500">Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tabs Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="card-dark rounded-2xl p-6">
            <div className="flex gap-4 border-b border-dark-800 mb-6">
              {['overview', 'courses', 'reviews'].map((tab) => (
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
                {/* Account Details */}
                <div>
                  <h3 className="text-sm font-medium text-dark-400 mb-3">Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-800/50 rounded-xl p-4">
                      <div className="text-dark-500 text-xs mb-1">User ID</div>
                      <div className="text-dark-300 text-sm font-mono">{tutor.id}</div>
                    </div>
                    <div className="bg-dark-800/50 rounded-xl p-4">
                      <div className="text-dark-500 text-xs mb-1">Member Since</div>
                      <div className="text-dark-300 text-sm">
                        {new Date(tutor.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="bg-dark-800/50 rounded-xl p-4">
                      <div className="text-dark-500 text-xs mb-1">Last Updated</div>
                      <div className="text-dark-300 text-sm">
                        {new Date(tutor.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="bg-dark-800/50 rounded-xl p-4">
                      <div className="text-dark-500 text-xs mb-1">Verification Status</div>
                      <div className="text-dark-300 text-sm">
                        {tutor.isVerified ? 'Verified' : 'Not Verified'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div>
                  <h3 className="text-sm font-medium text-dark-400 mb-3">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-dark-800/30 rounded-xl">
                      <Clock size={16} className="text-dark-500" />
                      <span className="text-sm text-dark-400">
                        Last course created: {courses.length > 0 
                          ? new Date(courses[0].createdAt).toLocaleDateString()
                          : 'No courses yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-dark-400">Courses ({courses.length})</h3>
                  <select className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-1 text-sm text-dark-300">
                    <option value="all">All Status</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="PENDING">Pending</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen size={32} className="mx-auto mb-3 text-dark-600" />
                    <p className="text-dark-400">This tutor hasn't created any courses yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/dashboard/admin/courses/${course.id}`}
                        className="block bg-dark-800/30 hover:bg-dark-800/50 rounded-xl p-4 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {course.thumbnail ? (
                            <img 
                              src={course.thumbnail} 
                              alt={course.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-dark-800 flex items-center justify-center">
                              <BookOpen size={24} className="text-dark-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-dark-300">{course.title}</h4>
                                <p className="text-sm text-dark-500 mt-1 line-clamp-2">{course.description}</p>
                              </div>
                              {getCourseStatusBadge(course.status)}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-dark-500">
                              <span className="flex items-center gap-1">
                                <Users size={12} /> {course._count?.enrollments || 0} students
                              </span>
                              <span className="flex items-center gap-1">
                                <Star size={12} /> {course.avgRating?.toFixed(1) || '0.0'}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={12} /> {course.currency} {course.price?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-dark-400">Recent Reviews</h3>
                {courses.flatMap(c => c.reviews || []).length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare size={32} className="mx-auto mb-3 text-dark-600" />
                    <p className="text-dark-400">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.flatMap(c => c.reviews || []).map((review: any) => (
                      <div key={review.id} className="bg-dark-800/30 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center">
                            <UserIcon size={14} className="text-dark-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-dark-300">{review.user?.name || 'Anonymous'}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-dark-600'}>★</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-dark-500 ml-auto">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-dark-400 mt-2">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}