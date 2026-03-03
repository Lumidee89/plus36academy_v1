'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Zap } from 'lucide-react'
import Image from 'next/image'

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
            {/* <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-8">
              <Zap size={13} className="text-brand-600" />
              <span className="text-brand-700 text-xs font-semibold">#1 Platform in West Africa</span>
            </div> */}

            <h2 className="font-display text-4xl font-black text-gray-900 leading-tight tracking-tight mb-4">
              Good to have you
              <span className="gradient-text"> back.</span>
            </h2>
            <p className="text-gray-500 text-base leading-relaxed max-w-xs">
              Pick up right where you left off. Your courses, progress, and community are waiting.
            </p>

            {/* Mini stat pills */}
            <div className="flex flex-col gap-3 mt-10">
              {[
                { val: '12,847+', label: 'Active learners' },
                { val: '284+', label: 'Expert courses' },
                { val: '94%', label: 'Career improvement rate' },
              ].map((s, i) => (
                <div key={i}
                  className="flex items-center gap-4 glass-card rounded-2xl px-5 py-3.5 border border-brand-500/10">
                  <span className="font-display font-black text-xl gradient-text">{s.val}</span>
                  <span className="text-gray-500 text-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial snippet */}
          <div className="glass-card rounded-2xl p-5 border border-gray-200">
            <p className="text-gray-600 text-sm italic leading-relaxed mb-3">
              <span className="text-brand-500 font-display text-lg">"</span>
              I went from zero coding knowledge to a ₦4.5M/year role in 8 months.
              <span className="text-brand-500 font-display text-lg">"</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-lg">👨🏿‍💻</div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Chidi Okwu</div>
                <div className="text-xs text-gray-400">Software Engineer @ Flutterwave</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-white">
        <div className="w-full max-w-md">

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
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">
              New here?{' '}
              <Link href="/auth/register" className="text-brand-600 hover:text-brand-500 font-semibold">
                Create a free account
              </Link>
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <Link href="/auth/forgot-password"
                    className="text-xs text-brand-600 hover:text-brand-500 font-medium">
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
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
                  <>Sign In <ArrowRight size={17} /></>
                )}
              </button>
            </form>
          </div>

          {/* Terms */}
          <p className="text-gray-400 text-xs text-center mt-6">
            By signing in, you agree to our{' '}
            <Link href="#" className="text-brand-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="text-brand-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
