'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Star, BookOpen, Users, Clock,
  ChevronDown, Grid, List, ArrowLeft, X,
  CreditCard, Loader, CheckCircle, AlertCircle
} from 'lucide-react'

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => { openIframe: () => void }
    }
  }
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  price: number
  currency: string
  level: string
  duration?: string
  language: string
  tutor: { id: string; name: string; avatar?: string }
  category?: { id: string; name: string }
  avgRating: number
  totalStudents: number
  totalModules: number
  isEnrolled?: boolean
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({ course, onClose, onSuccess }: {
  course: Course
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paystackLoaded, setPaystackLoaded] = useState(false)

  useEffect(() => {
    // Inject Paystack script if not already present
    if (window.PaystackPop) {
      setPaystackLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.onload = () => setPaystackLoaded(true)
    script.onerror = () => setError('Failed to load Paystack. Check your internet connection.')
    document.head.appendChild(script)

    const check = setInterval(() => {
      if (window.PaystackPop) {
        setPaystackLoaded(true)
        clearInterval(check)
      }
    }, 200)
    return () => clearInterval(check)
  }, [])

  const initializePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      // Step 1: create pending payment record → get paymentId + email + amount
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course.id, provider: 'paystack' }),
      })

      const data = await res.json()
      console.log('Payment init response:', data)

      if (!res.ok) throw new Error(data.error || 'Payment initialization failed')

      // Free course — already enrolled
      if (data.data.isFree) {
        onSuccess()
        return
      }

      if (!window.PaystackPop) throw new Error('Paystack not loaded. Please refresh.')

      const { paymentId, email, amount, currency, metadata } = data.data

      // Step 2: define verify as a plain async function OUTSIDE the setup call
      const verifyPayment = async (reference: string) => {
        setLoading(true)
        try {
          const verifyRes = await fetch('/api/payments/test-verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ paymentId, reference }),
          })
          const verifyData = await verifyRes.json()
          console.log('Verify response:', verifyData)
          if (verifyRes.ok) {
            onSuccess()
          } else {
            setError(verifyData.error || 'Verification failed. Contact support.')
            setLoading(false)
          }
        } catch (err) {
          console.error('Verify fetch error:', err)
          setError('Network error during verification. Please contact support.')
          setLoading(false)
        }
      }

      // Step 3: open Paystack popup — callback must be a plain (non-async) function
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // kobo
        currency,
        ref: paymentId,
        metadata: { ...metadata, paymentId },

        // Plain function — calls the async helper via .then() so Paystack is happy
        callback: function(response: { reference: string }) {
          console.log('Paystack callback — reference:', response.reference)
          verifyPayment(response.reference)
        },

        onClose: function() {
          console.log('Paystack modal closed by user')
          setLoading(false)
        },
      })

      handler.openIframe()
    } catch (err: any) {
      console.error('Payment error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark-300">Complete Enrollment</h2>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Course info */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-dark-900 rounded-xl">
          <div className="w-14 h-14 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
            {course.thumbnail
              ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-lg" />
              : <BookOpen size={22} className="text-dark-500" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">{course.title}</h3>
            <p className="text-dark-400 text-xs">by {course.tutor.name}</p>
            <p className="text-brand-400 font-bold mt-1">
              {course.currency} {course.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <CreditCard size={14} className="text-brand-400" />
            Cards, Bank Transfer, USSD via Paystack
          </div>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <CheckCircle size={14} className="text-green-400" />
            Instant access after payment
          </div>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <CheckCircle size={14} className="text-green-400" />
            7-day money-back guarantee
          </div>
        </div>

        {!paystackLoaded && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl p-3 text-sm flex items-center gap-2">
            <Loader size={14} className="animate-spin" />
            Loading payment gateway...
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary py-3" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={initializePayment}
            disabled={loading || !paystackLoaded}
            className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              : !paystackLoaded ? 'Loading...' : `Pay ${course.currency} ${course.price.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentExplorePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [categories, setCategories] = useState<any[]>([])
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchEnrolledCourses()
    // Check for ?payment=success in URL (redirect from Paystack)
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      setSuccessMsg('Payment successful! You are now enrolled.')
      fetchEnrolledCourses()
      window.history.replaceState({}, '', '/dashboard/student/explore')
      setTimeout(() => setSuccessMsg(''), 5000)
    }
  }, [])

  useEffect(() => { fetchCourses() }, [selectedCategory, selectedLevel, sortBy, pagination.page])

  // Re-mark enrolled after enrolledIds updates
  useEffect(() => {
    setCourses(prev => prev.map(c => ({ ...c, isEnrolled: enrolledIds.has(c.id) })))
  }, [enrolledIds])

  async function fetchEnrolledCourses() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/enrollments', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setEnrolledIds(new Set((data.data || []).map((e: any) => String(e.courseId))))
    } catch (e) { console.error('fetchEnrolledCourses error:', e) }
  }

  async function fetchCourses() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '12',
        status: 'PUBLISHED',
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedLevel !== 'all' && { level: selectedLevel }),
        ...(search && { search }),
      })

      const res = await fetch(`/api/courses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      setCourses((data.data || []).map((c: Course) => ({ ...c, isEnrolled: enrolledIds.has(c.id) })))
      setPagination(prev => ({
        ...prev,
        total: data.meta?.total || 0,
        pages: data.meta?.totalPages || 1,
      }))
    } catch (e) {
      console.error('fetchCourses error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollClick = (course: Course) => {
    if (course.price === 0) {
      handleFreeEnroll(course.id)
    } else {
      setSelectedCourse(course)
      setShowPaymentModal(true)
    }
  }

  const handleFreeEnroll = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) {
        setEnrolledIds(prev => {
          const next = new Set<string>()
          prev.forEach(id => next.add(id))
          next.add(courseId)
          return next
        })
        setSuccessMsg('Enrolled successfully!')
        setTimeout(() => setSuccessMsg(''), 4000)
      }
    } catch (e) { console.error('Free enroll error:', e) }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false)
    setSelectedCourse(null)
    fetchEnrolledCourses()
    setSuccessMsg('Payment successful! You are now enrolled.')
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const clearFilters = () => {
    setSearch(''); setSelectedCategory('all'); setSelectedLevel('all'); setSortBy('popular')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const levelColor: Record<string, string> = {
    Beginner: 'bg-green-500/10 text-green-400',
    Intermediate: 'bg-yellow-500/10 text-yellow-400',
    Advanced: 'bg-red-500/10 text-red-400',
    'All Levels': 'bg-blue-500/10 text-blue-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/student" className="text-dark-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-black text-dark-400">Explore Courses</h1>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl p-4">
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="card-dark rounded-2xl p-4 flex items-center gap-3">
        <Search size={16} className="text-dark-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchCourses()}
          placeholder="Search courses..."
          className="flex-1 bg-transparent outline-none text-sm text-white placeholder-dark-500"
        />
        <button onClick={fetchCourses} className="btn-primary text-sm px-4 py-2">Search</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {[
          {
            value: selectedLevel, onChange: setSelectedLevel,
            options: [['all','All Levels'],['Beginner','Beginner'],['Intermediate','Intermediate'],['Advanced','Advanced']],
          },
          {
            value: sortBy, onChange: setSortBy,
            options: [['popular','Most Popular'],['newest','Newest'],['price_low','Price: Low→High'],['price_high','Price: High→Low']],
          },
        ].map((f, i) => (
          <div key={i} className="relative">
            <select
              value={f.value}
              onChange={e => { f.onChange(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
              className="card-dark rounded-xl px-4 py-2.5 pr-9 appearance-none text-sm text-white cursor-pointer">
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>
        ))}

        {/* Grid/List toggle */}
        <div className="flex items-center gap-1 bg-dark-800 rounded-xl p-1">
          {(['grid', 'list'] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`p-2 rounded-lg transition-colors ${viewMode === m ? 'bg-brand-500 text-white' : 'text-dark-400 hover:text-white'}`}>
              {m === 'grid' ? <Grid size={15} /> : <List size={15} />}
            </button>
          ))}
        </div>

        {(selectedCategory !== 'all' || selectedLevel !== 'all' || search) && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-dark-400 hover:text-white px-2">
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      <p className="text-dark-500 text-sm">{courses.length} of {pagination.total} courses</p>

      {/* Course Grid */}
      {loading && courses.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-dark-400">Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <BookOpen size={40} className="mx-auto mb-4 text-dark-600" />
          <h3 className="text-white font-bold mb-2">No courses found</h3>
          <p className="text-dark-400 mb-4">Try different search terms or filters.</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map(course => (
            <div key={course.id} className="card-dark card-hover rounded-2xl overflow-hidden group">
              <div className="h-36 bg-gradient-to-br from-dark-800 to-dark-900 relative flex items-center justify-center">
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <BookOpen size={28} className="text-dark-600" />}
                <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-lg font-medium ${levelColor[course.level] || 'bg-dark-700 text-dark-400'}`}>
                  {course.level}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-dark-300 text-sm mb-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-dark-500 text-xs mb-2">by {course.tutor.name}</p>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-yellow-400">{(course.avgRating || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-dark-500 text-xs">
                    <Users size={11} />
                    {course.totalStudents || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${course.price === 0 ? 'text-green-400' : 'text-brand-400'}`}>
                    {course.price === 0 ? 'Free' : `${course.currency} ${course.price.toLocaleString()}`}
                  </span>

                  {course.isEnrolled ? (
                    <Link href={`/dashboard/student/courses/${course.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white transition-colors">
                      Continue
                    </Link>
                  ) : (
                    <button onClick={() => handleEnrollClick(course)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors">
                      {course.price === 0 ? 'Enroll' : 'Buy Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className="card-dark rounded-2xl p-4 flex gap-4 hover:border-brand-500/30 border border-dark-700 transition-all">
              <div className="w-28 h-20 rounded-xl bg-dark-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  : <BookOpen size={22} className="text-dark-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-0.5 truncate">{course.title}</h3>
                <p className="text-dark-500 text-xs mb-2">by {course.tutor.name}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={11} className="fill-yellow-400" />{(course.avgRating || 0).toFixed(1)}
                  </span>
                  <span className="text-dark-500">{course.totalStudents || 0} students</span>
                  <span className={`px-2 py-0.5 rounded-lg ${levelColor[course.level] || 'bg-dark-700 text-dark-400'}`}>{course.level}</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right flex flex-col justify-between">
                <span className={`font-bold ${course.price === 0 ? 'text-green-400' : 'text-brand-400'}`}>
                  {course.price === 0 ? 'Free' : `${course.currency} ${course.price.toLocaleString()}`}
                </span>
                {course.isEnrolled ? (
                  <Link href={`/dashboard/student/courses/${course.id}`}
                    className="text-sm px-4 py-2 rounded-xl bg-brand-500/10 text-brand-400 hover:bg-brand-500 hover:text-white transition-colors">
                    Continue
                  </Link>
                ) : (
                  <button onClick={() => handleEnrollClick(course)}
                    className="text-sm px-4 py-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors">
                    {course.price === 0 ? 'Enroll' : 'Buy Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-dark-500 text-sm">Page {pagination.page} of {pagination.pages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1} className="btn-secondary px-4 py-2 disabled:opacity-40">
              Previous
            </button>
            <button onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.pages} className="btn-secondary px-4 py-2 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          onClose={() => { setShowPaymentModal(false); setSelectedCourse(null) }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
