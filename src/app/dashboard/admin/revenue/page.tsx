'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DollarSign, TrendingUp, Calendar, Download, Filter,
  ArrowLeft, ArrowUp, ArrowDown, Users, BookOpen,
  CreditCard, Clock, ChevronDown, FileText
} from 'lucide-react'

export default function AdminRevenuePage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month') // week, month, year
  const [revenue, setRevenue] = useState({
    total: 0,
    monthly: 0,
    weekly: 0,
    daily: 0,
    pending: 0,
    refunded: 0,
    growth: 0,
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [revenueByCourse, setRevenueByCourse] = useState<any[]>([])
  const [revenueByDay, setRevenueByDay] = useState<any[]>([])

  useEffect(() => {
    fetchRevenueData()
  }, [timeframe])

  async function fetchRevenueData() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch revenue summary
      const summaryRes = await fetch(`/api/admin/revenue?timeframe=${timeframe}`, { headers })
      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setRevenue(data.data)
      }

      // Fetch transactions
      const transactionsRes = await fetch('/api/admin/transactions?limit=20', { headers })
      if (transactionsRes.ok) {
        const data = await transactionsRes.json()
        setTransactions(data.data || [])
      }

      // Fetch revenue by course
      const byCourseRes = await fetch('/api/admin/revenue/by-course', { headers })
      if (byCourseRes.ok) {
        const data = await byCourseRes.json()
        setRevenueByCourse(data.data || [])
      }

      // Fetch daily revenue for chart
      const dailyRes = await fetch(`/api/admin/revenue/daily?timeframe=${timeframe}`, { headers })
      if (dailyRes.ok) {
        const data = await dailyRes.json()
        setRevenueByDay(data.data || [])
      }

    } catch (error) {
      console.error('Failed to fetch revenue data:', error)
      // Demo data for testing
      setRevenue({
        total: 45820000,
        monthly: 8240000,
        weekly: 2150000,
        daily: 425000,
        pending: 1250000,
        refunded: 342000,
        growth: 23.5,
      })
      setTransactions(mockTransactions)
      setRevenueByCourse(mockRevenueByCourse)
      setRevenueByDay(mockRevenueByDay)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 1000).toFixed(1)}K`
  }

  const formatFullCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-black text-dark-300 mb-1">Revenue & Analytics</h1>
            <p className="text-dark-400">Track your platform's financial performance</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
              className="card-dark rounded-xl p-3 pr-10 appearance-none text-sm text-dark-300 cursor-pointer"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>
          <button className="btn-secondary p-3">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <DollarSign size={20} />
            </div>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
              +{revenue.growth}%
            </span>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{formatCurrency(revenue.total)}</div>
          <div className="text-dark-400 text-sm">Total Revenue</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{formatCurrency(revenue.monthly)}</div>
          <div className="text-dark-400 text-sm">Monthly Revenue</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{formatCurrency(revenue.pending)}</div>
          <div className="text-dark-400 text-sm">Pending Payouts</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Users size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{revenueByCourse.length}</div>
          <div className="text-dark-400 text-sm">Active Courses</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card-dark rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-dark-400">Revenue Overview</h2>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1 rounded-lg bg-brand-500/10 text-brand-400">Day</button>
            <button className="text-xs px-3 py-1 rounded-lg text-dark-400 hover:bg-dark-800">Week</button>
            <button className="text-xs px-3 py-1 rounded-lg text-dark-400 hover:bg-dark-800">Month</button>
          </div>
        </div>
        
        {/* Simple bar chart visualization */}
        <div className="h-64 flex items-end gap-2">
          {revenueByDay.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-brand-500/20 rounded-t-lg hover:bg-brand-500/30 transition-colors relative group"
                style={{ height: `${(day.amount / revenue.daily) * 100}px`, maxHeight: '180px', minHeight: '20px' }}
              >
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-700 text-dark-300 text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatFullCurrency(day.amount)}
                </div>
              </div>
              <span className="text-xs text-dark-500">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Course & Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Course */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800">
            <h2 className="font-bold text-dark-400">Revenue by Course</h2>
          </div>
          <div className="divide-y divide-dark-800">
            {revenueByCourse.length === 0 ? (
              <div className="px-6 py-8 text-center text-dark-500">
                No revenue data available
              </div>
            ) : (
              revenueByCourse.map((course, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-dark-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center">
                    <BookOpen size={18} className="text-dark-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-dark-300 text-sm font-medium truncate">{course.title}</div>
                    <div className="text-dark-500 text-xs">{course.enrollments} students</div>
                  </div>
                  <div className="text-right">
                    <div className="text-dark-300 text-sm font-bold">{formatCurrency(course.revenue)}</div>
                    <div className="text-xs text-green-400">+{course.growth}%</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
            <h2 className="font-bold text-dark-400">Recent Transactions</h2>
            <Link href="/dashboard/admin/transactions" className="text-brand-400 text-sm hover:text-brand-300">
              View All
            </Link>
          </div>
          <div className="divide-y divide-dark-800">
            {transactions.length === 0 ? (
              <div className="px-6 py-8 text-center text-dark-500">
                No transactions found
              </div>
            ) : (
              transactions.map((tx, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-dark-800/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {tx.status === 'completed' ? <DollarSign size={16} /> :
                     tx.status === 'pending' ? <Clock size={16} /> :
                     <ArrowDown size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-dark-300 text-sm font-medium truncate">{tx.student}</div>
                    <div className="text-dark-500 text-xs">{tx.course}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-dark-300 text-sm font-bold">{formatCurrency(tx.amount)}</div>
                    <div className="text-xs text-dark-500">{tx.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Average Order Value', value: formatCurrency(12500), change: '+5.2%', icon: <TrendingUp size={16} /> },
          { label: 'Conversion Rate', value: '3.2%', change: '+0.8%', icon: <Users size={16} /> },
          { label: 'Refund Rate', value: '1.2%', change: '-0.3%', icon: <ArrowDown size={16} />, positive: false },
          { label: 'Active Subscriptions', value: '1,284', change: '+12', icon: <CreditCard size={16} /> },
        ].map((stat, i) => (
          <div key={i} className="card-dark rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-dark-500 text-xs">{stat.label}</span>
              <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300 text-lg font-bold">{stat.value}</span>
              <span className="text-dark-400">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Mock data
const mockTransactions = [
  { student: 'John Doe', course: 'Full-Stack Web Development', amount: 25000, status: 'completed', date: '2 min ago' },
  { student: 'Jane Smith', course: 'React Masterclass', amount: 20000, status: 'completed', date: '15 min ago' },
  { student: 'Mike Johnson', course: 'Python for Beginners', amount: 15000, status: 'pending', date: '1 hr ago' },
  { student: 'Sarah Williams', course: 'UI/UX Design Fundamentals', amount: 18000, status: 'completed', date: '3 hr ago' },
  { student: 'David Brown', course: 'Node.js API Development', amount: 22000, status: 'refunded', date: '5 hr ago' },
]

const mockRevenueByCourse = [
  { title: 'Full-Stack Web Development', enrollments: 234, revenue: 5850000, growth: 15 },
  { title: 'React Masterclass', enrollments: 187, revenue: 3740000, growth: 22 },
  { title: 'Python for Beginners', enrollments: 156, revenue: 2340000, growth: 8 },
  { title: 'UI/UX Design Fundamentals', enrollments: 98, revenue: 1764000, growth: 12 },
  { title: 'Node.js API Development', enrollments: 76, revenue: 1672000, growth: -2 },
]

const mockRevenueByDay = [
  { label: 'Mon', amount: 325000 },
  { label: 'Tue', amount: 450000 },
  { label: 'Wed', amount: 380000 },
  { label: 'Thu', amount: 425000 },
  { label: 'Fri', amount: 550000 },
  { label: 'Sat', amount: 275000 },
  { label: 'Sun', amount: 150000 },
]