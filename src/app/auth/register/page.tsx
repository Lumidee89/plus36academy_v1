'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, BookOpen, Users, Shield, Star } from 'lucide-react'
import Image from 'next/image'

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
    <div className="min-h-screen bg-white flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-gray-50 flex-col">
        {/* Soft radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_50%,rgba(34,197,94,0.1)_0%,transparent_70%)]" />

        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(34,197,94,0.15) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse 80% 80% at 30% 50%, black 0%, transparent 100%)',
          }}
        />

        <div className="relative flex flex-col justify-between h-full p-14">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Plus36 Academy"
              width={140}
              height={28}
              className="object-contain"
              priority
            />
          </Link>

          {/* Centre copy */}
          <div>
            <h2 className="font-display text-4xl font-black text-gray-900 leading-tight tracking-tight mb-4">
              Begin Your
              <span className="gradient-text"> Transformation.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed max-w-xs mb-10">
              Join the fastest-growing learning community in Africa and take the first step toward the career you deserve.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-4">
              {[
                { icon: <BookOpen size={18} />, text: '284+ expert-led courses' },
                { icon: <Users size={18} />, text: '12,847+ active learners' },
                { icon: <Shield size={18} />, text: '7-day money-back guarantee' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/15 flex items-center justify-center text-brand-600 flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-gray-700 text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live activity card */}
          <div className="glass-card rounded-2xl p-5 border border-gray-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🎯</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Amina just enrolled</div>
                <div className="text-xs text-gray-400 mt-0.5">Data Science & Analytics</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            </div>
            {/* Rating row */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Star key={i} size={11} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <span className="text-xs text-gray-500">247 students enrolled today</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Plus36 Academy"
                width={130}
                height={26}
                className="object-contain mx-auto"
                priority
              />
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="text-gray-400 hover:text-brand-600 text-sm transition-colors mb-6 inline-block">
              ← Back to home
            </Link>
            <h1 className="font-display text-3xl font-black text-gray-900 tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm">
              Already have one?{' '}
              <Link href="/auth/login" className="text-brand-600 hover:text-brand-500 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { role: 'STUDENT', label: 'I want to learn', emoji: '🎓', sub: 'Access 284+ courses' },
              { role: 'TUTOR', label: 'I want to teach', emoji: '👨‍🏫', sub: 'Earn while you share' },
            ].map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => setForm({ ...form, role: r.role })}
                className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  form.role === r.role
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                <div className="text-2xl mb-2">{r.emoji}</div>
                <div className={`text-sm font-semibold mb-0.5 ${form.role === r.role ? 'text-brand-700' : 'text-gray-800'}`}>
                  {r.label}
                </div>
                <div className="text-xs text-gray-400">{r.sub}</div>
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Chidi Okwu"
                  className="input-dark"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@email.com"
                  className="input-dark"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Password strength hint */}
                {form.password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          form.password.length >= i * 2
                            ? form.password.length >= 8 ? 'bg-brand-500' : 'bg-yellow-400'
                            : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base
                  disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl mt-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create Account <ArrowRight size={17} /></>
                )}
              </button>
            </form>
          </div>

          {/* Terms */}
          <p className="text-gray-400 text-xs text-center mt-6">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-brand-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-brand-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
