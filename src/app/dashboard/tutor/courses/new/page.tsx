'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Upload, Image, X, CheckCircle } from 'lucide-react'

async function uploadFile(file: File, token: string | null): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/materials/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data.data?.url || data.url
}

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'NGN',
    level: 'Beginner',
    language: 'English',
    requirements: '' as any,
    objectives: '' as any,
    tags: '' as any,
    isFreemium: false,
    thumbnail: '',
    categoryId: '' as any,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setShowSuccess(false)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        requirements: String(form.requirements || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        objectives: String(form.objectives || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        tags: String(form.tags || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
      }

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create course')

      // Show success message
      setSuccessMessage(data.message || 'Course created successfully!')
      setShowSuccess(true)

      // Wait 2 seconds then redirect to my courses page
      setTimeout(() => {
        router.push('/dashboard/tutor/courses')
      }, 2000)

    } catch (e: any) {
      setError(e.message || 'Failed to create course')
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const url = await uploadFile(file, localStorage.getItem('token'))
      setForm(prev => ({ ...prev, thumbnail: url }))
    } catch (err: any) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/tutor/courses" className="text-brand-600 inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
      </div>

      <div className="card-dark rounded-2xl p-6 relative">
        {/* Success Toast/Popup */}
        {showSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-slide-down">
            <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-4 max-w-md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-800">Success!</h3>
                  <p className="mt-1 text-sm text-green-700">{successMessage}</p>
                  <p className="mt-2 text-xs text-green-600">Redirecting to your courses...</p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="flex-shrink-0 text-green-600 hover:text-green-800"
                >
                  <X size={18} />
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1 bg-green-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 rounded-full animate-progress"></div>
              </div>
            </div>
          </div>
        )}

        <h1 className="font-display text-2xl font-black text-gray-900 mb-4">Create New Course</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Title</label>
            <input
              className="input-dark"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
            <textarea
              className="input-dark h-32"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              required
              minLength={20}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Price</label>
              <input
                type="number"
                className="input-dark"
                value={form.price}
                onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Currency</label>
              <input
                className="input-dark"
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Level</label>
              <input
                className="input-dark"
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Language</label>
              <input
                className="input-dark"
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Category ID (optional)</label>
              <input
                className="input-dark"
                value={form.categoryId as any}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Freemium</label>
              <select
                className="input-dark"
                value={String(form.isFreemium)}
                onChange={e => setForm({ ...form, isFreemium: e.target.value === 'true' })}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Requirements (comma separated)</label>
              <input
                className="input-dark"
                value={form.requirements as any}
                onChange={e => setForm({ ...form, requirements: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Objectives (comma separated)</label>
              <input
                className="input-dark"
                value={form.objectives as any}
                onChange={e => setForm({ ...form, objectives: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Tags (comma separated)</label>
            <input
              className="input-dark"
              value={form.tags as any}
              onChange={e => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Thumbnail URL</label>
              <input
                className="input-dark"
                value={form.thumbnail}
                onChange={e => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Upload Thumbnail</label>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  {form.thumbnail ? (
                    <div className="relative group">
                      <div className="aspect-video bg-dark-800 rounded-lg overflow-hidden border border-dark-700">
                        <img 
                          src={form.thumbnail} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Invalid+Image'
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, thumbnail: '' }))}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        id="thumbnail-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                          uploading 
                            ? 'border-brand-500/30 bg-brand-500/5' 
                            : 'border-dark-700 hover:border-brand-500/50 hover:bg-dark-800/50'
                        }`}
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center py-4">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-xs text-dark-400">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center py-4">
                            <Upload size={24} className="text-dark-400 mb-2" />
                            <span className="text-xs text-dark-400 text-center px-2">
                              Click to upload<br />PNG, JPG, GIF up to 5MB
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  )}
                </div>
                
                {form.thumbnail && (
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('thumbnail-upload') as HTMLInputElement
                      if (input) input.value = ''
                      setForm(prev => ({ ...prev, thumbnail: '' }))
                    }}
                    className="p-2 text-dark-400 hover:text-red-400 transition-colors"
                    title="Remove thumbnail"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || uploading} className="btn-primary inline-flex items-center gap-2">
              {loading ? 'Creating...' : (<><span>Create Course</span> <ArrowRight size={16} /></>)}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm rounded-xl p-3">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Add these styles to your global CSS or in a style tag */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-progress {
          animation: progress 2s linear;
        }
      `}</style>
    </div>
  )
}