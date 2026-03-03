'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  PlayCircle, CheckCircle, Lock, ChevronLeft, Clock, 
  BookOpen, User, FileText, Video, Image, File, Award
} from 'lucide-react'

interface Material {
  id: string
  title: string
  description?: string
  type: string
  duration?: number
  isFree: boolean
  completed: boolean
  order: number
}

interface Module {
  id: string
  title: string
  description?: string
  materials: Material[]
  order: number
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  level: string
  tutor: {
    id: string
    name: string
    avatar?: string
    bio?: string
  }
}

export default function StudentCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [progress, setProgress] = useState(0)
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  useEffect(() => {
    fetchCourseDetails()
  }, [courseId])

  async function fetchCourseDetails() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/student/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch course')
      }
      
      setCourse(data.data.course)
      setModules(data.data.modules || [])
      setProgress(data.data.progress || 0)
      
      // Auto-expand first module
      if (data.data.modules && data.data.modules.length > 0) {
        setExpandedModules([data.data.modules[0].id])
      }
    } catch (error: any) {
      console.error('Error fetching course:', error)
      setError(error.message || 'Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <PlayCircle size={18} className="text-brand-400" />
      case 'PDF':
        return <FileText size={18} className="text-red-400" />
      case 'IMAGE':
        return <Image size={18} className="text-blue-400" />
      case 'TEXT':
        return <FileText size={18} className="text-green-400" />
      default:
        return <File size={18} className="text-dark-400" />
    }
  }

  const getTotalMaterials = () => {
    return modules.reduce((acc, module) => acc + module.materials.length, 0)
  }

  const getCompletedMaterials = () => {
    return modules.reduce((acc, module) => 
      acc + module.materials.filter(m => m.completed).length, 0
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading course content...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="card-dark rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-bold text-dark-300 mb-2">Course Not Found</h3>
        <p className="text-dark-400 mb-6">{error || 'The course you\'re looking for doesn\'t exist or you don\'t have access.'}</p>
        <Link 
          href="/dashboard/student/courses" 
          className="btn-primary inline-flex items-center gap-2"
        >
          <ChevronLeft size={16} /> Back to My Courses
        </Link>
      </div>
    )
  }

  const totalMaterials = getTotalMaterials()
  const completedMaterials = getCompletedMaterials()

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/student/courses" 
          className="p-2 rounded-xl hover:bg-dark-800 text-dark-400 hover:text-brand-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="font-display text-3xl font-black text-dark-300 mb-1">{course.title}</h1>
          <p className="text-dark-400 line-clamp-2">{course.description}</p>
        </div>
      </div>

      {/* Course Overview Card */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="md:w-80 h-48 md:h-auto bg-gradient-to-br from-dark-800 to-dark-900 relative">
            {course.thumbnail ? (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={64} className="text-dark-600" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                course.level === 'Beginner' ? 'bg-green-500/10 text-green-500' :
                course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-red-500/10 text-red-500'
              }`}>
                {course.level}
              </span>
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-dark-300 mb-2">About This Course</h3>
                <p className="text-dark-400 text-sm leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Tutor Info */}
            <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg">
                {course.tutor.name[0]}
              </div>
              <div>
                <div className="text-dark-300 text-sm font-medium">Instructor: {course.tutor.name}</div>
                {course.tutor.bio && (
                  <div className="text-dark-400 text-xs line-clamp-1">{course.tutor.bio}</div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-dark-800/30 rounded-xl">
                <div className="text-2xl font-bold text-brand-400">{modules.length}</div>
                <div className="text-dark-400 text-xs">Modules</div>
              </div>
              <div className="text-center p-3 bg-dark-800/30 rounded-xl">
                <div className="text-2xl font-bold text-brand-400">{totalMaterials}</div>
                <div className="text-dark-400 text-xs">Lessons</div>
              </div>
              <div className="text-center p-3 bg-dark-800/30 rounded-xl">
                <div className="text-2xl font-bold text-brand-400">{completedMaterials}</div>
                <div className="text-dark-400 text-xs">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="card-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-dark-300">Your Progress</h2>
          <span className="text-brand-400 font-bold">{progress}% Complete</span>
        </div>
        <div className="w-full h-3 bg-dark-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-dark-400">
          <span>{completedMaterials} of {totalMaterials} lessons completed</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Course Modules */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-dark-300 mb-4">Course Content</h2>
        
        {modules.length === 0 ? (
          <div className="card-dark rounded-2xl p-8 text-center">
            <p className="text-dark-400">No modules have been added to this course yet.</p>
          </div>
        ) : (
          modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.includes(module.id)
            const moduleCompleted = module.materials.every(m => m.completed)
            const moduleProgress = Math.round(
              (module.materials.filter(m => m.completed).length / module.materials.length) * 100
            ) || 0

            return (
              <div key={module.id} className="card-dark rounded-2xl overflow-hidden">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      moduleCompleted ? 'bg-green-500/20 text-green-500' : 'bg-brand-500/20 text-brand-400'
                    }`}>
                      {moduleIndex + 1}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-dark-300 mb-1">
                        {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-dark-400 text-sm">{module.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-dark-500">
                          {module.materials.length} lessons
                        </span>
                        {moduleProgress > 0 && (
                          <span className="text-xs text-brand-400">
                            {moduleProgress}% complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {moduleCompleted && (
                      <CheckCircle size={18} className="text-green-500" />
                    )}
                    <div className={`transform transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}>
                      <ChevronLeft size={18} className="rotate-90 text-dark-400" />
                    </div>
                  </div>
                </button>

                {/* Module Materials */}
                {isExpanded && (
                  <div className="border-t border-dark-800 divide-y divide-dark-800">
                    {module.materials.map((material) => (
                      <Link
                          key={material.id}
                          href={`/dashboard/student/materials/${material.id}`}
                          className="flex items-center gap-4 p-4 hover:bg-dark-800/50 transition-colors"
                        >
                        <div className="flex-shrink-0">
                          {material.completed ? (
                            <CheckCircle size={20} className="text-green-500" />
                          ) : (
                            getMaterialIcon(material.type)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-dark-300 text-sm font-medium">
                              {material.title}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-dark-800 text-dark-400">
                              {material.type}
                            </span>
                          </div>
                          {material.description && (
                            <p className="text-dark-400 text-xs mt-1 line-clamp-1">
                              {material.description}
                            </p>
                          )}
                          {material.duration && (
                            <div className="flex items-center gap-1 mt-1 text-dark-500 text-xs">
                              <Clock size={12} />
                              {material.duration} min
                            </div>
                          )}
                        </div>
                        <button className="btn-secondary text-sm py-2 px-4">
                          {material.completed ? 'Review' : 'Start'}
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Next Steps */}
      {progress === 100 && (
        <div className="card-dark rounded-2xl p-6 bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Award size={24} className="text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-dark-300 mb-1">Congratulations! 🎉</h3>
              <p className="text-dark-400 text-sm mb-3">
                You've completed all the lessons in this course. You can now download your certificate.
              </p>
              <Link
                href={`/dashboard/student/certificates/${courseId}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Award size={16} /> Get Certificate
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}