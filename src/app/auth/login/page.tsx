'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      const role = data.data.user.role
      if (role === 'ADMIN') router.push('/dashboard/admin')
      else if (role === 'TUTOR') router.push('/dashboard/tutor')
      else router.push('/dashboard/student')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            {/* <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white">
              P36
            </div> */}
            <span className="font-display text-2xl font-bold text-white">Plus36 Academy</span>
          </Link>
          <h1 className="font-display text-3xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-dark-400">
            New here?{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create an account
            </Link>
          </p>
        </div>

        <div className="card-dark rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                className="input-dark"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-dark-300">Password</label>
                <Link href="/auth/forgot-password" className="text-sm text-brand-400 hover:text-brand-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
                  className="input-dark pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base 
                disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          {/* <div className="mt-6 pt-6 border-t border-dark-700"> */}
            {/* <p className="text-dark-500 text-xs text-center mb-3">Quick demo login</p> */}
            {/* <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Student', email: 'student@demo.com', role: 'student' },
                { label: 'Tutor', email: 'tutor@demo.com', role: 'tutor' },
                { label: 'Admin', email: 'admin@demo.com', role: 'admin' },
              ].map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => setForm({ email: demo.email, password: 'demo1234' })}
                  className="text-xs py-2 px-3 bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white
                    rounded-lg transition-colors">
                  {demo.label}
                </button>
              ))}
            </div> */}
            {/* <p className="text-dark-600 text-xs text-center mt-2">Password: demo1234</p> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  )
}
