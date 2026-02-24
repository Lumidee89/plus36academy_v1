'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, Users, BarChart3, Settings, LogOut,
  Bell, Menu, X, Upload, GraduationCap, Award, CreditCard, ChevronRight
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
  avatar?: string
}

function getNavItems(role: string) {
  const base = [
    { href: `/dashboard/${role.toLowerCase()}`, icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  ]

  if (role === 'STUDENT') {
    return [
      ...base,
      { href: '/dashboard/student/courses', icon: <BookOpen size={18} />, label: 'My Courses' },
      { href: '/dashboard/student/explore', icon: <GraduationCap size={18} />, label: 'Explore' },
      { href: '/dashboard/student/certificates', icon: <Award size={18} />, label: 'Certificates' },
      { href: '/dashboard/student/payments', icon: <CreditCard size={18} />, label: 'Payments' },
    ]
  }

  if (role === 'TUTOR') {
    return [
      ...base,
      { href: '/dashboard/tutor/courses', icon: <BookOpen size={18} />, label: 'My Courses' },
      { href: '/dashboard/tutor/upload', icon: <Upload size={18} />, label: 'Upload Material' },
      { href: '/dashboard/tutor/students', icon: <Users size={18} />, label: 'My Students' },
      { href: '/dashboard/tutor/earnings', icon: <BarChart3 size={18} />, label: 'Earnings' },
    ]
  }

  // ADMIN
  return [
    ...base,
    { href: '/dashboard/admin/courses', icon: <BookOpen size={18} />, label: 'Courses' },
    { href: '/dashboard/admin/users', icon: <Users size={18} />, label: 'Users' },
    { href: '/dashboard/admin/revenue', icon: <BarChart3 size={18} />, label: 'Revenue' },
    { href: '/dashboard/admin/analytics', icon: <BarChart3 size={18} />, label: 'Analytics' },
  ]
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) {
      router.push('/auth/login')
      return
    }
    setUser(JSON.parse(stored))
  }, [router])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  const navItems = getNavItems(user.role)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <Link href="/" className="flex items-center gap-2">
          {/* <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white text-xs">
            P36
          </div> */}
          <span className="font-display font-bold text-white">Plus36</span>
        </Link>
      </div>

      {/* User card */}
      <div className="p-4 m-4 glass-card rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-lg">
            {user.avatar || user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-semibold truncate">{user.name}</div>
            <div className="text-dark-400 text-xs">{user.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                active
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}>
              {item.icon}
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-dark-800 space-y-1">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-dark-400 hover:text-white hover:bg-dark-800 transition-all">
          <Settings size={18} />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-dark-900 border-r border-dark-800 fixed h-full z-20">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-900 border-r border-dark-800">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-dark-400 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800 px-6 py-4 flex items-center justify-between">
          <button
            className="lg:hidden text-dark-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            <button className="relative text-dark-400 hover:text-white">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                3
              </span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user.name[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
