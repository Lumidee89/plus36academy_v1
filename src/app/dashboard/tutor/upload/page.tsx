'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, Image, Video, Link as LinkIcon, File, X, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'

type MaterialType = 'PDF' | 'IMAGE' | 'TEXT' | 'VIDEO' | 'VIDEO_LINK'

interface UploadedFile {
  id: string
  name: string
  type: MaterialType
  url?: string
  size?: number
  status: 'uploading' | 'done' | 'error'
  progress: number
}

const TYPE_CONFIG: Record<MaterialType, { label: string; icon: React.ReactNode; accept: string; color: string }> = {
  PDF: { label: 'PDF Document', icon: <FileText size={20} />, accept: '.pdf', color: 'text-red-400' },
  IMAGE: { label: 'Image', icon: <Image size={20} />, accept: '.jpg,.jpeg,.png,.gif,.webp', color: 'text-blue-400' },
  VIDEO: { label: 'Video File', icon: <Video size={20} />, accept: '.mp4,.mov,.avi,.mkv', color: 'text-purple-400' },
  VIDEO_LINK: { label: 'Video Link (YouTube/Vimeo)', icon: <LinkIcon size={20} />, accept: '', color: 'text-green-400' },
  TEXT: { label: 'Text / Article', icon: <FileText size={20} />, accept: '', color: 'text-yellow-400' },
}

function DropZone({ onFiles, accept, disabled }: { onFiles: (files: File[]) => void; accept: string; disabled?: boolean }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    onFiles(files)
  }, [onFiles])

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
        dragging ? 'border-brand-500 bg-brand-500/10' : 'border-dark-600 hover:border-dark-400 hover:bg-dark-800/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => onFiles(Array.from(e.target.files || []))}
        disabled={disabled}
      />
      <Upload size={40} className={`mx-auto mb-4 ${dragging ? 'text-brand-400' : 'text-dark-500'}`} />
      <p className="text-white font-semibold mb-1">
        {dragging ? 'Drop files here' : 'Drag & drop or click to upload'}
      </p>
      <p className="text-dark-400 text-sm">{accept || 'All files'} • Max 500MB per file</p>
    </div>
  )
}

