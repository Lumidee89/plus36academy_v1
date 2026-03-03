'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Wallet, Banknote, CreditCard, Landmark, 
  CheckCircle, AlertCircle, Upload, FileText, Info,
  DollarSign, Calendar, Clock, Download, Copy
} from 'lucide-react'

interface BankDetails {
  accountName: string
  accountNumber: string
  bankName: string
  bankCode?: string
  swiftCode?: string
  routingNumber?: string
  address?: string
}

interface WithdrawalRequest {
  id: string
  amount: number
  bankDetails: BankDetails
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  createdAt: string
  processedAt?: string
  notes?: string
}

export default function TutorWithdrawPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    total: 0,
  })
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([])
  const [formData, setFormData] = useState({
    amount: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    swiftCode: '',
    routingNumber: '',
    address: '',
    notes: '',
  })
  const [selectedBank, setSelectedBank] = useState('nigeria')
  const [agreeTerms, setAgreeTerms] = useState(false)

  useEffect(() => {
    fetchWithdrawalData()
  }, [])

  async function fetchWithdrawalData() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      // Fetch balance
      const balanceRes = await fetch('/api/tutor/earnings?timeframe=all', { headers })
      if (!balanceRes.ok) throw new Error('Failed to fetch balance')
      const balanceData = await balanceRes.json()
      
      // Calculate available balance (paid amount)
      const available = balanceData.data.paid || 0
      const pending = balanceData.data.pending || 0
      const total = balanceData.data.total || 0
      
      setBalance({ available, pending, total })

      // Fetch withdrawal history
      const historyRes = await fetch('/api/tutor/withdrawals?limit=5', { headers })
      if (!historyRes.ok) throw new Error('Failed to fetch withdrawal history')
      const historyData = await historyRes.json()
      setWithdrawalHistory(historyData.data || [])

    } catch (error) {
      console.error('Failed to fetch withdrawal data:', error)
      // Set empty data instead of mock data
      setBalance({ available: 0, pending: 0, total: 0 })
      setWithdrawalHistory([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate amount
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (amount > balance.available) {
      setError(`Amount cannot exceed your available balance of ₦${balance.available.toLocaleString()}`)
      return
    }
    if (amount < 1000) {
      setError('Minimum withdrawal amount is ₦1,000')
      return
    }

    // Validate bank details
    if (!formData.accountName.trim()) {
      setError('Please enter the account name')
      return
    }
    if (!formData.accountNumber.trim()) {
      setError('Please enter the account number')
      return
    }
    if (formData.accountNumber.length < 10) {
      setError('Please enter a valid account number')
      return
    }
    if (!formData.bankName.trim()) {
      setError('Please enter the bank name')
      return
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/tutor/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          bankDetails: {
            accountName: formData.accountName,
            accountNumber: formData.accountNumber,
            bankName: formData.bankName,
            swiftCode: formData.swiftCode,
            routingNumber: formData.routingNumber,
            address: formData.address,
          },
          notes: formData.notes,
        }),
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal request')
      }

      setSuccess('Withdrawal request submitted successfully! It will be processed within 1-3 business days.')
      
      // Reset form
      setFormData({
        amount: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        swiftCode: '',
        routingNumber: '',
        address: '',
        notes: '',
      })
      setAgreeTerms(false)

      // Refresh data
      fetchWithdrawalData()

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending' },
      processing: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Processing' },
      completed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Completed' },
      rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rejected' },
    }
    const statusConfig = config[status as keyof typeof config] || config.pending
    return (
      <span className={`${statusConfig.bg} ${statusConfig.text} px-2 py-1 rounded-lg text-xs font-medium`}>
        {statusConfig.label}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tutor/earnings" className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-2xl font-black text-dark-300">Withdraw Funds</h1>
        </div>
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading withdrawal information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tutor/earnings" className="text-dark-400 hover:text-dark-300">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-black text-dark-300">Withdraw Funds</h1>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl p-4">
          <CheckCircle size={18} className="flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4">
          <AlertCircle size={18} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-dark rounded-2xl p-6">
            <h2 className="text-lg font-bold text-dark-300 mb-4 flex items-center gap-2">
              <Wallet size={18} className="text-brand-400" />
              Request Withdrawal
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Withdrawal Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 font-medium">₦</span>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    min="1000"
                    max={balance.available}
                    step="1000"
                    className="input-dark w-full pl-8"
                    required
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-dark-500">Available balance: <span className="text-green-400 font-medium">{formatCurrency(balance.available)}</span></span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: balance.available.toString() })}
                    className="text-brand-400 hover:text-brand-300 text-xs"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              {/* Bank Selection */}
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">
                  Bank Location
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBank('nigeria')}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      selectedBank === 'nigeria'
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <Landmark size={24} className="mx-auto mb-2 text-dark-400" />
                    <span className="text-sm text-dark-300">Nigeria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedBank('international')}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                      selectedBank === 'international'
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-dark-700 hover:border-dark-500'
                    }`}
                  >
                    <Banknote size={24} className="mx-auto mb-2 text-dark-400" />
                    <span className="text-sm text-dark-300">International</span>
                  </button>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-dark-400">Bank Account Details</h3>
                
                <div>
                  <label className="block text-sm text-dark-500 mb-1">Account Name *</label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="Enter account holder's name"
                    className="input-dark w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-dark-500 mb-1">Account Number *</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Enter account number"
                      className="input-dark w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-500 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="Enter bank name"
                      className="input-dark w-full"
                      required
                    />
                  </div>
                </div>

                {selectedBank === 'international' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-dark-500 mb-1">SWIFT Code</label>
                        <input
                          type="text"
                          value={formData.swiftCode}
                          onChange={e => setFormData({ ...formData, swiftCode: e.target.value })}
                          placeholder="Enter SWIFT code"
                          className="input-dark w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-dark-500 mb-1">Routing Number</label>
                        <input
                          type="text"
                          value={formData.routingNumber}
                          onChange={e => setFormData({ ...formData, routingNumber: e.target.value })}
                          placeholder="Enter routing number"
                          className="input-dark w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-dark-500 mb-1">Bank Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Enter bank address"
                        className="input-dark w-full"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm text-dark-500 mb-1">Additional Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information for the admin..."
                  rows={3}
                  className="input-dark w-full resize-y"
                />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 bg-dark-800/50 rounded-xl">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-dark-600 bg-dark-700 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="terms" className="text-sm text-dark-400">
                  I confirm that the bank details provided are correct and I agree to the 
                  <button type="button" className="text-brand-400 hover:text-brand-300 mx-1">terms and conditions</button>
                  for withdrawals. I understand that withdrawals may take 1-3 business days to process.
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 btn-secondary py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !agreeTerms || balance.available === 0}
                  className="flex-1 btn-primary py-3 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    'Submit Withdrawal Request'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Information Card */}
          <div className="card-dark rounded-2xl p-6 bg-gradient-to-br from-brand-500/5 to-purple-500/5 border border-brand-500/20">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-brand-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-dark-300 mb-2">Withdrawal Information</h3>
                <ul className="space-y-2 text-sm text-dark-400">
                  <li>• Minimum withdrawal amount: ₦1,000</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Platform fee: 10% of withdrawal amount</li>
                  <li>• Withdrawals are processed monthly on the 1st and 15th</li>
                  <li>• Ensure your bank details are correct to avoid delays</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="space-y-6">
          <div className="card-dark rounded-2xl p-6">
            <h2 className="text-lg font-bold text-dark-300 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-brand-400" />
              Recent Withdrawals
            </h2>

            {withdrawalHistory.length === 0 ? (
              <div className="text-center py-8">
                <Wallet size={32} className="mx-auto mb-3 text-dark-600" />
                <p className="text-dark-500 text-sm">No withdrawal history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="bg-dark-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-dark-300 font-medium">{formatCurrency(withdrawal.amount)}</span>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-dark-500">{formatDate(withdrawal.createdAt)}</span>
                      <button
                        onClick={() => copyToClipboard(withdrawal.id)}
                        className="text-dark-400 hover:text-brand-400 flex items-center gap-1"
                      >
                        <Copy size={12} />
                        Ref: {withdrawal.id.slice(0, 8)}
                      </button>
                    </div>
                    {withdrawal.notes && (
                      <p className="text-xs text-dark-500 mt-2 pt-2 border-t border-dark-700">
                        {withdrawal.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {withdrawalHistory.length > 0 && (
              <Link
                href="/dashboard/tutor/withdrawals/history"
                className="block text-center text-sm text-brand-400 hover:text-brand-300 mt-4"
              >
                View Full History
              </Link>
            )}
          </div>

          {/* Balance Summary */}
          <div className="card-dark rounded-2xl p-6">
            <h3 className="text-sm font-medium text-dark-400 mb-3">Balance Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-dark-500 text-sm">Available</span>
                <span className="text-green-400 font-bold">{formatCurrency(balance.available)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-dark-500 text-sm">Pending</span>
                <span className="text-yellow-400">{formatCurrency(balance.pending)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dark-700">
                <span className="text-dark-400 text-sm font-medium">Total Earnings</span>
                <span className="text-dark-300 font-bold">{formatCurrency(balance.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}