'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  CreditCard, Download, Filter, Search, ArrowLeft, ArrowRight,
  CheckCircle, XCircle, Clock, AlertCircle, FileText, DollarSign,
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  provider: string
  providerRef?: string
  createdAt: string
  course: {
    id: string
    title: string
    thumbnail?: string
    tutor: {
      id: string
      name: string
    }
  }
}

export default function StudentPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState({
    totalSpent: 0,
    totalTransactions: 0,
    completedPayments: 0,
    pendingPayments: 0,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchPayments()
  }, [pagination.page, statusFilter])

  async function fetchPayments() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const res = await fetch(`/api/student/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Failed to fetch payments')

      const data = await res.json()
      setPayments(data.data.payments || [])
      setSummary(data.data.summary)
      setPagination(data.data.pagination)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-green-500" />
      case 'PENDING':
        return <Clock size={16} className="text-yellow-500" />
      case 'FAILED':
        return <XCircle size={16} className="text-red-500" />
      case 'REFUNDED':
        return <AlertCircle size={16} className="text-orange-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
      REFUNDED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${styles[status as keyof typeof styles] || ''}`}>
        {getStatusIcon(status)}
        {status}
      </span>
    )
  }

  const formatCurrency = (amount: number, currency: string = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
        const token = localStorage.getItem('token')
        
        const response = await fetch(`/api/student/payments/${paymentId}/receipt`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
        },
        })

        if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to download receipt'
        try {
            const error = JSON.parse(errorText)
            errorMessage = error.error || errorMessage
        } catch {
            errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
        }

        // Get the blob from response
        const blob = await response.blob()
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `receipt-${paymentId.slice(0, 8)}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error('Error downloading receipt:', error)
        alert(error instanceof Error ? error.message : 'Failed to download receipt')
    }
}

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.course.title.toLowerCase().includes(search.toLowerCase()) ||
                         payment.provider.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  if (loading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-dark-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-dark rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-dark-800 animate-pulse mb-4" />
              <div className="h-8 w-20 bg-dark-800 animate-pulse mb-2" />
              <div className="h-4 w-24 bg-dark-800 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-1">Payment History</h1>
        <p className="text-dark-400">View all your transactions and payment details</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
              <DollarSign size={20} />
            </div>
            <span className="text-dark-400 text-sm">Total Spent</span>
          </div>
          <div className="text-2xl font-bold text-dark-300">
            {formatCurrency(summary.totalSpent)}
          </div>
          <div className="text-dark-500 text-xs mt-1">Across {summary.totalTransactions} transactions</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
              <CheckCircle size={20} />
            </div>
            <span className="text-dark-400 text-sm">Completed</span>
          </div>
          <div className="text-2xl font-bold text-dark-300">{summary.completedPayments}</div>
          <div className="text-dark-500 text-xs mt-1">Successful transactions</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400">
              <Clock size={20} />
            </div>
            <span className="text-dark-400 text-sm">Pending</span>
          </div>
          <div className="text-2xl font-bold text-dark-300">{summary.pendingPayments}</div>
          <div className="text-dark-500 text-xs mt-1">Awaiting confirmation</div>
        </div>

        <div className="card-dark rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <CreditCard size={20} />
            </div>
            <span className="text-dark-400 text-sm">Avg. per Course</span>
          </div>
          <div className="text-2xl font-bold text-dark-300">
            {payments.length > 0 
              ? formatCurrency(summary.totalSpent / payments.length)
              : formatCurrency(0)}
          </div>
          <div className="text-dark-500 text-xs mt-1">Average course price</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 card-dark rounded-2xl p-4 flex items-center gap-2">
          <Search size={16} className="text-dark-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by course or payment method..."
            className="flex-1 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="card-dark rounded-2xl p-4 text-sm text-dark-300 outline-none cursor-pointer min-w-[140px]"
        >
          <option value="all">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-dark-300 mb-2">No Payments Found</h3>
          <p className="text-dark-400 max-w-md mx-auto">
            {search || statusFilter !== 'all' 
              ? 'No payments match your search criteria. Try adjusting your filters.'
              : "You haven't made any payments yet. Enroll in a course to get started!"}
          </p>
          {!search && statusFilter === 'all' && (
            <Link
              href="/dashboard/student/explore"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 mt-6"
            >
              <CreditCard size={16} />
              Explore Courses
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="card-dark rounded-2xl p-6 hover:bg-dark-800/50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Course Thumbnail */}
                <div className="lg:w-24 h-16 rounded-xl bg-gradient-to-br from-dark-800 to-dark-900 overflow-hidden flex-shrink-0">
                  {payment.course.thumbnail ? (
                    <img 
                      src={payment.course.thumbnail} 
                      alt={payment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CreditCard size={20} className="text-dark-600" />
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-dark-300 mb-1">
                        {payment.course.title}
                      </h3>
                      <p className="text-dark-500 text-xs">
                        by {payment.course.tutor.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-brand-400">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <div className="text-dark-500 text-xs">Transaction ID</div>
                      <div className="text-dark-300 font-mono text-xs truncate">
                        {payment.id.slice(0, 8)}...
                      </div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Provider</div>
                      <div className="text-dark-300 capitalize">{payment.provider}</div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Reference</div>
                      <div className="text-dark-300 font-mono text-xs truncate">
                        {payment.providerRef || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-dark-500 text-xs">Date</div>
                      <div className="text-dark-300 text-xs flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  {/* Fixed: Navigate to student course page instead of public course page */}
                  <Link
                    href={`/dashboard/student/courses/${payment.course.id}`}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    View Course
                  </Link>
                  {payment.status === 'COMPLETED' && (
                    <button
                        onClick={() => handleDownloadReceipt(payment.id)}
                        className="btn-ghost text-sm py-2 px-4 inline-flex items-center gap-2"
                    >
                        <Download size={14} />
                        Receipt
                    </button>
                    )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-dark-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-dark-300 px-3">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-xl bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}