export default function UploadMaterialPage() {
  const [selectedType, setSelectedType] = useState<MaterialType>('PDF')
  const [courseId, setCourseId] = useState('')
  const [moduleId, setModuleId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [textContent, setTextContent] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Mock courses for demo
  const mockCourses = [
    { id: 'c1', title: 'Full-Stack Web Development' },
    { id: 'c2', title: 'React Masterclass' },
  ]
  const mockModules = [
    { id: 'm1', title: 'Module 1: Introduction' },
    { id: 'm2', title: 'Module 2: Core Concepts' },
    { id: 'm3', title: 'Module 3: Advanced Topics' },
  ]

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      const id = Math.random().toString(36).slice(2)
      const upload: UploadedFile = {
        id,
        name: file.name,
        type: selectedType,
        size: file.size,
        status: 'uploading',
        progress: 0,
      }
      setUploads(prev => [...prev, upload])

      // Animate progress bar while uploading
      const progressInterval = setInterval(() => {
        setUploads(prev => prev.map(u =>
          u.id === id && u.progress < 85 ? { ...u, progress: u.progress + 5 } : u
        ))
      }, 200)

      try {
        const token = localStorage.getItem('token')
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', selectedType) // PDF | IMAGE | VIDEO

        const res = await fetch('/api/materials/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })

        clearInterval(progressInterval)
        const data = await res.json()

        if (!res.ok) {
          setUploads(prev => prev.map(u =>
            u.id === id ? { ...u, status: 'error', progress: 0 } : u
          ))
          setError(data.error || 'Upload failed')
          continue
        }

        // data.data.url is the local path e.g. /uploads/videos/abc123.mp4
        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: 'done', progress: 100, url: data.data.url } : u
        ))

        // Auto-fill title from filename
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''))
      } catch (err) {
        clearInterval(progressInterval)
        setUploads(prev => prev.map(u =>
          u.id === id ? { ...u, status: 'error', progress: 0 } : u
        ))
        setError('Upload failed — is the server running?')
      }
    }
  }

  const handleSave = async () => {
    if (!title || !moduleId) {
      setError('Please fill in the title and select a module.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      let materialData: Record<string, unknown> = {
        title,
        description,
        type: selectedType,
        moduleId,
        isFree,
        order: 0,
      }

      if (selectedType === 'VIDEO_LINK') {
        materialData.videoUrl = videoUrl
      } else if (selectedType === 'TEXT') {
        materialData.content = textContent
      } else if (uploads.length > 0 && uploads[0].status === 'done') {
        materialData.fileUrl = uploads[0].url
        materialData.fileSize = uploads[0].size
      }

      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(materialData),
      })

      if (res.ok) {
        setSuccess('Material saved successfully!')
        // Reset
        setTitle('')
        setDescription('')
        setVideoUrl('')
        setTextContent('')
        setUploads([])
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save material')
      }
    } catch {
      // For demo purposes
      setSuccess('Material saved! (Demo mode — connect your backend to persist.)')
      setTimeout(() => setSuccess(''), 4000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white mb-1">Upload Material</h1>
        <p className="text-dark-400">Add content to your courses — PDFs, videos, images, or text</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl p-4">
          <CheckCircle size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Step 1: Course & Module */}
      <div className="card-dark rounded-3xl p-8">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold">1</span>
          Select Course & Module
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Course *</label>
            <div className="relative">
              <select
                value={courseId}
                onChange={e => setCourseId(e.target.value)}
                className="input-dark appearance-none pr-10">
                <option value="">Select a course...</option>
                {mockCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Module *</label>
            <div className="relative">
              <select
                value={moduleId}
                onChange={e => setModuleId(e.target.value)}
                className="input-dark appearance-none pr-10">
                <option value="">Select a module...</option>
                {mockModules.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Content Type */}
      <div className="card-dark rounded-3xl p-8">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold">2</span>
          Choose Content Type
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(Object.entries(TYPE_CONFIG) as [MaterialType, typeof TYPE_CONFIG[MaterialType]][]).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                selectedType === type
                  ? 'border-brand-500 bg-brand-500/10'
                  : 'border-dark-700 hover:border-dark-500'
              }`}>
              <div className={`flex justify-center mb-2 ${selectedType === type ? 'text-brand-400' : config.color}`}>
                {config.icon}
              </div>
              <div className={`text-xs font-medium ${selectedType === type ? 'text-brand-400' : 'text-dark-400'}`}>
                {config.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Material Info */}
      <div className="card-dark rounded-3xl p-8">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold">3</span>
          Material Details
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Introduction to React Hooks"
              className="input-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this material..."
              rows={2}
              className="input-dark resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-800 rounded-xl">
            <div>
              <div className="text-white text-sm font-medium">Free Preview</div>
              <div className="text-dark-400 text-xs">Allow non-enrolled users to see this material</div>
            </div>
            <button
              onClick={() => setIsFree(!isFree)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                isFree ? 'bg-brand-500' : 'bg-dark-600'
              }`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                isFree ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Step 4: Upload / Content */}
      <div className="card-dark rounded-3xl p-8">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold">4</span>
          Upload Content
        </h2>

        {/* File upload types */}
        {(selectedType === 'PDF' || selectedType === 'IMAGE' || selectedType === 'VIDEO') && (
          <>
            <DropZone
              accept={TYPE_CONFIG[selectedType].accept}
              onFiles={handleFiles}
            />

            {/* Upload list */}
            {uploads.length > 0 && (
              <div className="mt-4 space-y-3">
                {uploads.map((upload) => (
                  <div key={upload.id} className="bg-dark-800 rounded-xl p-4 flex items-center gap-4">
                    <div className={`${TYPE_CONFIG[upload.type].color}`}>
                      {TYPE_CONFIG[upload.type].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{upload.name}</div>
                      {upload.size && (
                        <div className="text-dark-500 text-xs">
                          {(upload.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      )}
                      {upload.status === 'uploading' && (
                        <div className="mt-2 h-1 bg-dark-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 transition-all duration-200"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {upload.status === 'done' && <CheckCircle size={18} className="text-green-400" />}
                      {upload.status === 'uploading' && (
                        <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                      )}
                      {upload.status === 'error' && <AlertCircle size={18} className="text-red-400" />}
                    </div>
                    <button
                      onClick={() => setUploads(prev => prev.filter(u => u.id !== upload.id))}
                      className="text-dark-500 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Video link */}
        {selectedType === 'VIDEO_LINK' && (
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Video URL *</label>
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              className="input-dark"
            />
            {videoUrl && (
              <div className="mt-4 rounded-xl overflow-hidden bg-dark-800 p-4">
                <p className="text-dark-400 text-sm">Link: <span className="text-brand-400">{videoUrl}</span></p>
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        {selectedType === 'TEXT' && (
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Content *</label>
            <textarea
              value={textContent}
              onChange={e => setTextContent(e.target.value)}
              placeholder="Write your article or lesson content here... (Markdown supported)"
              rows={12}
              className="input-dark resize-y font-mono text-sm"
            />
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-4">
        <button className="btn-secondary">Save as Draft</button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 px-8 disabled:opacity-50">
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {saving ? 'Saving...' : 'Save Material'}
        </button>
      </div>
    </div>
  )
}
