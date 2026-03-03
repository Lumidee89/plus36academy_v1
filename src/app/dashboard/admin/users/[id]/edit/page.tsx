'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, AlertCircle } from 'lucide-react'

export default function AdminUserEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'STUDENT',
    phone: '',
    bio: '',
    isVerified: false,
    isActive: true,
  })

  useEffect(() => {
    fetchUser()
  }, [params.id])

  async function fetchUser() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch user')
      
      setForm({
        name: data.data.name || '',
        email: data.data.email || '',
        role: data.data.role || 'STUDENT',
        phone: data.data.phone || '',
        bio: data.data.bio || '',
        isVerified: data.data.isVerified || false,
        isActive: data.data.isActive ?? true,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update user')
      
      setSuccess('User updated successfully!')
      setTimeout(() => {
        router.push(`/dashboard/admin/users/${params.id}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
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
          <p className="text-dark-400">Loading user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-dark-400 hover:text-dark-300">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display text-2xl font-black text-dark-300">Edit User</h1>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">✓</div>
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="card-dark rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-dark-800">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
            {form.name[0] || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-300">{form.name}</h2>
            <p className="text-sm text-dark-500">User ID: {params.id.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="input-dark w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">Email *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="input-dark w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">Phone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="input-dark w-full pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">Role</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="input-dark w-full"
            >
              <option value="STUDENT">Student</option>
              <option value="TUTOR">Tutor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="input-dark w-full resize-y"
              placeholder="Write a short bio..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 text-sm font-medium">Verified Account</div>
                <div className="text-dark-400 text-xs">Mark this user as verified</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isVerified: !form.isVerified })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  form.isVerified ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  form.isVerified ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 text-sm font-medium">Account Active</div>
                <div className="text-dark-400 text-xs">User can access the platform</div>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  form.isActive ? 'bg-green-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  form.isActive ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary px-6 py-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2 px-6 py-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}