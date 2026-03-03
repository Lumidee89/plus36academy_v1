'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, CheckCircle, PlayCircle, FileText, Image, File, 
  Download, Check, Volume2, VolumeX, Maximize2, Minimize2, RefreshCw, Youtube,
  Menu, X, BookOpen, Lock
} from 'lucide-react'

export default function StudentMaterialPage() {
  const params = useParams()
  const router = useRouter()
  const materialId = params.materialId as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [material, setMaterial] = useState<any>(null)
  const [courseModules, setCourseModules] = useState<any[]>([])
  const [completed, setCompleted] = useState(false)
  const [watchTime, setWatchTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
      console.log('Material data:', data.data?.material)
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch material')
      }
      
      setMaterial(data.data.material)
      setCompleted(data.data.progress.completed)
      setWatchTime(data.data.progress.watchTime || 0)
      
      // Fetch all course modules with materials
      if (data.data.course?.id) {
        fetchCourseModules(data.data.course.id)
      }
    } catch (error: any) {
      console.error('Error fetching material:', error)
      setError(error.message || 'Failed to load material')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCourseModules(courseId: string) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/student/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setCourseModules(data.data.modules || [])
        // Auto-expand the module containing current material
        const currentModule = data.data.modules?.find((module: any) => 
          module.materials.some((m: any) => m.id === materialId)
        )
        if (currentModule) {
          setExpandedModules([currentModule.id])
        }
      }
    } catch (error) {
      console.error('Error fetching course modules:', error)
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
      
      // Refresh modules to update completion status
      if (material?.course?.id) {
        fetchCourseModules(material.course.id)
      }
    } catch (error) {
      console.error('Error marking as complete:', error)
    }
  }

  async function updateWatchTime(time: number) {
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

  // Video event handlers
  const handleVideoLoad = () => {
    if (videoRef.current && watchTime > 0) {
      videoRef.current.currentTime = watchTime
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime)
      if (currentTime > 0 && currentTime % 30 === 0) {
        updateWatchTime(currentTime)
      }
    }
  }

  const handleVideoEnd = () => {
    if (!completed) {
      markAsComplete()
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error
    console.error('Video error details:', {
      code: error?.code,
      message: error?.message,
      networkState: video.networkState,
      readyState: video.readyState,
      src: video.src
    })

    let errorMessage = 'Failed to load video: '
    switch (error?.code) {
      case 1:
        errorMessage += 'Video loading aborted.'
        break
      case 2:
        errorMessage += 'Network error. Please check your connection.'
        break
      case 3:
        errorMessage += 'Video decoding failed. The file might be corrupted or in an unsupported format.'
        break
      case 4:
        errorMessage += 'Video format not supported by your browser.'
        break
      default:
        errorMessage += error?.message || 'Unknown error'
    }
    
    setVideoError(errorMessage)
  }

  const handleRetry = () => {
    setVideoError('')
    setRetryCount(prev => prev + 1)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Function to extract Vimeo video ID from URL
  const getVimeoVideoId = (url: string) => {
    const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/
    const match = url.match(regExp)
    return match ? match[5] : null
  }

  const getMaterialIcon = (type: string, completed: boolean) => {
    if (completed) return <CheckCircle size={16} className="text-green-500" />
    
    switch (type) {
      case 'VIDEO':
      case 'VIDEO_LINK':
        return <PlayCircle size={16} className="text-brand-400" />
      case 'PDF':
        return <FileText size={16} className="text-red-400" />
      case 'IMAGE':
        return <Image size={16} className="text-blue-400" />
      case 'TEXT':
        return <FileText size={16} className="text-green-400" />
      default:
        return <File size={16} className="text-dark-400" />
    }
  }

  // Function to render the appropriate content based on type
  const renderContent = () => {
    if (!material) return null

    switch (material.type) {
      case 'TEXT':
        return (
          <div className="p-8 bg-white rounded-xl">
            {material.content ? (
              <div 
                style={{ color: '#111827' }}
                className="prose prose-lg max-w-none
                  [&_h1]:!text-gray-900 [&_h2]:!text-gray-900 [&_h3]:!text-gray-900 
                  [&_p]:!text-gray-700 [&_li]:!text-gray-700"
                dangerouslySetInnerHTML={{ __html: material.content }} 
              />
            ) : (
              <p className="text-dark-400 text-center py-12">No content available for this lesson.</p>
            )}
          </div>
        )

      case 'VIDEO':
      case 'VIDEO_LINK':
        if (!material.videoUrl) {
          return (
            <div className="w-full aspect-video bg-dark-800 flex items-center justify-center p-8">
              <p className="text-dark-400">Video URL is missing</p>
            </div>
          )
        }

        const youtubeId = getYouTubeVideoId(material.videoUrl)
        if (youtubeId) {
          return (
            <div className="w-full aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )
        }

        const vimeoId = getVimeoVideoId(material.videoUrl)
        if (vimeoId) {
          return (
            <div className="w-full aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://player.vimeo.com/video/${vimeoId}`}
                title="Vimeo video player"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          )
        }

        if (videoError) {
          return (
            <div className="w-full aspect-video bg-dark-800 flex items-center justify-center p-8">
              <div className="text-center max-w-lg">
                <p className="text-red-500 mb-4">{videoError}</p>
                <p className="text-dark-400 text-sm mb-4">
                  Video URL: <code className="bg-dark-700 px-2 py-1 rounded break-all">{material.videoUrl}</code>
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Retry
                  </button>
                  <a
                    href={material.videoUrl}
                    download
                    className="btn-secondary inline-flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download size={16} />
                    Download Video
                  </a>
                </div>
              </div>
            </div>
          )
        }

        return (
          <>
            <video
              key={retryCount}
              ref={videoRef}
              className="w-full aspect-video bg-black"
              controls
              controlsList="nodownload"
              autoPlay={false}
              muted={isMuted}
              onLoadedMetadata={handleVideoLoad}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnd}
              onError={handleVideoError}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
              preload="metadata"
            >
              <source src={material.videoUrl} type="video/mp4" />
              <source src={material.videoUrl} type="video/webm" />
              <source src={material.videoUrl} type="video/ogg" />
              Your browser does not support the video tag.
            </video>
            
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
          </>
        )

      case 'PDF':
        return material.fileUrl ? (
          <div className="aspect-[4/3] w-full">
            <iframe
              src={`${material.fileUrl}#toolbar=0&navpanes=0`}
              className="w-full h-full"
              title={material.title}
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-dark-400">PDF file not available</p>
          </div>
        )

      case 'IMAGE':
        return material.fileUrl ? (
          <div className="p-6 flex justify-center">
            <img 
              src={material.fileUrl} 
              alt={material.title}
              className="max-w-full max-h-[70vh] rounded-xl"
            />
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-dark-400">Image not available</p>
          </div>
        )

      default:
        return (
          <div className="p-12 text-center">
            <p className="text-dark-400">This lesson type ({material.type}) is not supported.</p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !material) {
    return (
      <div className="card-dark rounded-2xl p-12 text-center">
        <h3 className="text-xl font-bold text-dark-300 mb-2">Lesson Not Found</h3>
        <p className="text-dark-400 mb-6">{error || 'The lesson you\'re looking for doesn\'t exist.'}</p>
        <Link 
          href="/dashboard/student/courses"
          className="btn-primary inline-flex items-center gap-2"
        >
          Back to My Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-dark-950">
      {/* Sidebar Toggle Button (mobile) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-brand-500 rounded-full text-white shadow-lg"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 bg-dark-900 border-r border-dark-800 
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4">
          {/* Course Title */}
          <Link
            href={`/dashboard/student/courses/${material?.course?.id}`}
            className="block mb-4 p-3 bg-dark-800 rounded-xl hover:bg-dark-700 transition-colors"
          >
            <div className="text-xs text-dark-400 mb-1">Current Course</div>
            <div className="font-semibold text-dark-300 line-clamp-2">
              {material?.course?.title || 'Course Title'}
            </div>
          </Link>

          {/* Course Content */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-dark-400 px-3 mb-3">Course Content</h3>
            
            {courseModules.map((module) => {
              const isExpanded = expandedModules.includes(module.id)
              const moduleCompleted = module.materials?.every((m: any) => m.completed)
              const totalMaterials = module.materials?.length || 0
              const completedMaterials = module.materials?.filter((m: any) => m.completed).length || 0

              return (
                <div key={module.id} className="mb-2">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        moduleCompleted ? 'bg-green-500' : 'bg-brand-500'
                      }`} />
                      <span className="text-sm font-medium text-dark-300 truncate">
                        {module.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-dark-500">
                        {completedMaterials}/{totalMaterials}
                      </span>
                      <ChevronLeft size={14} className={`text-dark-400 transform transition-transform ${
                        isExpanded ? 'rotate-90' : '-rotate-90'
                      }`} />
                    </div>
                  </button>

                  {/* Module Materials */}
                  {isExpanded && module.materials?.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/dashboard/student/materials/${item.id}`}
                      className={`flex items-center gap-3 ml-6 p-2 rounded-lg transition-colors ${
                        item.id === materialId
                          ? 'bg-brand-500/10 text-brand-400'
                          : 'hover:bg-dark-800 text-dark-400 hover:text-dark-300'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getMaterialIcon(item.type, item.completed)}
                      </div>
                      <span className="text-xs flex-1 truncate">{item.title}</span>
                      {item.completed && (
                        <Check size={12} className="text-green-500 flex-shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-dark-800 text-dark-400 hover:text-white"
              >
                <Menu size={18} />
              </button>
              <Link
                href={`/dashboard/student/courses/${material?.course?.id}`}
                className="inline-flex items-center gap-2 text-dark-400 hover:text-brand-400"
              >
                <ChevronLeft size={18} />
                Back to Course
              </Link>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-dark-800 text-dark-400">
              {material.type === 'TEXT' ? 'Article' : 
               material.type === 'VIDEO_LINK' ? 'External Video' : 
               material.type}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl font-black text-dark-300">{material.title}</h1>
          {material.description && (
            <p className="text-dark-400">{material.description}</p>
          )}

          {/* Content */}
          <div 
            ref={containerRef}
            className="card-dark rounded-2xl overflow-hidden"
          >
            {renderContent()}
          </div>

          {/* Download button for files */}
          {material.fileUrl && !['VIDEO', 'VIDEO_LINK', 'TEXT'].includes(material.type) && (
            <div className="flex justify-start">
              <a
                href={material.fileUrl}
                download
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Download size={16} />
                Download {material.type === 'PDF' ? 'PDF' : material.type === 'IMAGE' ? 'Image' : 'File'}
              </a>
            </div>
          )}

          {/* Complete button */}
          <div className="flex justify-end">
            {!completed ? (
              <button onClick={markAsComplete} className="btn-primary inline-flex items-center gap-2">
                <CheckCircle size={16} />
                Mark as Complete
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl">
                <Check size={16} />
                Completed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}