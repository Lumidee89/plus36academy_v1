'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Wallet, CheckCircle, XCircle, Clock, Eye,
  Search, Filter, Download, ArrowLeft
} from 'lucide-react'

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchWithdrawals()
  }, [filter])

  async function fetchWithdrawals() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/admin/withdrawals?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setWithdrawals(data.data || [])
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  async function processWithdrawal(id: string, action: 'approve' | 'reject') {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        fetchWithdrawals()
      }
    } catch (error) {
      console.error('Failed to process withdrawal:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin" className="text-dark-400 hover:text-dark-300">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-3xl font-black text-dark-300">Withdrawal Requests</h1>
      </div>

      <div className="flex gap-2">
        {['pending', 'processing', 'completed', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-brand-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-dark-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="card-dark rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-800">
              <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium">Tutor</th>
              <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium">Amount</th>
              <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium">Bank Details</th>
              <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium">Date</th>
              <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium">Status</th>
              <th className="text-right px-6 py-4 text-dark-400 text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-800">
            {withdrawals.map((w) => (
              <tr key={w.id} className="hover:bg-dark-800/50">
                <td className="px-6 py-4">
                  <div className="text-dark-300">{w.tutorName}</div>
                  <div className="text-dark-500 text-xs">{w.tutorEmail}</div>
                </td>
                <td className="px-6 py-4 text-dark-300 font-medium">₦{w.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="text-dark-300 text-sm">{w.bankDetails.accountName}</div>
                  <div className="text-dark-500 text-xs">{w.bankDetails.bankName} • {w.bankDetails.accountNumber}</div>
                </td>
                <td className="px-6 py-4 text-dark-400">{w.createdAt}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    w.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                    w.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {w.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => processWithdrawal(w.id, 'approve')}
                        className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => processWithdrawal(w.id, 'reject')}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}