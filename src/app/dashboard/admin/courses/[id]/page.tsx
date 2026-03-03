'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, BookOpen, Users, DollarSign, Calendar, Clock, 
  CheckCircle, XCircle, FileText, Video, Image as ImageIcon, 
  Download, Edit, Eye, MessageSquare, User, Tag, Globe,
  Award, CheckSquare, AlertCircle
} from 'lucide-react'

export default function AdminCourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview, modules, reviews

  // Helper function to safely parse JSON fields
  const safeParseArray = (data: any): any[] => {
    if (!data) return []
    if (Array.isArray(data)) return data
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        // If it's not valid JSON, treat it as a single-item array
        return data ? [data] : []
      }
    }
    return []
  }

  useEffect(() => {
    fetchCourseDetails()
  }, [params.id])

  async function fetchCourseDetails() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // Fetch course details
      const courseRes = await fetch(`/api/courses/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const courseData = await courseRes.json()
      
      // Parse the JSON fields in the course data
      const parsedCourse = {
        ...courseData.data,
        requirements: safeParseArray(courseData.data?.requirements),
        objectives: safeParseArray(courseData.data?.objectives),
        tags: safeParseArray(courseData.data?.tags),
      }
      setCourse(parsedCourse)

      // Fetch modules and materials
      const modulesRes = await fetch(`/api/courses/${params.id}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const modulesData = await modulesRes.json()
      
      // Parse any JSON fields in modules/materials if needed
      setModules(modulesData.data || [])

    } catch (error) {
      console.error('Failed to fetch course details:', error)
    } finally {
      setLoading(false)
    }
  }

  async function reviewCourse(approved: boolean) {
    setReviewLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/courses/${params.id}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          approved, 
          feedback: approved ? '' : feedback 
        }),
      })
      
      if (res.ok) {
        // Update local state
        setCourse({
          ...course,
          status: approved ? 'PUBLISHED' : 'REJECTED'
        })
        setShowRejectModal(false)
        setFeedback('')
      }
    } catch (error) {
      console.error('Failed to review course:', error)
    } finally {
      setReviewLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: { bg: 'bg-green-500/10', text: 'text-green-500', label: 'Published' },
      PENDING: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: 'Pending Review' },
      REJECTED: { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Rejected' },
      DRAFT: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Draft' },
      ARCHIVED: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Archived' },
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return (
      <span className={`${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2`}>
        {status === 'PUBLISHED' && <CheckCircle size={14} />}
        {status === 'PENDING' && <Clock size={14} />}
        {status === 'REJECTED' && <XCircle size={14} />}
        {config.label}
      </span>
    )
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video size={16} className="text-blue-400" />
      case 'PDF': return <FileText size={16} className="text-red-400" />
      case 'IMAGE': return <ImageIcon size={16} className="text-green-400" />
      default: return <FileText size={16} className="text-dark-400" />
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
          <p className="text-dark-400">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl font-black text-dark-300">Course Not Found</h1>
        </div>
        <div className="card-dark rounded-2xl p-12 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400">The course you're looking for doesn't exist or has been removed.</p>
          <Link href="/dashboard/admin/courses" className="btn-primary inline-flex items-center gap-2 mt-4">
            Back to Courses
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
            <h1 className="font-display text-2xl font-black text-dark-300">{course.title}</h1>
            <p className="text-dark-400 text-sm mt-1">Course ID: {course.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(course.status)}
        </div>
      </div>

      {/* Course Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail & Basic Info */}
          <div className="card-dark rounded-2xl overflow-hidden">
            {course.thumbnail ? (
              <div className="aspect-video w-full bg-dark-900">
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                <BookOpen size={64} className="text-dark-700" />
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-dark-300 mb-4">Course Overview</h2>
              <p className="text-dark-400 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="card-dark rounded-2xl p-6">
            <div className="flex gap-4 border-b border-dark-800 mb-6">
              {['overview', 'modules', 'reviews'].map((tab) => (
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
                {/* Requirements & Objectives */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                      <AlertCircle size={16} /> Requirements
                    </h3>
                    <ul className="space-y-2">
                      {course.requirements && course.requirements.length > 0 ? (
                        course.requirements.map((req: string, i: number) => (
                          <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                            <span className="text-brand-500 mt-1">•</span>
                            {req}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-dark-500 italic">No requirements listed</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                      <CheckSquare size={16} /> What You'll Learn
                    </h3>
                    <ul className="space-y-2">
                      {course.objectives && course.objectives.length > 0 ? (
                        course.objectives.map((obj: string, i: number) => (
                          <li key={i} className="text-sm text-dark-300 flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            {obj}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-dark-500 italic">No objectives listed</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                      <Tag size={16} /> Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-xs px-3 py-1 bg-dark-800 rounded-lg text-dark-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="space-y-4">
                {modules.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={32} className="mx-auto mb-3 text-dark-600" />
                    <p className="text-dark-400">No modules or materials added yet</p>
                  </div>
                ) : (
                  modules.map((module, idx) => (
                    <div key={module.id} className="border border-dark-800 rounded-xl overflow-hidden">
                      <div className="bg-dark-800/50 p-4">
                        <h3 className="font-medium text-dark-300">
                          Module {idx + 1}: {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-dark-500 mt-1">{module.description}</p>
                        )}
                      </div>
                      {module.materials && module.materials.length > 0 && (
                        <div className="divide-y divide-dark-800">
                          {module.materials.map((material: any, midx: number) => (
                            <div key={material.id} className="p-4 flex items-center gap-3">
                              {getMaterialIcon(material.type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-dark-300">{material.title}</p>
                                {material.description && (
                                  <p className="text-xs text-dark-500 mt-1">{material.description}</p>
                                )}
                              </div>
                              {material.isFree && (
                                <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-lg">
                                  Free Preview
                                </span>
                              )}
                              {material.fileUrl && (
                                <a 
                                  href={material.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 text-dark-400 hover:text-brand-500"
                                >
                                  <Eye size={16} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-dark-400 mb-3">Student Reviews</h3>
                {course.reviews && course.reviews.length > 0 ? (
                  course.reviews.map((review: any) => (
                    <div key={review.id} className="border border-dark-800 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center">
                          <User size={16} className="text-dark-400" />
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
                  ))
                ) : (
                  <p className="text-center text-dark-500 py-8">No reviews yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tutor Info */}
          <div className="card-dark rounded-2xl p-6">
            <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
              <User size={16} /> Tutor Information
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {course.tutor?.name?.charAt(0) || 'T'}
              </div>
              <div>
                <p className="font-medium text-dark-300">{course.tutor?.name || 'Unknown'}</p>
                <p className="text-sm text-dark-500">{course.tutor?.email || 'No email provided'}</p>
              </div>
            </div>
            <Link 
              href={`/dashboard/admin/tutors/${course.tutorId}`}
              className="btn-secondary w-full inline-flex items-center justify-center gap-2 text-sm"
            >
              <Eye size={14} /> View Tutor Profile
            </Link>
          </div>

          {/* Course Details */}
          <div className="card-dark rounded-2xl p-6">
            <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
              <BookOpen size={16} /> Course Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-dark-800">
                <span className="text-sm text-dark-500">Price</span>
                <span className="text-sm font-medium text-dark-300">
                  {course.currency} {course.price?.toLocaleString()}
                  {course.isFreemium && (
                    <span className="ml-2 text-xs px-2 py-1 bg-brand-500/10 text-brand-500 rounded-lg">
                      Freemium
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-800">
                <span className="text-sm text-dark-500">Level</span>
                <span className="text-sm font-medium text-dark-300">{course.level}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-800">
                <span className="text-sm text-dark-500">Language</span>
                <span className="text-sm font-medium text-dark-300">{course.language}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-800">
                <span className="text-sm text-dark-500">Category</span>
                <span className="text-sm font-medium text-dark-300">{course.category?.name || 'Uncategorized'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-800">
                <span className="text-sm text-dark-500">Modules</span>
                <span className="text-sm font-medium text-dark-300">{modules.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dark-800">
                <span className="text-sm text-dark-500">Materials</span>
                <span className="text-sm font-medium text-dark-300">
                  {modules.reduce((acc, m) => acc + (m.materials?.length || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-dark-500">Submitted</span>
                <span className="text-sm font-medium text-dark-300">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card-dark rounded-2xl p-6">
            <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
              <Award size={16} /> Performance Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <Users size={20} className="mx-auto mb-2 text-dark-400" />
                <div className="text-xl font-bold text-dark-300">{course._count?.enrollments || 0}</div>
                <div className="text-xs text-dark-500">Students</div>
              </div>
              <div className="text-center p-3 bg-dark-800/50 rounded-xl">
                <MessageSquare size={20} className="mx-auto mb-2 text-dark-400" />
                <div className="text-xl font-bold text-dark-300">{course._count?.reviews || 0}</div>
                <div className="text-xs text-dark-500">Reviews</div>
              </div>
            </div>
          </div>

          {/* Review Actions */}
          {course.status === 'PENDING' && (
            <div className="card-dark rounded-2xl p-6 border-2 border-yellow-500/20">
              <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-yellow-500" /> Review Actions
              </h3>
              
              {/* Approve Button */}
              <button
                onClick={() => reviewCourse(true)}
                disabled={reviewLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {reviewLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Approve Course
                  </>
                )}
              </button>

              {/* Reject Button */}
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={reviewLoading}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject Course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-dark-300 mb-2">Reject Course</h3>
            <p className="text-sm text-dark-400 mb-4">
              Provide feedback to the tutor about why this course is being rejected.
            </p>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback (optional)..."
              rows={4}
              className="w-full bg-dark-900 border border-dark-700 rounded-xl p-3 text-dark-300 text-sm mb-4 focus:outline-none focus:border-brand-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setFeedback('')
                }}
                className="flex-1 btn-secondary py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => reviewCourse(false)}
                disabled={reviewLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {reviewLoading ? 'Rejecting...' : 'Reject Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}