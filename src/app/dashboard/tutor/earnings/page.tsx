'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  DollarSign, TrendingUp, Calendar, Download, Filter,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Users, BookOpen,
  CreditCard, Clock, ChevronDown, FileText, Eye,
  BarChart3, PieChart, Wallet
} from 'lucide-react'

export default function TutorEarningsPage() {
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month') // week, month, year, all
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    thisMonth: 0,
    lastMonth: 0,
    growth: 0,
    nextPayout: 0,
    nextPayoutDate: '',
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [payoutHistory, setPayoutHistory] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    fetchEarningsData()
  }, [timeframe])

  async function fetchEarningsData() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch earnings summary
      const summaryRes = await fetch(`/api/tutor/earnings?timeframe=${timeframe}`, { headers })
      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setEarnings(data.data)
      }

      // Fetch transactions
      const transactionsRes = await fetch('/api/tutor/transactions?limit=20', { headers })
      if (transactionsRes.ok) {
        const data = await transactionsRes.json()
        setTransactions(data.data || [])
      }

      // Fetch course earnings
      const coursesRes = await fetch('/api/tutor/courses/earnings', { headers })
      if (coursesRes.ok) {
        const data = await coursesRes.json()
        setCourses(data.data || [])
      }

      // Fetch payout history
      const payoutRes = await fetch('/api/tutor/payouts', { headers })
      if (payoutRes.ok) {
        const data = await payoutRes.json()
        setPayoutHistory(data.data || [])
      }

    } catch (error) {
      console.error('Failed to fetch earnings data:', error)
      // Mock data for demonstration
      setEarnings({
        total: 1250000,
        pending: 450000,
        paid: 800000,
        thisMonth: 350000,
        lastMonth: 280000,
        growth: 25,
        nextPayout: 125000,
        nextPayoutDate: 'Mar 15, 2024',
      })
      setTransactions(mockTransactions)
      setCourses(mockCourseEarnings)
      setPayoutHistory(mockPayoutHistory)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`
    }
    return `₦${amount}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10'
      case 'pending': return 'text-yellow-400 bg-yellow-500/10'
      case 'failed': return 'text-red-400 bg-red-500/10'
      default: return 'text-dark-400 bg-dark-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-black text-dark-300">Earnings</h1>
        </div>
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading your earnings data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-dark-300 mb-1">Earnings</h1>
          <p className="text-dark-400">Track your revenue and payouts</p>
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
              <option value="year">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>
          <button className="btn-secondary p-3">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <DollarSign size={20} />
            </div>
            <span className={`text-xs px-2 py-1 rounded-lg ${
              earnings.growth >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
            }`}>
              {earnings.growth >= 0 ? '+' : ''}{earnings.growth}%
            </span>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{formatCompactCurrency(earnings.total)}</div>
          <div className="text-dark-400 text-sm">Total Earnings</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <Wallet size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{formatCompactCurrency(earnings.paid)}</div>
          <div className="text-dark-400 text-sm">Paid Out</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Clock size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{formatCompactCurrency(earnings.pending)}</div>
          <div className="text-dark-400 text-sm">Pending</div>
          {earnings.nextPayout > 0 && (
            <div className="text-xs text-dark-500 mt-2">
              Next payout: {formatCompactCurrency(earnings.nextPayout)} on {earnings.nextPayoutDate}
            </div>
          )}
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-dark-300 mb-1">{formatCompactCurrency(earnings.thisMonth)}</div>
          <div className="text-dark-400 text-sm">This Month</div>
          <div className="text-xs text-dark-500 mt-2 flex items-center gap-1">
            <span>Last month: {formatCompactCurrency(earnings.lastMonth)}</span>
            <span className={earnings.growth >= 0 ? 'text-green-400' : 'text-red-400'}>
              ({earnings.growth >= 0 ? '+' : ''}{earnings.growth}%)
            </span>
          </div>
        </div>
      </div>

      {/* Earnings Chart & Course Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Earnings Chart */}
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-dark-400">Revenue Overview</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedPeriod('week')}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  selectedPeriod === 'week' ? 'bg-brand-500/10 text-brand-400' : 'text-dark-400 hover:bg-dark-800'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setSelectedPeriod('month')}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  selectedPeriod === 'month' ? 'bg-brand-500/10 text-brand-400' : 'text-dark-400 hover:bg-dark-800'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setSelectedPeriod('year')}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  selectedPeriod === 'year' ? 'bg-brand-500/10 text-brand-400' : 'text-dark-400 hover:bg-dark-800'
                }`}
              >
                Year
              </button>
            </div>
          </div>
          
          {/* Simple bar chart */}
          <div className="h-48 flex items-end gap-2 mt-8">
            {[42, 38, 45, 48, 52, 58, 62, 55, 48, 45, 40, 38].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-brand-500/20 rounded-t-lg hover:bg-brand-500/30 transition-colors relative group"
                  style={{ height: `${height * 1.5}px`, maxHeight: '120px' }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-dark-700 text-dark-300 text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ₦{(height * 5000).toLocaleString()}
                  </div>
                </div>
                <span className="text-xs text-dark-500">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-dark-800">
            <h2 className="font-bold text-dark-400">Top Performing Courses</h2>
          </div>
          <div className="divide-y divide-dark-800">
            {courses.length === 0 ? (
              <div className="px-6 py-8 text-center text-dark-500">
                No course data available
              </div>
            ) : (
              courses.map((course, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-dark-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-dark-800 flex items-center justify-center">
                    <BookOpen size={18} className="text-dark-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-dark-300 text-sm font-medium truncate">{course.title}</div>
                    <div className="text-dark-500 text-xs">{course.enrollments} students • {course.sales} sales</div>
                  </div>
                  <div className="text-right">
                    <div className="text-dark-300 text-sm font-bold">{formatCompactCurrency(course.revenue)}</div>
                    <div className={`text-xs ${course.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {course.growth >= 0 ? '+' : ''}{course.growth}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-4 border-t border-dark-800">
            <Link href="/dashboard/tutor/courses" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
              View all courses <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-800 flex items-center justify-between">
          <h2 className="font-bold text-dark-400">Recent Transactions</h2>
          <Link href="/dashboard/tutor/transactions" className="text-brand-400 text-sm hover:text-brand-300">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left px-6 py-3 text-dark-500 text-xs font-medium">Date</th>
                <th className="text-left px-6 py-3 text-dark-500 text-xs font-medium">Course</th>
                <th className="text-left px-6 py-3 text-dark-500 text-xs font-medium">Student</th>
                <th className="text-left px-6 py-3 text-dark-500 text-xs font-medium">Amount</th>
                <th className="text-left px-6 py-3 text-dark-500 text-xs font-medium">Status</th>
                <th className="text-right px-6 py-3 text-dark-500 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-dark-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="text-dark-300 text-sm">{tx.date}</div>
                      <div className="text-dark-500 text-xs">{tx.time}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-dark-300 text-sm">{tx.course}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-dark-300 text-sm">{tx.student}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-dark-300 text-sm font-medium">{formatCurrency(tx.amount)}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${getStatusColor(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button className="p-1 text-dark-400 hover:text-brand-400">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      <div className="card-dark rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-800">
          <h2 className="font-bold text-dark-400">Payout History</h2>
        </div>
        {payoutHistory.length === 0 ? (
          <div className="px-6 py-8 text-center text-dark-500">
            No payouts yet
          </div>
        ) : (
          <div className="divide-y divide-dark-800">
            {payoutHistory.map((payout, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    payout.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    {payout.status === 'completed' ? <DollarSign size={16} /> : <Clock size={16} />}
                  </div>
                  <div>
                    <div className="text-dark-300 text-sm font-medium">{payout.date}</div>
                    <div className="text-dark-500 text-xs">Via {payout.method}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-dark-300 text-sm font-bold">{formatCurrency(payout.amount)}</div>
                  <div className={`text-xs ${payout.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Funds Button */}
      <div className="flex justify-end">
        <Link
          href="/dashboard/tutor/withdraw"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3"
        >
          <Wallet size={18} />
          Withdraw Funds
        </Link>
      </div>
    </div>
  )
}

// Mock data
const mockTransactions = [
  { date: 'Mar 10, 2024', time: '2:30 PM', course: 'Full-Stack Web Development', student: 'John Doe', amount: 25000, status: 'completed' },
  { date: 'Mar 9, 2024', time: '11:15 AM', course: 'React Masterclass', student: 'Jane Smith', amount: 20000, status: 'completed' },
  { date: 'Mar 8, 2024', time: '4:45 PM', course: 'Python for Beginners', student: 'Mike Johnson', amount: 15000, status: 'pending' },
  { date: 'Mar 7, 2024', time: '9:20 AM', course: 'UI/UX Design Fundamentals', student: 'Sarah Williams', amount: 18000, status: 'completed' },
  { date: 'Mar 6, 2024', time: '1:10 PM', course: 'Node.js API Development', student: 'David Brown', amount: 22000, status: 'completed' },
]

const mockCourseEarnings = [
  { title: 'Full-Stack Web Development', enrollments: 45, sales: 38, revenue: 950000, growth: 15 },
  { title: 'React Masterclass', enrollments: 32, sales: 28, revenue: 560000, growth: 22 },
  { title: 'Python for Beginners', enrollments: 28, sales: 25, revenue: 375000, growth: -5 },
  { title: 'UI/UX Design Fundamentals', enrollments: 18, sales: 15, revenue: 270000, growth: 8 },
  { title: 'Node.js API Development', enrollments: 15, sales: 12, revenue: 264000, growth: 12 },
]

const mockPayoutHistory = [
  { date: 'Mar 1, 2024', amount: 125000, method: 'Bank Transfer', status: 'completed' },
  { date: 'Feb 1, 2024', amount: 98000, method: 'Bank Transfer', status: 'completed' },
  { date: 'Jan 2, 2024', amount: 112000, method: 'Bank Transfer', status: 'completed' },
  { date: 'Dec 1, 2023', amount: 85000, method: 'Bank Transfer', status: 'pending' },
]