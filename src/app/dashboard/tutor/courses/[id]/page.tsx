'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'

interface CourseForm {
  title: string
  description: string
  price: number
  currency: string
  level: string
  language: string
  requirements: string[]
  objectives: string[]
  tags: string[]
  isFreemium?: boolean
  thumbnail?: string
  status?: string
}

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

export default function EditCoursePage() {
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<CourseForm | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])

  async function loadCourse() {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`/api/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to load course')
    const c = data.data || data
    
    // Parse JSON fields if they're strings
    const parseJsonField = (field: any): string[] => {
      if (!field) return []
      if (Array.isArray(field)) return field
      try {
        return JSON.parse(field)
      } catch {
        return []
      }
    }

    setForm({
      title: c.title || '',
      description: c.description || '',
      price: Number(c.price || 0),
      currency: c.currency || 'NGN',
      level: c.level || 'Beginner',
      language: c.language || 'English',
      requirements: parseJsonField(c.requirements),
      objectives: parseJsonField(c.objectives),
      tags: parseJsonField(c.tags),
      isFreemium: c.isFreemium || false,
      thumbnail: c.thumbnail || '',
      status: c.status || 'DRAFT',
    })
  } catch (e: any) {
    setError(e.message || 'Failed to load course')
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    if (id) loadCourse()
    // load categories (replace with your real endpoint if different)
    ;(async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('/api/courses?categories=list', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        const data = await res.json()
        const cats = data.categories || data.data?.categories || []
        if (Array.isArray(cats)) setCategories(cats)
      } catch {
        setCategories([])
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function saveCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      router.push('/dashboard/tutor/courses')
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card-dark rounded-2xl p-8">Loading...</div>
  }

  if (!form) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error || 'Course not found'}</p>
        <Link href="/dashboard/tutor/courses" className="text-brand-600 text-sm inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/tutor/courses" className="text-brand-600 inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
      </div>

      <div className="card-dark rounded-2xl p-6">
        <h1 className="font-display text-2xl font-black text-gray-900 mb-4">Edit Course</h1>
        <form className="space-y-4" onSubmit={saveCourse}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Title</label>
              <input
                className="input-dark"
                value={form.title}
                onChange={e => setForm({ ...form!, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Currency</label>
              <input
                className="input-dark"
                value={form.currency}
                onChange={e => setForm({ ...form!, currency: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Price</label>
              <input
                type="number"
                className="input-dark"
                value={form.price}
                onChange={e => setForm({ ...form!, price: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Level</label>
              <input
                className="input-dark"
                value={form.level}
                onChange={e => setForm({ ...form!, level: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Language</label>
              <input
                className="input-dark"
                value={form.language}
                onChange={e => setForm({ ...form!, language: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Status</label>
              <select
                className="input-dark"
                value={form.status}
                onChange={e => setForm({ ...form!, status: e.target.value })}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Freemium</label>
              <select
                className="input-dark"
                value={String(form.isFreemium)}
                onChange={e => setForm({ ...form!, isFreemium: e.target.value === 'true' })}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Thumbnail Upload</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const url = await uploadFile(file, localStorage.getItem('token'))
                    setForm(prev => ({ ...prev!, thumbnail: url }))
                  } catch (err: any) {
                    alert(err.message || 'Upload failed')
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Description</label>
            <textarea
              className="input-dark h-40"
              value={form.description}
              onChange={e => setForm({ ...form!, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Requirements (comma separated)</label>
              <input
                className="input-dark"
                value={(form.requirements || []).join(', ')}
                onChange={e => setForm({ ...form!, requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Objectives (comma separated)</label>
              <input
                className="input-dark"
                value={(form.objectives || []).join(', ')}
                onChange={e => setForm({ ...form!, objectives: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Tags (comma separated)</label>
            <input
              className="input-dark"
              value={(form.tags || []).join(', ')}
              onChange={e => setForm({ ...form!, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1">Thumbnail URL</label>
            <input
              className="input-dark"
              value={form.thumbnail || ''}
              onChange={e => setForm({ ...form!, thumbnail: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/dashboard/tutor/courses" className="btn-secondary">Cancel</Link>
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm rounded-xl p-3">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
