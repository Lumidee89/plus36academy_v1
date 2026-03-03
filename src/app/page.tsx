'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen, Users, Award, TrendingUp, Play, Star, CheckCircle,
  ArrowRight, ChevronDown, Zap, Globe, Shield, Clock, MessageSquare,
  Code, BarChart3, Camera, Mic, Palette, Menu, X
} from 'lucide-react'

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200 py-3 shadow-sm'
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <Image
              src="/images/logo.png"
              alt="Plus36 Academy"
              width={140}
              height={28}
              className="object-contain"
              priority
            />
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {['Courses', 'Tutors', 'About', 'Blog'].map(item => (
              <Link key={item} href={`#${item.toLowerCase()}`}
                className="text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
                {item}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
              Start Learning <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-700 hover:text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden glass-card mx-4 mb-4 mt-2 rounded-2xl p-6 animate-scale-in shadow-xl">
            <div className="flex flex-col gap-4">
              {['Courses', 'Tutors', 'About', 'Blog'].map(item => (
                <Link key={item} href={`#${item.toLowerCase()}`}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}>
                  {item}
                </Link>
              ))}
              <hr className="border-gray-200" />
              <Link href="/auth/login" className="text-gray-600 font-medium hover:text-brand-600">Sign In</Link>
              <Link href="/auth/register" className="btn-primary text-center text-sm">
                Start Learning
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const [count, setCount] = useState({ students: 0, courses: 0, tutors: 0 })

  useEffect(() => {
    const targets = { students: 12847, courses: 284, tutors: 96 }
    const duration = 2000
    const steps = 60
    let step = 0
    const timer = setInterval(() => {
      step++
      const eased = 1 - Math.pow(1 - step / steps, 3)
      setCount({
        students: Math.floor(targets.students * eased),
        courses: Math.floor(targets.courses * eased),
        tutors: Math.floor(targets.tutors * eased),
      })
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-overlay bg-white">
      {/* Soft radial tint */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(34,197,94,0.08)_0%,transparent_70%)]" />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-32 pb-28">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-10 animate-slide-in-up border border-brand-500/20">
          <Zap size={13} className="text-brand-500" />
          <span className="text-sm text-gray-600">#1 Learning Platform in West Africa</span>
          <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">New</span>
        </div>

        {/* Headline */}
        <h1
          className="font-display text-5xl md:text-7xl lg:text-[88px] font-black leading-[1.02] tracking-tight mb-7 text-gray-900 animate-slide-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          Code Your Future.<br />
          <span className="gradient-text">Lead the Digital</span><br />
          <span className="gradient-text">Revolution.</span>
        </h1>

        <p
          className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed animate-slide-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Join <span className="text-gray-900 font-semibold">12,847+ learners</span> transforming their
          careers with expert-led courses in tech, business, design, and beyond.{' '}
          <span className="text-brand-600 font-medium">Your breakthrough starts today.</span>
        </p>

        {/* Social proof row */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-slide-in-up"
          style={{ animationDelay: '0.25s' }}
        >
          <div className="flex -space-x-2">
            {['🧑🏿‍💻', '👩🏽‍🎨', '👨🏾‍💼', '👩🏿‍🔬', '🧑🏽‍🏫'].map((e, i) => (
              <div key={i}
                className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-base shadow-sm">
                {e}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <span className="text-gray-600 text-sm">4.9/5 from 3,200+ reviews</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Link href="/auth/register"
            className="group btn-primary text-base px-8 py-4 flex items-center gap-3 animate-pulse-glow rounded-2xl">
            <Zap size={18} />
            Start Learning Today
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <button className="flex items-center gap-3 btn-secondary px-8 py-4 rounded-2xl text-base">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center shadow-md shadow-brand-500/30 glow-orange">
              <Play size={14} className="text-white ml-0.5" fill="white" />
            </div>
            Watch Demo (2 min)
          </button>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-3 divide-x divide-gray-200 max-w-md mx-auto border border-gray-200 rounded-2xl overflow-hidden shadow-sm animate-slide-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          {[
            { val: count.students.toLocaleString(), lbl: 'Students Enrolled' },
            { val: count.courses, lbl: 'Expert Courses' },
            { val: count.tutors, lbl: 'World-Class Tutors' },
          ].map((s, i) => (
            <div key={i} className="py-5 px-4 text-center bg-white">
              <div className="font-display text-2xl font-black gradient-text">{s.val}+</div>
              <div className="text-gray-400 text-xs mt-1 font-medium">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-brand-500 to-transparent" />
          <ChevronDown size={18} className="text-gray-300" />
        </div>
      </div>
    </section>
  )
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee() {
  const logos = ['Afrilabs', 'Plus36 Networks', 'Hypernet', 'Havosoft', 'TrueTech', 'Ace Media', 'Interswitch', 'PayTech']

  return (
    <div className="py-5 overflow-hidden border-y border-gray-100 bg-gray-50">
      <p className="text-center text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
        Our graduates work at Africa's most innovative companies
      </p>
      <div
        className="flex whitespace-nowrap"
        style={{ animation: 'marquee 22s linear infinite' }}
      >
        {[...logos, ...logos].map((logo, i) => (
          <span key={i} className="px-10 text-sm font-bold text-gray-300 uppercase tracking-widest inline-flex items-center gap-6">
            {logo}
            <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
          </span>
        ))}
      </div>
      {/* scoped keyframe — only this one animation, no styles block */}
      <style>{`@keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
    </div>
  )
}

// ─── BENEFITS ────────────────────────────────────────────────────────────────
function Benefits() {
  const benefits = [
    {
      num: '01', icon: <Zap size={22} />, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-600',
      title: 'Learn at Rocket Speed',
      subtitle: 'Structured for results, not just content',
      description: 'Our courses are engineered with spaced repetition and active recall techniques proven to accelerate skill acquisition by 3x. Every module builds deliberately on the last.',
      features: ['Bite-sized lessons (10–20 mins)', 'Hands-on projects & assignments', 'AI-powered learning path', 'Instant feedback & quizzes'],
      checkColor: 'text-brand-500',
      accentBottom: 'from-brand-500 to-brand-300',
    },
    {
      num: '02', icon: <Users size={22} />, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
      title: 'Learn from the Best',
      subtitle: 'Rigorously vetted expert instructors',
      description: 'Only the top 3% of applicants make it onto our platform. Our experts are practitioners — working professionals who teach what they actually do every day.',
      features: ['Industry practitioners only', 'Minimum 5 years experience', 'Ongoing quality reviews', '1-on-1 Q&A sessions'],
      checkColor: 'text-blue-500',
      accentBottom: 'from-blue-500 to-blue-300',
    },
    {
      num: '03', icon: <Award size={22} />, iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
      title: 'Credentials That Open Doors',
      subtitle: 'Recognized by 500+ employers',
      description: "We've partnered with leading tech companies and enterprises across Africa who actively recruit from Plus36 graduates. Your certificate signals verified competence.",
      features: ['Verifiable digital certificates', 'LinkedIn-ready credentials', 'Employer partner network', 'Lifetime certificate access'],
      checkColor: 'text-purple-500',
      accentBottom: 'from-purple-500 to-purple-300',
    },
  ]

  return (
    <section id="courses" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="max-w-xl mb-16">
          <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-5 h-px bg-brand-500" />
            <TrendingUp size={12} /> Why Plus36 Academy
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
            Three Pillars of{' '}
            <span className="gradient-text">Transformation</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            We didn't build another course marketplace. We built a system designed to actually change your life.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden">
          {benefits.map((b, i) => (
            <div key={i} className="group bg-white hover:bg-gray-50 transition-colors duration-300 p-10 relative overflow-hidden">
              {/* Ghost number */}
              <div className="absolute top-6 right-8 font-display text-7xl font-black text-gray-100 select-none leading-none group-hover:text-brand-500/5 transition-colors">
                {b.num}
              </div>

              <div className={`w-12 h-12 rounded-2xl ${b.iconBg} ${b.iconColor} flex items-center justify-center mb-6 relative z-10`}>
                {b.icon}
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{b.subtitle}</p>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3 tracking-tight">{b.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{b.description}</p>

              <ul className="space-y-2.5">
                {b.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle size={14} className={`${b.checkColor} flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Bottom accent bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${b.accentBottom} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Urgency banner */}
        <div className="mt-12 glass-card rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-600 text-sm font-semibold">247 students enrolled in the last 24 hours</span>
            </div>
            <p className="text-gray-500 text-sm">
              Don't let another month pass by. The skills that define the next decade are being mastered right now.
            </p>
          </div>
          <Link href="/auth/register"
            className="btn-primary flex items-center gap-2 whitespace-nowrap px-6 py-3">
            Claim Your Free Spot <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── COURSES PREVIEW ─────────────────────────────────────────────────────────
function CoursesPreview() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCourses, setTotalCourses] = useState(0)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      // Fetch only published courses, limit to 6 for the preview
      const res = await fetch('/api/courses?status=PUBLISHED&limit=6')
      const data = await res.json()
      
      if (res.ok) {
        setCourses(data.data || [])
        setTotalCourses(data.pagination?.total || 0)
      } else {
        console.error('Failed to fetch courses')
        // Fallback to empty array if API fails
        setCourses([])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get tag styling based on course data
  const getTagStyle = (course: any) => {
    // You can customize this logic based on your course data
    // For example, based on enrollment count, level, or custom logic
    if (course._count?.enrollments > 1000) {
      return {
        text: 'BESTSELLER',
        cls: 'bg-yellow-100 text-yellow-700 border-yellow-200'
      }
    } else if (course.level === 'Advanced') {
      return {
        text: 'ADVANCED',
        cls: 'bg-purple-50 text-purple-700 border-purple-200'
      }
    } else if (course.isNew) {
      return {
        text: 'NEW',
        cls: 'bg-green-50 text-green-700 border-green-200'
      }
    } else if (course.tags?.includes('hot')) {
      return {
        text: 'HOT',
        cls: 'bg-red-50 text-red-600 border-red-100'
      }
    }
    return null
  }

  // Helper to get icon based on course category/tags
  const getCourseIcon = (course: any) => {
    // You can map icons based on category or tags
    const iconMap: Record<string, JSX.Element> = {
      'Web Development': <Code size={22} />,
      'Data Science': <BarChart3 size={22} />,
      'Design': <Palette size={22} />,
      'Marketing': <Camera size={22} />,
      'Content Creation': <Mic size={22} />,
      'Cybersecurity': <Globe size={22} />,
    }

    // Try to match by category name
    if (course.category?.name && iconMap[course.category.name]) {
      return iconMap[course.category.name]
    }
    
    // Try to match by tags
    for (const tag of course.tags || []) {
      if (iconMap[tag]) return iconMap[tag]
    }

    // Default icon
    return <BookOpen size={22} />
  }

  if (loading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-4">
              <div className="w-5 h-px bg-brand-500" />
              <BookOpen size={12} /> Featured Courses
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Start With What Moves<br />
              <span className="gradient-text">The Market</span>
            </h2>
          </div>
          <Link href="/courses" className="btn-ghost hidden md:flex items-center gap-2 text-sm">
            View all {totalCourses} courses <ArrowRight size={14} />
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-200">
            <p className="text-gray-500">No courses available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-3xl overflow-hidden">
            {courses.map((course) => {
              const tag = getTagStyle(course)
              const icon = getCourseIcon(course)
              
              return (
                <div key={course.id} className="group bg-white hover:bg-gray-50 transition-colors duration-300 flex flex-col cursor-pointer">

                  <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {icon}
                      </div>
                    )}
                    {tag && (
                      <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-lg border ${tag.cls}`}>
                        {tag.text}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">by {course.tutor?.name || 'Expert Instructor'}</p>

                    <div className="flex items-center gap-3 text-xs mb-5">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-yellow-600">
                          {course.avgRating?.toFixed(1) || '4.9'}
                        </span>
                      </div>
                      <span className="text-gray-200">·</span>
                      <span className="text-gray-400">
                        {course._count?.enrollments?.toLocaleString() || 0} students
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <span className="font-display font-black text-xl text-gray-900">
                        {course.currency || '₦'}{course.price?.toLocaleString() || '0'}
                      </span>
                      <Link href={`/courses/${course.slug || course.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 px-4 py-2 rounded-xl
                          bg-brand-500/10 border border-brand-500/20 group-hover:bg-brand-500 group-hover:text-white transition-all duration-200">
                        Enroll <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Value stack - keep this as is */}
        <div className="mt-12 rounded-3xl overflow-hidden border border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-white">
          <div className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <h3 className="font-display text-3xl font-black text-gray-900 tracking-tight mb-6">
                Everything You Need. One Platform.
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {['Unlimited course access', 'Downloadable resources', 'Certificate of completion',
                  'Private community access', 'Live Q&A sessions', 'Lifetime content updates'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-brand-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="text-gray-400 text-sm line-through mb-1">Worth ₦150,000+</div>
              <div className="font-display text-6xl font-black text-gray-900 tracking-tighter mb-1">FREE</div>
              <div className="text-brand-600 text-sm font-medium mb-6">to start • upgrade anytime</div>
              <Link href="/auth/register"
                className="btn-primary flex items-center gap-2 px-7 py-4 rounded-2xl justify-center">
                <Shield size={16} />
                Get Free Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SOCIAL PROOF ────────────────────────────────────────────────────────────
function SocialProof() {
  const testimonials = [
    { name: 'Chidi Okwu', role: 'Software Engineer @ Flutterwave', avatar: '👨🏿‍💻', outcome: '₦4.5M salary', rating: 5, content: 'I went from zero coding knowledge to landing a ₦4.5M/year role in just 8 months. The curriculum is world-class and the community kept me accountable through every difficult moment.' },
    { name: 'Nkechi Obi', role: 'Freelance UX Designer', avatar: '👩🏽‍🎨', outcome: '3× income', rating: 5, content: 'The UI/UX course gave me the portfolio and confidence to charge premium rates. I now earn 3x what I made at my 9-5. The instructor feedback was incredibly detailed and practical.' },
    { name: 'Seun Adewale', role: 'Digital Marketing Lead @ Cowrywise', avatar: '🧑🏾‍💼', outcome: 'ROI in 1 week', rating: 5, content: 'What sets Plus36 apart is the quality of instructors. These are people actually doing the work, not just teaching theory. The digital marketing course paid for itself in the first week.' },
    { name: 'Aisha Musa', role: 'Data Analyst @ MTN Nigeria', avatar: '👩🏿‍🔬', outcome: 'Promoted in 3 months', rating: 5, content: 'The data science curriculum is on par with Coursera and Udemy, but with African context built in. The case studies used real Nigerian business problems — so much more relevant.' },
  ]

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end gap-8 mb-14">
          <div>
            <div className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-4">
              <div className="w-5 h-px bg-brand-500" />
              <Award size={12} /> Real Results
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
              Stories That{' '}
              <span className="gradient-text">Prove It Works</span>
            </h2>
          </div>
          <div className="flex items-end gap-4 md:ml-auto">
            <span className="font-display text-6xl font-black text-gray-900 tracking-tighter leading-none">4.9</span>
            <div className="pb-1">
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-xs text-gray-400">from 3,247 verified reviews</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden mb-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white hover:bg-gray-50 transition-colors p-8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{t.role}</div>
                  </div>
                </div>
                <span className="bg-brand-500/10 text-brand-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-brand-500/20 whitespace-nowrap flex-shrink-0">
                  {t.outcome}
                </span>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                <span className="text-brand-500 font-display text-lg mr-0.5">"</span>
                {t.content}
                <span className="text-brand-500 font-display text-lg ml-0.5">"</span>
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden">
          {[
            { val: '94%', label: 'Career Improvement Rate', sub: 'Within 6 months of completion' },
            { val: '₦3.2M', label: 'Avg. Salary Increase', sub: 'For career-changers' },
            { val: '18 days', label: 'Avg. Time to First Job', sub: 'After certificate earned' },
            { val: '500+', label: 'Employer Partners', sub: 'Actively hiring our graduates' },
          ].map((s, i) => (
            <div key={i} className="bg-white hover:bg-gray-50 transition-colors p-8 text-center">
              <div className="font-display text-3xl font-black gradient-text tracking-tight mb-1">{s.val}</div>
              <div className="font-semibold text-gray-800 text-sm mb-1">{s.label}</div>
              <div className="text-gray-400 text-xs">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    { q: 'Do I need prior experience to start?', a: 'Not at all! We have courses for absolute beginners through to advanced practitioners. Every course clearly states its prerequisites, and most of our most popular courses assume zero prior knowledge. You just need curiosity and commitment.' },
    { q: 'How long do I have access to courses I purchase?', a: "Once you enroll in a course, you have lifetime access. This includes all future updates the instructor makes to the course. We believe learning doesn't have an expiry date." },
    { q: 'Are the certificates recognized by employers?', a: 'Yes. We work directly with 500+ employers across Africa who recognize and value our certificates. Each certificate includes a verification URL and unique ID that employers can use to confirm your completion. We also have an integration with LinkedIn for easy sharing.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major payment options including cards (Visa, Mastercard), bank transfers, USSD, mobile money (MTN MoMo, Airtel Money), and Paystack. We support payments in NGN, GHS, KES, and USD.' },
    { q: 'Can I become a tutor on Plus36?', a: "Absolutely! We're always looking for passionate experts to join our instructor community. You'll go through a quality review process, and once approved, you can create and sell courses while keeping 70% of revenue." },
    { q: 'Is there a money-back guarantee?', a: "Yes, we offer a 7-day no-questions-asked refund policy. If you're not satisfied within the first 7 days of purchase, simply request a refund through your dashboard and we'll process it within 48 hours." },
    { q: 'Do you offer team or corporate plans?', a: "Yes! We have dedicated plans for teams of 5 or more. Corporate plans include centralized billing, admin dashboards, custom learning paths, progress reporting, and dedicated account management. Contact us at corporate@plus36.academy." },
  ]

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-widest mb-4">
            <div className="w-5 h-px bg-brand-500" />
            <MessageSquare size={12} /> FAQ
            <div className="w-5 h-px bg-brand-500" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
            Questions?{' '}
            <span className="gradient-text">We've Got You.</span>
          </h2>
          <p className="text-gray-500 text-sm">Still not sure? Chat with us live — we respond in under 10 minutes.</p>
        </div>

        <div className="border border-gray-200 rounded-3xl overflow-hidden divide-y divide-gray-100 bg-white shadow-sm">
          {faqs.map((faq, i) => (
            <div key={i} className={`transition-colors ${open === i ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}>
              <button
                className="w-full flex items-center justify-between px-7 py-5 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-gray-800 text-sm">{faq.q}</span>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-base leading-none font-bold transition-all duration-200
                  ${open === i ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {open === i ? '−' : '+'}
                </div>
              </button>
              {open === i && (
                <div className="px-7 pb-6 text-sm text-gray-500 leading-relaxed animate-slide-in-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Refund banner */}
        <div className="mt-10 glass-card rounded-3xl p-10 text-center">
          <Shield size={36} className="text-brand-500 mx-auto mb-4" />
          <h3 className="font-display text-2xl font-black text-gray-900 tracking-tight mb-3">
            Zero Risk. Maximum Reward.
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Try any course free for 7 days. If it doesn't blow your expectations, get a full refund.
            No fine print. No hassle.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-7 py-4 rounded-2xl
              hover:bg-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
            <CheckCircle size={17} className="text-brand-400" />
            Start Free — No Credit Card Needed
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-36 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(34,197,94,0.08)_0%,transparent_70%)]" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none mb-6">
          Your Future Self<br />
          <span className="gradient-text">Starts Today</span>
        </h2>
        <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto leading-relaxed">
          The only difference between where you are and where you want to be is a decision. Make it now.
        </p>

        <Link href="/auth/register"
          className="group inline-flex items-center gap-4 btn-primary text-xl px-12 py-5 rounded-3xl animate-pulse-glow">
          <Zap size={22} />
          Join 12,847+ Learners Now
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        <div className="flex items-center justify-center gap-2 mt-5 text-gray-400 text-sm">
          <Clock size={13} />
          <span>Takes 60 seconds to sign up. Free forever plan available.</span>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-gray-400 text-sm">
          {[
            { icon: <Shield size={14} className="text-green-500" />, text: '7-day money-back guarantee' },
            { icon: <Globe size={14} className="text-blue-500" />, text: 'Courses in English & Pidgin' },
            { icon: <Award size={14} className="text-yellow-500" />, text: 'Industry-recognized certificates' },
            { icon: <MessageSquare size={14} className="text-purple-500" />, text: '24/7 community support' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-2">{b.icon} {b.text}</div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <Image
                src="/images/logo.png"
                alt="Plus36 Academy"
                width={140}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering Africa's next generation of professionals through world-class online education.
            </p>
          </div>

          {[
            { title: 'Platform', links: ['Browse Courses', 'Become a Tutor', 'For Companies', 'Success Stories'] },
            { title: 'Support', links: ['Help Center', 'Contact Us', 'Community Forum', 'Student Resources'] },
            { title: 'Company', links: ['About Plus36', 'Careers', 'Press Kit', 'Privacy Policy'] },
          ].map((col, i) => (
            <div key={i}>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link href="#" className="text-gray-500 hover:text-brand-600 text-sm transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">© 2026 Plus36 Academy. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {['Terms', 'Privacy', 'Cookies'].map(l => (
              <Link key={l} href="#" className="text-gray-400 hover:text-brand-600 text-sm transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Marquee />
      <Benefits />
      <CoursesPreview />
      <SocialProof />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}