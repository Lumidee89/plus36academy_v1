'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  BookOpen, Users, Award, TrendingUp, Play, Star, CheckCircle,
  ArrowRight, ChevronDown, Zap, Globe, Shield, Clock, MessageSquare,
  Code, BarChart3, Camera, Mic, Palette, ChevronUp, Menu, X
} from 'lucide-react'

// ─── NAVBAR ─────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-950/90 backdrop-blur-xl border-b border-dark-800' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
            P36
          </div> */}
          <span className="text-brand-500 font-display text-xl">Plus36</span>
          <span className="text-brand-500 font-display text-xl">Academy</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {['Courses', 'Tutors', 'About', 'Blog'].map(item => (
            <Link key={item} href={`#${item.toLowerCase()}`} 
              className="text-dark-300 hover:text-white transition-colors text-sm font-medium">
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
          <Link href="/auth/register" className="btn-primary text-sm py-2 px-5">
            Start Learning
          </Link>
        </div>

        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden glass-card mx-4 mb-4 rounded-2xl p-6 animate-scale-in">
          <div className="flex flex-col gap-4">
            {['Courses', 'Tutors', 'About', 'Blog'].map(item => (
              <Link key={item} href={`#${item.toLowerCase()}`}
                className="text-dark-300 hover:text-white transition-colors font-medium"
                onClick={() => setMenuOpen(false)}>
                {item}
              </Link>
            ))}
            <hr className="border-dark-700" />
            <Link href="/auth/login" className="text-dark-300 font-medium hover:text-white">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-center text-sm">
              Start Learning
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────
function Hero() {
  const [count, setCount] = useState({ students: 0, courses: 0, tutors: 0 })

  useEffect(() => {
    const targets = { students: 12847, courses: 284, tutors: 96 }
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount({
        students: Math.floor(targets.students * eased),
        courses: Math.floor(targets.courses * eased),
        tutors: Math.floor(targets.tutors * eased),
      })
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-overlay">
      {/* Background effects */}
      {/* <div className="absolute inset-0 bg-dark-950" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-700/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" /> */}

      {/* Grid lines */}
      {/* <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(255,122,13,0.05) 1px, transparent 1px), 
          linear-gradient(90deg, rgba(255,122,13,0.05) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} /> */}

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center py-32">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-slide-in-up"
          style={{ border: '1px solid rgba(255,122,13,0.3)' }}>
          <Zap size={14} className="text-brand-400" />
          <span className="text-sm text-dark-200">#1 Learning Platform in West Africa</span>
          <span className="bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Latest announcement</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 animate-slide-in-up"
          style={{ animationDelay: '0.1s' }}>
          <span className="text-dark-200">Code Your Future. </span>
          <br />
          <span className="gradient-text">Lead the Digital Revolution.</span>
        </h1>

        <p className="text-dark-300 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-in-up"
          style={{ animationDelay: '0.2s' }}>
          Join <span className="text-green font-semibold">12,847+ learners</span> transforming their careers with 
          expert-led courses in tech, business, design, and beyond.
          <br />
          <span className="text-brand-400">Your breakthrough starts today.</span>
        </p>

        {/* Social proof mini badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 animate-slide-in-up"
          style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-dark-200 text-sm">4.9/5 from 3,200+ reviews</span>
          </div>
          <div className="flex -space-x-2">
            {['🧑🏿‍💻','👩🏽‍🎨','👨🏾‍💼','👩🏿‍🔬','🧑🏽‍🏫'].map((emoji, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-dark-700 border-2 border-dark-950 
                flex items-center justify-center text-sm">
                {emoji}
              </div>
            ))}
          </div>
          <span className="text-dark-300 text-sm">+12,800 learners this month</span>
        </div>

        {/* CTA Buttons - Variation 1 (Primary) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-in-up"
          style={{ animationDelay: '0.4s' }}>
          <Link href="/auth/register"
            className="group relative flex items-center gap-3 bg-brand-500 hover:bg-brand-600 
              text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-300
              hover:shadow-2xl hover:shadow-brand-500/40 hover:-translate-y-1 animate-pulse-glow">
            <Zap size={20} />
            Start Learning Today
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <button className="flex items-center gap-3 glass border border-dark-600 hover:border-brand-500/50
            text-dark-300 font-semibold px-8 py-4 rounded-2xl text-lg transition-all duration-300
            hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
              <Play size={16} className="text-brand-400 ml-0.5" />
            </div>
            Watch Demo (2 min)
          </button>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto animate-slide-in-up"
          style={{ animationDelay: '0.5s' }}>
          {[
            { value: count.students.toLocaleString(), label: 'Students Enrolled' },
            { value: count.courses.toString(), label: 'Expert Courses' },
            { value: count.tutors.toString(), label: 'World-Class Tutors' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-black gradient-text">{stat.value}+</div>
              <div className="text-dark-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={24} className="text-dark-500" />
        </div>
      </div>
    </section>
  )
}

// ─── BENEFITS ────────────────────────────────────────────────────────────────
function Benefits() {
  const benefits = [
    {
      icon: <Zap size={28} />,
      title: 'Learn at Rocket Speed',
      subtitle: 'Structured for results, not just content',
      description: 'Our courses are engineered with spaced repetition and active recall techniques proven to accelerate skill acquisition by 3x compared to traditional learning. Every module builds deliberately on the last.',
      features: ['Bite-sized lessons (10–20 mins)', 'Hands-on projects & assignments', 'AI-powered learning path', 'Instant feedback & quizzes'],
      color: 'from-orange-500/20 to-transparent',
      accent: 'text-orange-400',
      border: 'border-orange-500/20',
    },
    {
      icon: <Users size={28} />,
      title: 'Learn from the Best',
      subtitle: 'Rigorously vetted expert instructors',
      description: 'Every tutor undergoes a 12-step vetting process. Only the top 3% of applicants make it. Our experts are practitioners — working professionals who teach what they actually do every day.',
      features: ['Industry practitioners only', 'Minimum 5 years experience', 'Ongoing quality reviews', '1-on-1 Q&A sessions'],
      color: 'from-blue-500/20 to-transparent',
      accent: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    {
      icon: <Award size={28} />,
      title: 'Credentials That Open Doors',
      subtitle: 'Recognized by 500+ employers',
      description: 'Our certificates carry real weight. We\'ve partnered with leading tech companies, agencies, and enterprises across Africa who actively recruit from Plus36 graduates. Your certificate signals verified competence.',
      features: ['Verifiable digital certificates', 'LinkedIn-ready credentials', 'Employer partner network', 'Lifetime certificate access'],
      color: 'from-purple-500/20 to-transparent',
      accent: 'text-purple-400',
      border: 'border-purple-500/20',
    },
  ]

  return (
    <section id="courses" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-dark-900/50 to-dark-950" />
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-brand-400 text-sm font-medium mb-4">
            <TrendingUp size={16} />
            <span>WHY PLUS36 ACADEMY</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-dark-300 mb-4">
            Three Pillars of{' '}
            <span className="gradient-text">Transformation</span>
          </h2>
          <p className="text-dark-400 text-lg max-w-2xl mx-auto">
            We didn't build another course marketplace. We built a system designed to actually change your life.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, i) => (
            <div key={i} className={`relative group card-dark card-hover p-8 rounded-3xl overflow-hidden ${benefit.border}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-60 transition-opacity group-hover:opacity-100`} />
              <div className="relative">
                <div className={`${benefit.accent} mb-6 inline-flex p-3 rounded-2xl bg-current/10`}>
                  {benefit.icon}
                </div>
                <div className="text-xs font-semibold text-dark-500 uppercase tracking-widest mb-2">
                  {benefit.subtitle}
                </div>
                <h3 className="font-display text-2xl font-bold text-dark-300 mb-4">{benefit.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed mb-6">{benefit.description}</p>
                <ul className="space-y-2">
                  {benefit.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-dark-300">
                      <CheckCircle size={14} className={`${benefit.accent} flex-shrink-0`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Variation 2 - Urgency CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block glass-card rounded-3xl p-8 max-w-2xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">247 students enrolled in the last 24 hours</span>
            </div>
            <p className="text-dark-300 mb-6">
              Don't let another month pass by. The skills that will define the next decade are being mastered right now.
            </p>
            <Link href="/auth/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600
                text-white font-bold px-8 py-4 rounded-2xl hover:shadow-xl hover:shadow-brand-500/30
                transition-all duration-300 hover:-translate-y-0.5">
              Claim Your Free Spot Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── COURSES PREVIEW ─────────────────────────────────────────────────────────
function CoursesPreview() {
  const courses = [
    { icon: <Code size={20} />, title: 'Full-Stack Web Development', tutor: 'Emeka Okafor', students: 1847, rating: 4.9, price: 25000, tag: 'BESTSELLER' },
    { icon: <BarChart3 size={20} />, title: 'Data Science & Analytics', tutor: 'Amina Hassan', students: 1203, rating: 4.8, price: 30000, tag: 'HOT' },
    { icon: <Palette size={20} />, title: 'UI/UX Design Masterclass', tutor: 'Taiwo Adeyemi', students: 986, rating: 4.9, price: 20000, tag: null },
    { icon: <Camera size={20} />, title: 'Digital Marketing & Growth', tutor: 'Chisom Eze', students: 2104, rating: 4.7, price: 18000, tag: 'NEW' },
    { icon: <Mic size={20} />, title: 'Content Creation & Monetization', tutor: 'Fatima Bello', students: 756, rating: 4.8, price: 15000, tag: null },
    { icon: <Globe size={20} />, title: 'Cybersecurity Fundamentals', tutor: 'David Mensah', students: 634, rating: 4.9, price: 35000, tag: 'ADVANCED' },
  ]

  return (
    <section className="py-24 bg-dark-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-brand-400 text-sm font-medium mb-3">FEATURED COURSES</div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-white">
              Start With What Moves <br />
              <span className="gradient-text">The Market</span>
            </h2>
          </div>
          <Link href="/auth/register" className="hidden md:flex items-center gap-2 btn-ghost">
            View all 284 courses <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div key={i} className="group card-dark card-hover rounded-2xl overflow-hidden cursor-pointer"
              style={{ animationDelay: `${i * 0.1}s` }}>
              {/* Thumbnail placeholder */}
              <div className="h-40 bg-gradient-to-br from-dark-800 to-dark-900 relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-400">
                  {course.icon}
                </div>
                {course.tag && (
                  <div className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-lg ${
                    course.tag === 'BESTSELLER' ? 'bg-yellow-500 text-yellow-950' :
                    course.tag === 'HOT' ? 'bg-red-500 text-white' :
                    course.tag === 'NEW' ? 'bg-green-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>{course.tag}</div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-semibold text-white mb-1 group-hover:text-brand-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-dark-400 text-sm mb-3">by {course.tutor}</p>

                <div className="flex items-center gap-3 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 font-medium">{course.rating}</span>
                  </div>
                  <span className="text-dark-500">·</span>
                  <span className="text-dark-400">{course.students.toLocaleString()} students</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-lg">
                    ₦{course.price.toLocaleString()}
                  </span>
                  <Link href="/auth/register"
                    className="text-sm font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1">
                    Enroll <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Variation 3 - Value Stack CTA */}
        <div className="mt-16 rounded-3xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(255,122,13,0.15) 0%, rgba(196,74,0,0.1) 100%)',
          border: '1px solid rgba(255,122,13,0.2)',
        }}>
          <div className="p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="font-display text-3xl font-bold text-white mb-3">
                Everything You Need. One Platform.
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Unlimited course access', 'Downloadable resources',
                  'Certificate of completion', 'Private community access',
                  'Live Q&A sessions', 'Lifetime content updates',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-dark-300">
                    <CheckCircle size={14} className="text-brand-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="text-dark-400 text-sm line-through mb-1">Worth ₦150,000+</div>
              <div className="font-display text-5xl font-black text-white mb-1">FREE</div>
              <div className="text-brand-400 text-sm mb-6">to start • upgrade anytime</div>
              <Link href="/auth/register"
                className="inline-flex items-center gap-2 btn-primary px-8 py-4 text-base">
                <Shield size={18} />
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
    {
      name: 'Chidi Okwu',
      role: 'Software Engineer @ Flutterwave',
      avatar: '👨🏿‍💻',
      content: 'I went from zero coding knowledge to landing a ₦4.5M/year role in just 8 months. The curriculum is world-class and the community kept me accountable through every difficult moment.',
      rating: 5,
      outcome: '₦4.5M salary increase',
    },
    {
      name: 'Nkechi Obi',
      role: 'Freelance UX Designer',
      avatar: '👩🏽‍🎨',
      content: 'The UI/UX course gave me the portfolio and confidence to charge premium rates. I now earn 3x what I made at my 9-5. The instructor feedback was incredibly detailed and practical.',
      rating: 5,
      outcome: '3x income growth',
    },
    {
      name: 'Seun Adewale',
      role: 'Digital Marketing Lead @ Cowrywise',
      avatar: '🧑🏾‍💼',
      content: 'What sets Plus36 apart is the quality of instructors. These are people actually doing the work, not just teaching theory. The digital marketing course paid for itself in the first week.',
      rating: 5,
      outcome: 'ROI in 1 week',
    },
    {
      name: 'Aisha Musa',
      role: 'Data Analyst @ MTN Nigeria',
      avatar: '👩🏿‍🔬',
      content: 'The data science curriculum is on par with what I\'ve seen from Coursera and Udemy, but with African context built in. The case studies used real Nigerian business problems — so much more relevant.',
      rating: 5,
      outcome: 'Promoted in 3 months',
    },
  ]

  const logos = ['Flutterwave', 'Paystack', 'MTN', 'Cowrywise', 'Kuda', 'PiggyVest', 'Interswitch', 'Andela']

  return (
    <section className="py-24 bg-gradient-to-b from-dark-950 to-dark-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Trust logos */}
        <div className="text-center mb-16">
          <p className="text-dark-500 text-sm font-medium mb-8 uppercase tracking-wider">
            Our graduates work at Africa's most innovative companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos.map((logo, i) => (
              <div key={i} className="text-dark-600 font-bold text-lg hover:text-dark-400 transition-colors cursor-default">
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Section header */}
        <div className="text-center mb-12">
          <div className="text-brand-400 text-sm font-medium mb-3">REAL RESULTS</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Stories That <span className="gradient-text">Prove It Works</span>
          </h2>
          <div className="flex items-center justify-center gap-6 text-dark-300">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <span className="font-bold text-white text-2xl">4.9</span>
            <span>from 3,247 verified reviews</span>
          </div>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <div key={i} className="card-dark card-hover rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl" />
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{t.avatar}</div>
                <div>
                  <div className="font-semibold text-white">{t.name}</div>
                  <div className="text-dark-400 text-sm">{t.role}</div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <div className="bg-brand-500/10 text-brand-400 text-xs font-bold px-3 py-1 rounded-full border border-brand-500/20">
                    {t.outcome}
                  </div>
                </div>
              </div>
              <div className="flex mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-dark-300 leading-relaxed text-sm">"{t.content}"</p>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '94%', label: 'Career Improvement Rate', sub: 'Within 6 months of completion' },
            { value: '₦3.2M', label: 'Avg. Salary Increase', sub: 'For career-changers' },
            { value: '18 days', label: 'Avg. Time to First Job', sub: 'After certificate earned' },
            { value: '500+', label: 'Employer Partners', sub: 'Actively hiring our graduates' },
          ].map((stat, i) => (
            <div key={i} className="card-dark rounded-2xl p-6 text-center">
              <div className="font-display text-3xl font-black gradient-text mb-1">{stat.value}</div>
              <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
              <div className="text-dark-500 text-xs">{stat.sub}</div>
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
    {
      q: 'Do I need prior experience to start?',
      a: 'Not at all! We have courses for absolute beginners through to advanced practitioners. Every course clearly states its prerequisites, and most of our most popular courses assume zero prior knowledge. You just need curiosity and commitment.',
    },
    {
      q: 'How long do I have access to courses I purchase?',
      a: 'Once you enroll in a course, you have lifetime access. This includes all future updates the instructor makes to the course. We believe learning doesn\'t have an expiry date.',
    },
    {
      q: 'Are the certificates recognized by employers?',
      a: 'Yes. We work directly with 500+ employers across Africa who recognize and value our certificates. Each certificate includes a verification URL and unique ID that employers can use to confirm your completion. We also have an integration with LinkedIn for easy sharing.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major payment options including cards (Visa, Mastercard), bank transfers, USSD, mobile money (MTN MoMo, Airtel Money), and Paystack. We support payments in NGN, GHS, KES, and USD.',
    },
    {
      q: 'Can I become a tutor on Plus36?',
      a: 'Absolutely! We\'re always looking for passionate experts to join our instructor community. You\'ll go through a quality review process, and once approved, you can create and sell courses while keeping 70% of revenue. Apply through the "Become a Tutor" link.',
    },
    {
      q: 'Is there a money-back guarantee?',
      a: 'Yes, we offer a 7-day no-questions-asked refund policy. If you\'re not satisfied with a course within the first 7 days of purchase, simply request a refund through your dashboard and we\'ll process it within 48 hours.',
    },
    {
      q: 'Do you offer team or corporate plans?',
      a: 'Yes! We have dedicated plans for teams of 5 or more. Corporate plans include centralized billing, admin dashboards, custom learning paths, progress reporting, and dedicated account management. Contact us at corporate@plus36.academy.',
    },
  ]

  return (
    <section className="py-24 bg-dark-950">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="text-brand-400 text-sm font-medium mb-3">FAQ</div>
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Questions? <span className="gradient-text">We've Got You.</span>
          </h2>
          <p className="text-dark-400">Still not sure? Chat with us live — we respond in under 2 minutes.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`card-dark rounded-2xl overflow-hidden transition-all duration-300 ${
              open === i ? 'border-brand-500/30' : ''
            }`}>
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-white pr-4">{faq.q}</span>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  transition-all duration-300 ${open === i ? 'bg-brand-500 rotate-180' : 'bg-dark-700'}`}>
                  <ChevronDown size={16} className="text-white" />
                </div>
              </button>
              {open === i && (
                <div className="px-6 pb-6 text-dark-300 leading-relaxed animate-slide-in-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Variation 4 - Risk-Reversal CTA */}
        <div className="mt-16 text-center glass-card rounded-3xl p-10">
          <Shield size={40} className="text-brand-400 mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold text-white mb-3">Zero Risk. Maximum Reward.</h3>
          <p className="text-dark-400 mb-6 max-w-md mx-auto">
            Try any course free for 7 days. If it doesn't blow your expectations, get a full refund.
            No fine print. No hassle.
          </p>
          <Link href="/auth/register"
            className="inline-flex items-center gap-3 bg-white text-dark-950 font-bold px-8 py-4 
              rounded-2xl hover:bg-dark-100 transition-all duration-300 hover:-translate-y-0.5
              hover:shadow-xl hover:shadow-white/10">
            <CheckCircle size={20} className="text-brand-500" />
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
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(255,122,13,0.15) 0%, transparent 50%, rgba(196,74,0,0.1) 100%)',
      }} />
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,122,13,0.1) 0%, transparent 60%),
          radial-gradient(circle at 70% 50%, rgba(196,74,0,0.08) 0%, transparent 60%)`,
      }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="font-display text-5xl md:text-7xl font-black text-white mb-6">
          Your Future Self <br />
          <span className="gradient-text">Starts Today</span>
        </div>
        <p className="text-dark-300 text-xl mb-12 max-w-2xl mx-auto">
          The only difference between where you are and where you want to be is a decision.
          Make it now.
        </p>

        {/* CTA Variation 5 - Social Momentum CTA */}
        <div className="space-y-4">
          <Link href="/auth/register"
            className="group inline-flex items-center gap-4 bg-brand-500 hover:bg-brand-600
              text-white font-black px-12 py-6 rounded-3xl text-xl transition-all duration-300
              hover:shadow-2xl hover:shadow-brand-500/50 hover:-translate-y-2 animate-pulse-glow">
            <Zap size={24} />
            Join 12,847+ Learners Now
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-dark-400 text-sm">
            <Clock size={14} />
            <span>Takes 60 seconds to sign up. Free forever plan available.</span>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-dark-500 text-sm">
          <div className="flex items-center gap-2"><Shield size={14} className="text-green-500" /> 7-day money-back guarantee</div>
          <div className="flex items-center gap-2"><Globe size={14} className="text-blue-500" /> Courses in English & Pidgin</div>
          <div className="flex items-center gap-2"><Award size={14} className="text-yellow-500" /> Industry-recognized certificates</div>
          <div className="flex items-center gap-2"><MessageSquare size={14} className="text-purple-500" /> 24/7 community support</div>
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {/* <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white text-sm">
                P36
              </div> */}
              <span className="font-display text-xl font-bold">Plus36 Academy</span>
            </div>
            <p className="text-dark-400 text-sm leading-relaxed">
              Empowering Africa's next generation of professionals through world-class online education.
            </p>
          </div>

          {[
            {
              title: 'Platform',
              links: ['Browse Courses', 'Become a Tutor', 'For Companies', 'Success Stories'],
            },
            {
              title: 'Support',
              links: ['Help Center', 'Contact Us', 'Community Forum', 'Student Resources'],
            },
            {
              title: 'Company',
              links: ['About Plus36', 'Careers', 'Press Kit', 'Privacy Policy'],
            },
          ].map((col, i) => (
            <div key={i}>
              <div className="text-white font-semibold text-sm mb-4">{col.title}</div>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link href="#" className="text-dark-400 hover:text-brand-400 text-sm transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © 2024 Plus36 Academy. All rights reserved. Built with ❤️ for Africa.
          </p>
          <div className="flex items-center gap-4 text-dark-500 text-sm">
            <Link href="#" className="hover:text-brand-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-brand-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-brand-400 transition-colors">Cookies</Link>
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
      <Benefits />
      <CoursesPreview />
      <SocialProof />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
