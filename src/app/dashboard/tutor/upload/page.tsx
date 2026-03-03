'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Upload, FileText, Image, Video, Link as LinkIcon, File, X, 
  CheckCircle, AlertCircle, ChevronDown, Plus, Trash2, BookOpen,
  Edit2, Eye, Download, Grid, List, Search, RefreshCw
} from 'lucide-react'

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

interface Module {
  id: string
  title: string
  description?: string
  order: number
  materials?: Material[]
  courseId?: string
}

interface Material {
  id?: string
  title: string
  description?: string
  type: MaterialType
  fileUrl?: string
  videoUrl?: string
  content?: string
  isFree: boolean
  order: number
  moduleId?: string
  createdAt?: string
  uploadedFile?: UploadedFile
}

interface Course {
  id: string
  title: string
  description: string
  status: string
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
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
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
      <Upload size={32} className={`mx-auto mb-3 ${dragging ? 'text-brand-400' : 'text-dark-500'}`} />
      <p className="text-dark-300 font-semibold mb-1">
        {dragging ? 'Drop files here' : 'Drag & drop or click to upload'}
      </p>
      <p className="text-dark-400 text-xs">{accept || 'All files'} • Max 500MB per file</p>
    </div>
  )
}

export default function UploadMaterialPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [modules, setModules] = useState<Module[]>([])
  const [allMaterials, setAllMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch published courses
  useEffect(() => {
    fetchCourses()
    fetchAllMaterials()
  }, [])

  // Fetch modules when course is selected
  useEffect(() => {
    if (selectedCourseId) {
      fetchModules(selectedCourseId)
    } else {
      setModules([])
    }
  }, [selectedCourseId])

  async function fetchCourses() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/courses?status=PUBLISHED', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.data) {
        setCourses(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  async function fetchModules(courseId: string) {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.data) {
        // Fetch materials for each module
        const modulesWithMaterials = await Promise.all(
          data.data.map(async (module: Module) => {
            const materialsRes = await fetch(`/api/modules/${module.id}/materials`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            const materialsData = await materialsRes.json()
            return { ...module, materials: materialsData.data || [] }
          })
        )
        setModules(modulesWithMaterials)
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  async function fetchAllMaterials() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/materials?all=true', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.data) {
        setAllMaterials(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error)
    }
  }

  const addModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: '',
      order: modules.length,
      materials: [],
    }
    setModules([...modules, newModule])
  }

  const removeModule = async (moduleId: string) => {
    if (moduleId.startsWith('temp-')) {
      setModules(modules.filter(m => m.id !== moduleId))
      return
    }

    if (!confirm('Delete this module and all its materials? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setModules(modules.filter(m => m.id !== moduleId))
        setSuccess('Module deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('Failed to delete module')
    }
  }

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, ...updates } : m
    ))
  }

  const addMaterial = (moduleId: string) => {
    const newMaterial: Material = {
      title: '',
      type: 'PDF',
      isFree: false,
      order: 0,
    }
    
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { ...m, materials: [...(m.materials || []), newMaterial] }
        : m
    ))
  }

  const updateMaterial = (moduleId: string, materialIndex: number, updates: Partial<Material>) => {
    setModules(modules.map(m => 
      m.id === moduleId 
        ? { 
            ...m, 
            materials: (m.materials || []).map((mat, idx) => 
              idx === materialIndex ? { ...mat, ...updates } : mat
            )
          }
        : m
    ))
  }

  const removeMaterial = async (moduleId: string, materialIndex: number, materialId?: string) => {
    if (!materialId) {
      // Remove unsaved material
      setModules(modules.map(m => 
        m.id === moduleId 
          ? { ...m, materials: (m.materials || []).filter((_, idx) => idx !== materialIndex) }
          : m
      ))
      return
    }

    if (!confirm('Delete this material?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setModules(modules.map(m => 
          m.id === moduleId 
            ? { ...m, materials: (m.materials || []).filter((_, idx) => idx !== materialIndex) }
            : m
        ))
        fetchAllMaterials() // Refresh materials list
        setSuccess('Material deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('Failed to delete material')
    }
  }

  const handleFileUpload = async (moduleId: string, materialIndex: number, files: File[]) => {
    const file = files[0]
    if (!file) return

    const material = modules.find(m => m.id === moduleId)?.materials?.[materialIndex]
    if (!material) return

    const uploadId = Math.random().toString(36).slice(2)
    const uploadedFile: UploadedFile = {
      id: uploadId,
      name: file.name,
      type: material.type,
      size: file.size,
      status: 'uploading',
      progress: 0,
    }

    updateMaterial(moduleId, materialIndex, { uploadedFile })

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', material.type)

      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      updateMaterial(moduleId, materialIndex, {
        fileUrl: data.data?.url || data.url,
        uploadedFile: {
          ...uploadedFile,
          status: 'done',
          progress: 100,
          url: data.data?.url || data.url,
        }
      })

      if (!material.title) {
        updateMaterial(moduleId, materialIndex, {
          title: file.name.replace(/\.[^/.]+$/, '')
        })
      }

    } catch (error) {
      updateMaterial(moduleId, materialIndex, {
        uploadedFile: {
          ...uploadedFile,
          status: 'error',
          progress: 0,
        }
      })
      setError('Upload failed')
    }
  }

  const handleSaveAll = async () => {
    if (!selectedCourseId) {
      setError('Please select a course')
      return
    }

    if (modules.length === 0) {
      setError('Please add at least one module')
      return
    }

    // Validate modules
    for (const module of modules) {
      if (!module.title) {
        setError('Please fill in all module titles')
        return
      }
    }

    // Add validation for materials here - BEFORE setting saving state
    for (const module of modules) {
      if (module.materials) {
        for (const material of module.materials) {
          if (!material.title) continue // Skip materials without titles
          
          // Validate material based on type
          try {
            if (material.type === 'VIDEO_LINK' && !material.videoUrl?.trim()) {
              setError(`Video URL is required for "${material.title || 'Untitled material'}"`)
              return
            }
            if (['PDF', 'IMAGE', 'VIDEO'].includes(material.type) && !material.fileUrl) {
              setError(`File is required for "${material.title || 'Untitled material'}"`)
              return
            }
            if (material.type === 'TEXT' && !material.content?.trim()) {
              setError(`Content is required for "${material.title || 'Untitled material'}"`)
              return
            }
          } catch (err: any) {
            setError(err.message)
            return
          }
        }
      }
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const savedModules = []

      // Save each module and its materials
      for (const module of modules) {
        let moduleId = module.id

        // Create or update module
        const moduleData = {
          title: module.title,
          description: module.description || '',
          courseId: selectedCourseId,
          order: module.order,
        }

        if (module.id.startsWith('temp-')) {
          // Create new module
          console.log('Creating module:', moduleData)
          const moduleRes = await fetch('/api/modules', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(moduleData),
          })
          
          const moduleResult = await moduleRes.json()
          console.log('Module create response:', moduleResult)
          
          if (!moduleRes.ok) {
            throw new Error(moduleResult.error || 'Failed to create module')
          }
          
          moduleId = moduleResult.data.id
        } else {
          // Update existing module
          console.log('Updating module:', moduleId, moduleData)
          const moduleRes = await fetch(`/api/modules/${module.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(moduleData),
          })
          
          if (!moduleRes.ok) {
            const moduleResult = await moduleRes.json()
            throw new Error(moduleResult.error || 'Failed to update module')
          }
        }

        // Save materials for this module
        if (module.materials) {
          for (const material of module.materials) {
            if (!material.title) continue

            const materialData = {
              title: material.title,
              description: material.description || undefined,
              type: material.type,
              moduleId: moduleId,
              isFree: material.isFree,
              order: material.order,
              // Only include if they have valid values
              ...(material.fileUrl && material.fileUrl.trim() && { fileUrl: material.fileUrl }),
              ...(material.videoUrl && material.videoUrl.trim() && { videoUrl: material.videoUrl }),
              ...(material.content && material.content.trim() && { content: material.content }),
            }

            console.log('Saving material:', materialData)

            if (material.id && !material.id.startsWith('temp-')) {
              // Update existing material
              const materialRes = await fetch(`/api/materials/${material.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(materialData),
              })
              
              if (!materialRes.ok) {
                const materialResult = await materialRes.json()
                throw new Error(materialResult.error || 'Failed to update material')
              }
            } else {
              // Create new material
              const materialRes = await fetch('/api/materials', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(materialData),
              })
              
              if (!materialRes.ok) {
                const materialResult = await materialRes.json()
                throw new Error(materialResult.error || 'Failed to create material')
              }
            }
          }
        }

        savedModules.push(moduleId)
      }

      setSuccess('All modules and materials saved successfully!')
      
      // Refresh data
      if (selectedCourseId) {
        fetchModules(selectedCourseId)
      }
      fetchAllMaterials()

      // Clear the form for new uploads
      setTimeout(() => {
        // Option 1: Keep the same course selected but clear modules
        setModules([])
        
        // Option 2: Reset to initial state (uncomment if you prefer)
        // setSelectedCourseId('')
        // setModules([])
        
        // Show a message that they can add more
        setSuccess('Ready to add more materials!')
      }, 2000)

    } catch (error: any) {
      console.error('Save error:', error)
      setError(error.message || 'Failed to save some items')
    } finally {
      setSaving(false)
    }
  }

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material)
    setShowEditModal(true)
  }

  const handleUpdateMaterial = async () => {
    if (!editingMaterial || !editingMaterial.id) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/materials/${editingMaterial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingMaterial),
      })

      if (res.ok) {
        setShowEditModal(false)
        setEditingMaterial(null)
        fetchAllMaterials()
        if (selectedCourseId) {
          fetchModules(selectedCourseId)
        }
        setSuccess('Material updated successfully')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('Failed to update material')
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Delete this material?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        fetchAllMaterials()
        if (selectedCourseId) {
          fetchModules(selectedCourseId)
        }
        setSuccess('Material deleted successfully')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      setError('Failed to delete material')
    }
  }

  const filteredMaterials = allMaterials.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMaterialIcon = (type: MaterialType) => {
    const config = TYPE_CONFIG[type]
    return config?.icon || <FileText size={20} />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-400 mb-1">Course Materials</h1>
        <p className="text-dark-400">Upload and manage your course modules and materials</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-dark-800">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'upload' 
              ? 'text-brand-500 border-b-2 border-brand-500' 
              : 'text-dark-400 hover:text-dark-300'
          }`}
        >
          <Upload size={16} className="inline mr-2" />
          Upload Materials
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
            activeTab === 'manage' 
              ? 'text-brand-500 border-b-2 border-brand-500' 
              : 'text-dark-400 hover:text-dark-300'
          }`}
        >
          <BookOpen size={16} className="inline mr-2" />
          Manage Materials ({allMaterials.length})
        </button>
      </div>

      {/* Success/Error Messages */}
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

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <>
          {/* Course Selection */}
          <div className="card-dark rounded-3xl p-8">
            <h2 className="text-dark-400 font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold">1</span>
              Select Published Course
            </h2>

            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="input-dark appearance-none pr-10 w-full">
                <option value="">Choose a course...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
            </div>

            {courses.length === 0 && (
              <p className="text-dark-500 text-sm mt-4">
                No published courses found. Publish a course first to add materials.
              </p>
            )}
          </div>

          {/* Modules & Materials */}
          {selectedCourseId && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-dark-400 font-bold text-lg flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold">2</span>
                  Modules & Materials
                </h2>
                <button
                  onClick={addModule}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Add Module
                </button>
              </div>

              {modules.length === 0 ? (
                <div className="card-dark rounded-3xl p-12 text-center">
                  <BookOpen size={48} className="mx-auto mb-4 text-dark-600" />
                  <p className="text-dark-400 mb-4">No modules yet. Add your first module to start uploading materials.</p>
                  <button
                    onClick={addModule}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add First Module
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="card-dark rounded-3xl p-6">
                      {/* Module Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={module.title}
                            onChange={e => updateModule(module.id, { title: e.target.value })}
                            placeholder="Module title (e.g., Introduction)"
                            className="input-dark text-lg font-medium w-full"
                          />
                          <input
                            type="text"
                            value={module.description || ''}
                            onChange={e => updateModule(module.id, { description: e.target.value })}
                            placeholder="Module description (optional)"
                            className="input-dark text-sm mt-2 w-full"
                          />
                        </div>
                        <button
                          onClick={() => removeModule(module.id)}
                          className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Materials */}
                      <div className="space-y-4 mt-4">
                        {module.materials?.map((material, materialIndex) => (
                          <div key={materialIndex} className="bg-dark-800/50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              {/* Material Type Selector */}
                              <div className="relative w-40">
                                <select
                                  value={material.type}
                                  onChange={e => updateMaterial(module.id, materialIndex, { type: e.target.value as MaterialType })}
                                  className="input-dark appearance-none pr-8 text-sm w-full"
                                >
                                  {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                                    <option key={type} value={type}>{config.label}</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
                              </div>

                              {/* Title Input */}
                              <input
                                type="text"
                                value={material.title}
                                onChange={e => updateMaterial(module.id, materialIndex, { title: e.target.value })}
                                placeholder="Material title"
                                className="input-dark text-sm flex-1"
                              />

                              {/* Free Preview Toggle */}
                              <button
                                onClick={() => updateMaterial(module.id, materialIndex, { isFree: !material.isFree })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                  material.isFree 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-dark-700 text-dark-400'
                                }`}
                              >
                                {material.isFree ? 'Free' : 'Paid'}
                              </button>

                              {/* Remove Material */}
                              <button
                                onClick={() => removeMaterial(module.id, materialIndex, material.id)}
                                className="p-1.5 text-dark-400 hover:text-red-400 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            {/* Description */}
                            <input
                              type="text"
                              value={material.description || ''}
                              onChange={e => updateMaterial(module.id, materialIndex, { description: e.target.value })}
                              placeholder="Brief description (optional)"
                              className="input-dark text-sm w-full mt-3"
                            />

                            {/* Content based on type */}
                            {material.type === 'VIDEO_LINK' && (
                              <input
                                type="url"
                                value={material.videoUrl || ''}
                                onChange={e => updateMaterial(module.id, materialIndex, { videoUrl: e.target.value })}
                                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                className="input-dark text-sm w-full mt-3"
                              />
                            )}

                            {material.type === 'TEXT' && (
                              <textarea
                                value={material.content || ''}
                                onChange={e => updateMaterial(module.id, materialIndex, { content: e.target.value })}
                                placeholder="Write your content here..."
                                rows={3}
                                className="input-dark text-sm w-full mt-3 resize-y"
                              />
                            )}

                            {(material.type === 'PDF' || material.type === 'IMAGE' || material.type === 'VIDEO') && (
                              <div className="mt-3">
                                {material.uploadedFile ? (
                                  <div className="bg-dark-900 rounded-xl p-3 flex items-center gap-3">
                                    <div className={TYPE_CONFIG[material.type].color}>
                                      {TYPE_CONFIG[material.type].icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-dark-400 text-xs truncate">{material.uploadedFile.name}</div>
                                      {material.uploadedFile.status === 'uploading' && (
                                        <div className="mt-1 h-1 bg-dark-600 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-brand-500 transition-all duration-200"
                                            style={{ width: `${material.uploadedFile.progress}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      {material.uploadedFile.status === 'done' && (
                                        <CheckCircle size={16} className="text-green-400" />
                                      )}
                                      {material.uploadedFile.status === 'uploading' && (
                                        <div className="w-4 h-4 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                                      )}
                                      {material.uploadedFile.status === 'error' && (
                                        <AlertCircle size={16} className="text-red-400" />
                                      )}
                                    </div>
                                    <button
                                      onClick={() => updateMaterial(module.id, materialIndex, { uploadedFile: undefined })}
                                      className="text-dark-500 hover:text-red-400"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ) : material.fileUrl ? (
                                  <div className="bg-dark-900 rounded-xl p-3 flex items-center gap-3">
                                    <div className={TYPE_CONFIG[material.type].color}>
                                      {TYPE_CONFIG[material.type].icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-dark-400 text-xs truncate">
                                        {material.fileUrl.split('/').pop()}
                                      </div>
                                    </div>
                                    <a
                                      href={material.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-dark-400 hover:text-brand-400"
                                    >
                                      <Eye size={16} />
                                    </a>
                                  </div>
                                ) : (
                                  <DropZone
                                    accept={TYPE_CONFIG[material.type].accept}
                                    onFiles={(files) => handleFileUpload(module.id, materialIndex, files)}
                                    disabled={false}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add Material Button */}
                        <button
                          onClick={() => addMaterial(module.id)}
                          className="w-full py-3 border-2 border-dashed border-dark-700 rounded-xl text-dark-400 hover:border-brand-500 hover:text-brand-400 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Plus size={16} />
                          Add Material to {module.title || 'this module'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save All Button */}
              {modules.length > 0 && (
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => {
                      if (confirm('Clear all unsaved changes?')) {
                        setModules([])
                        setSelectedCourseId('')
                      }
                    }}
                    className="btn-secondary flex items-center gap-2 px-6 py-3"
                  >
                    <X size={18} />
                    Clear Form
                  </button>
                  <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 px-8 py-3 text-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                    {saving ? 'Saving...' : 'Save All Modules & Materials'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Manage Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          {/* Search and View Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex-1 card-dark rounded-2xl p-4 flex items-center gap-2">
              <Search size={16} className="text-dark-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search materials by title or description..."
                className="flex-1 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
              />
            </div>
            <div className="flex items-center gap-2 bg-dark-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-brand-500 text-white' : 'text-dark-400 hover:text-dark-300'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-dark-400 hover:text-dark-300'
                }`}
              >
                <List size={18} />
              </button>
            </div>
            <button
              onClick={fetchAllMaterials}
              className="btn-secondary p-4"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Materials Grid/List */}
          {filteredMaterials.length === 0 ? (
            <div className="card-dark rounded-3xl p-12 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-dark-600" />
              <p className="text-dark-400">No materials found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <div key={material.id} className="card-dark rounded-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${TYPE_CONFIG[material.type]?.color} bg-current/10`}>
                        {getMaterialIcon(material.type)}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        material.isFree ? 'bg-green-500/10 text-green-400' : 'bg-dark-700 text-dark-400'
                      }`}>
                        {material.isFree ? 'Free' : 'Paid'}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-dark-300 mb-1 line-clamp-2">{material.title}</h3>
                    {material.description && (
                      <p className="text-dark-500 text-xs mb-3 line-clamp-2">{material.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-dark-500 mb-4">
                      <span>{new Date(material.createdAt || '').toLocaleDateString()}</span>
                      <span className="capitalize">{material.type.toLowerCase().replace('_', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditMaterial(material)}
                        className="flex-1 btn-secondary inline-flex items-center justify-center gap-2 text-sm py-2"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <a
                        href={material.fileUrl || material.videoUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded-lg ${
                          material.fileUrl || material.videoUrl
                            ? 'btn-secondary' 
                            : 'btn-secondary opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        onClick={() => handleDeleteMaterial(material.id!)}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-dark rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Type</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Title</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Module</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Access</th>
                    <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Created</th>
                    <th className="text-right px-6 py-4 text-dark-400 text-xs font-medium uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800">
                  {filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-dark-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className={`${TYPE_CONFIG[material.type]?.color}`}>
                          {getMaterialIcon(material.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-dark-300 text-sm">{material.title}</div>
                        {material.description && (
                          <div className="text-dark-500 text-xs mt-1">{material.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-dark-400 text-sm">
                        {material.moduleId ? 'Module ' + material.moduleId.slice(0, 8) : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-lg ${
                          material.isFree ? 'bg-green-500/10 text-green-400' : 'bg-dark-700 text-dark-400'
                        }`}>
                          {material.isFree ? 'Free' : 'Paid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-dark-400 text-sm">
                        {new Date(material.createdAt || '').toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditMaterial(material)}
                            className="p-2 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <a
                            href={material.fileUrl || material.videoUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg transition-colors ${
                              material.fileUrl || material.videoUrl
                                ? 'text-dark-400 hover:text-brand-400 hover:bg-brand-500/10' 
                                : 'text-dark-600 cursor-not-allowed'
                            }`}
                          >
                            <Eye size={14} />
                          </a>
                          <button
                            onClick={() => handleDeleteMaterial(material.id!)}
                            className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Material Modal */}
      {showEditModal && editingMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold text-dark-300 mb-4">Edit Material</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Title</label>
                <input
                  type="text"
                  value={editingMaterial.title}
                  onChange={e => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                  className="input-dark w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Description</label>
                <textarea
                  value={editingMaterial.description || ''}
                  onChange={e => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                  rows={3}
                  className="input-dark w-full resize-y"
                />
              </div>

              {editingMaterial.type === 'VIDEO_LINK' && (
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">Video URL</label>
                  <input
                    type="url"
                    value={editingMaterial.videoUrl || ''}
                    onChange={e => setEditingMaterial({ ...editingMaterial, videoUrl: e.target.value })}
                    className="input-dark w-full"
                  />
                </div>
              )}

              {editingMaterial.type === 'TEXT' && (
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">Content</label>
                  <textarea
                    value={editingMaterial.content || ''}
                    onChange={e => setEditingMaterial({ ...editingMaterial, content: e.target.value })}
                    rows={6}
                    className="input-dark w-full resize-y font-mono text-sm"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-dark-900 rounded-xl">
                <div>
                  <div className="text-dark-300 text-sm font-medium">Free Preview</div>
                  <div className="text-dark-400 text-xs">Allow non-enrolled users to see this material</div>
                </div>
                <button
                  onClick={() => setEditingMaterial({ ...editingMaterial, isFree: !editingMaterial.isFree })}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                    editingMaterial.isFree ? 'bg-brand-500' : 'bg-dark-600'
                  }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                    editingMaterial.isFree ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMaterial(null)
                }}
                className="flex-1 btn-secondary py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMaterial}
                className="flex-1 btn-primary py-2"
              >
                Update Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}