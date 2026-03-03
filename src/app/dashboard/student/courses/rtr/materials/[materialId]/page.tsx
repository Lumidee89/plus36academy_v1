'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, ChevronRight, CheckCircle, PlayCircle, 
  FileText, Image as ImageIcon, File, Download, Check,
  ArrowLeft, BookOpen, Maximize2, Minimize2, Volume2, VolumeX
} from 'lucide-react'

interface Material {
  id: string
  title: string
  description?: string
  type: string
  content?: string
  fileUrl?: string
  videoUrl?: string
  duration?: number
  isFree: boolean
}

interface Module {
  id: string
  title: string
  courseId: string
}

interface Course {
  id: string
  title: string
  tutor: {
    id: string
    name: string
    avatar?: string
  }
}

interface Navigation {
  prev?: { id: string; title: string }
  next?: { id: string; title: string }
}

export default function StudentMaterialPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const materialId = params.materialId as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [material, setMaterial] = useState<Material | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [navigation, setNavigation] = useState<Navigation>({})
  const [completed, setCompleted] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMaterial()
  }, [materialId])

  async function fetchMaterial() {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/student/materials/${materialId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch material')
      }
      
      setMaterial(data.data.material)
      setModule(data.data.module)
      setCourse(data.data.course)
      setNavigation(data.data.navigation)
      setCompleted(data.data.progress.completed)
      setWatchTime(data.data.progress.watchTime || 0)
    } catch (error: any) {
      console.error('Error fetching material:', error)
      setError(error.message || 'Failed to load material')
    } finally {
      setLoading(false)
    }
  }

  async function markAsComplete() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/student/materials/${materialId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: 'complete' }),
      })
      
      if (!res.ok) throw new Error('Failed to mark as complete')
      
      setCompleted(true)
      
      // If there's a next material, ask if they want to continue
      if (navigation.next) {
        if (confirm('Lesson completed! Go to next lesson?')) {
          router.push(`/dashboard/student/courses/${courseId}/materials/${navigation.next.id}`)
        }
      } else {
        // No next material, go back to course page
        router.push(`/dashboard/student/courses/${courseId}`)
      }
    } catch (error) {
      console.error('Error marking as complete:', error)
    }
  }

  const updateWatchTime = async (time: number) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/student/materials/${materialId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ action: 'update_watch_time', watchTime: time }),
      })
    } catch (error) {
      console.error('Error updating watch time:', error)
    }
  }

  // Video time tracking
  useEffect(() => {
    if (material?.type === 'VIDEO' && videoRef.current && !completed) {
      const video = videoRef.current
      
      const handleTimeUpdate = () => {
        const currentTime = Math.floor(video.currentTime)
        if (currentTime > 0 && currentTime % 30 === 0) { // Update every 30 seconds
          updateWatchTime(currentTime)
        }
      }

      const handleEnded = () => {
        markAsComplete()
      }

      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('ended', handleEnded)

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('ended', handleEnded)
      }
    }
  }, [material, completed])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      contentRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-3 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (error || !material || !module || !course) {
    return (
      <div className="card-dark rounded-2xl p-12 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-bold text-dark-300 mb-2">Lesson Not Found</h3>
        <p className="text-dark-400 mb-6">{error || 'The lesson you\'re looking for doesn\'t exist.'}</p>
        <Link 
          href={`/dashboard/student/courses/${courseId}`}
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Course
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/student/courses/${courseId}`}
          className="flex items-center gap-2 text-dark-400 hover:text-brand-400 transition-colors"
        >
          <ChevronLeft size={18} />
          <span>Back to Course</span>
        </Link>
        <div className="text-sm text-dark-400">
          <span className="text-brand-400">{course.title}</span> • {module.title}
        </div>
      </div>

      {/* Material Title */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-2">{material.title}</h1>
        {material.description && (
          <p className="text-dark-400">{material.description}</p>
        )}
      </div>

      {/* Material Content */}
      <div 
        ref={contentRef}
        className="card-dark rounded-2xl overflow-hidden"
      >
        {/* Video Content */}
        {material.type === 'VIDEO' && material.videoUrl && (
          <div className="relative">
            <video
              ref={videoRef}
              src={material.videoUrl}
              className="w-full aspect-video bg-black"
              controls
              autoPlay
              muted={isMuted}
              onLoadedMetadata={() => {
                if (watchTime > 0 && videoRef.current) {
                  videoRef.current.currentTime = watchTime
                }
              }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-dark-900/80 hover:bg-dark-800 text-white transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-dark-900/80 hover:bg-dark-800 text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* PDF Content */}
        {material.type === 'PDF' && material.fileUrl && (
          <div className="aspect-[4/3] w-full">
            <iframe
              src={`${material.fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              title={material.title}
            />
          </div>
        )}

        {/* Image Content */}
        {material.type === 'IMAGE' && material.fileUrl && (
          <div className="p-6 flex justify-center">
            <img 
              src={material.fileUrl} 
              alt={material.title}
              className="max-w-full max-h-[70vh] rounded-xl"
            />
          </div>
        )}

        {/* Text Content */}
        {material.type === 'TEXT' && material.content && (
          <div className="p-8 prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: material.content }} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {navigation.prev && (
            <Link
              href={`/dashboard/student/courses/${courseId}/materials/${navigation.prev.id}`}
              className="flex items-center gap-2 btn-secondary"
            >
              <ChevronLeft size={16} />
              Previous: {navigation.prev.title.length > 20 
                ? navigation.prev.title.substring(0, 20) + '...' 
                : navigation.prev.title}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!completed ? (
            <button
              onClick={markAsComplete}
              className="btn-primary inline-flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Mark as Complete
            </button>
          ) : (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl">
              <Check size={16} />
              <span>Completed</span>
            </div>
          )}

          {material.fileUrl && material.type !== 'VIDEO' && (
            <a
              href={material.fileUrl}
              download
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </a>
          )}

          {navigation.next && (
            <Link
              href={`/dashboard/student/courses/${courseId}/materials/${navigation.next.id}`}
              className="flex items-center gap-2 btn-primary"
            >
              Next: {navigation.next.title.length > 20 
                ? navigation.next.title.substring(0, 20) + '...' 
                : navigation.next.title}
              <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Course Navigation */}
      <div className="card-dark rounded-2xl p-6 mt-8">
        <h3 className="font-semibold text-dark-300 mb-4">Course Navigation</h3>
        <Link
          href={`/dashboard/student/courses/${courseId}`}
          className="flex items-center gap-2 text-brand-400 hover:text-brand-300 transition-colors"
        >
          <BookOpen size={16} />
          Back to {course.title} Course Page
        </Link>
      </div>
    </div>
  )
}