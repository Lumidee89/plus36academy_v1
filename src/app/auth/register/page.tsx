'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, BookOpen, Users, Shield } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Store token
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data.user))

      // Redirect based on role
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
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0d0d0f 0%, rgba(255,122,13,0.15) 100%)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,122,13,0.08) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255,122,13,0.08) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />

        <div className="relative p-16 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-16">
              {/* <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white">
                P36
              </div> */}
              <span className="font-display text-2xl font-bold text-white">Plus36 Academy</span>
            </div>

            <h2 className="font-display text-4xl font-black text-white mb-4">
              Begin Your <br />
              <span className="gradient-text">Transformation</span>
            </h2>
            <p className="text-dark-400 text-lg mb-12">
              Join the fastest-growing learning community in Africa.
            </p>

            <div className="space-y-6">
              {[
                { icon: <BookOpen size={20} />, text: '284+ expert-led courses' },
                { icon: <Users size={20} />, text: '12,847+ active learners' },
                { icon: <Shield size={20} />, text: '7-day money-back guarantee' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-dark-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                    {item.icon}
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="text-white font-semibold">Chidi enrolled just now</div>
                <div className="text-dark-400 text-sm">Full-Stack Web Development</div>
              </div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="text-dark-400 hover:text-brand-400 text-sm transition-colors mb-6 block">
              ← Back to home
            </Link>
            <h1 className="font-display text-3xl font-black text-white mb-2">Create your account</h1>
            <p className="text-dark-400">Already have one? <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">Sign in</Link></p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { role: 'STUDENT', label: 'I want to learn', emoji: '🎓' },
              { role: 'TUTOR', label: 'I want to teach', emoji: '👨‍🏫' },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => setForm({ ...form, role: r.role })}
                className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 ${
                  form.role === r.role
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-dark-700 hover:border-dark-500'
                }`}>
                <div className="text-2xl mb-1">{r.emoji}</div>
                <div className={`text-sm font-medium ${form.role === r.role ? 'text-brand-400' : 'text-dark-300'}`}>
                  {r.label}
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Chidi Okwu"
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
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
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
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
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-dark-500 text-xs text-center mt-6">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-brand-400 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-brand-400 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
