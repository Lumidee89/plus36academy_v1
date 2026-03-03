'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, Filter, ChevronDown, MoreVertical, 
  CheckCircle, XCircle, Shield, User as UserIcon,
  Mail, Phone, Calendar, Edit2, Trash2, Eye
} from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })

  useEffect(() => {
    fetchUsers()
  }, [roleFilter, statusFilter, pagination.page])

  async function fetchUsers() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      })

      const res = await fetch(`/api/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setUsers(data.data || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 1,
      }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-dark-300 mb-1">User Management</h1>
        <p className="text-dark-400">View and manage all users on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 card-dark rounded-2xl p-4 flex items-center gap-2">
          <Search size={16} className="text-dark-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users by name, email, or phone..."
            className="flex-1 bg-transparent outline-none text-sm text-dark-300 placeholder-dark-500"
          />
          <button type="submit" className="btn-primary text-sm px-4 py-2">
            Search
          </button>
        </form>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="card-dark rounded-2xl p-4 pr-10 appearance-none text-sm text-dark-300 cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="TUTOR">Tutors</option>
              <option value="ADMIN">Admins</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="card-dark rounded-2xl p-4 pr-10 appearance-none text-sm text-dark-300 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="card-dark rounded-2xl p-12 text-center">
          <UserIcon size={48} className="mx-auto mb-4 text-dark-600" />
          <p className="text-dark-400">No users found</p>
        </div>
      ) : (
        <div className="card-dark rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">User</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Contact</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Role</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Joined</th>
                  <th className="text-left px-6 py-4 text-dark-400 text-xs font-medium uppercase">Stats</th>
                  <th className="text-right px-6 py-4 text-dark-400 text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-dark-300 text-sm">{user.name}</div>
                          <div className="text-dark-500 text-xs">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-dark-400 text-sm">
                          <Mail size={12} />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-dark-500 text-xs">
                            <Phone size={10} />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                        user.role === 'TUTOR' ? 'bg-purple-500/10 text-purple-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          user.isActive ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <span className="text-sm text-dark-300">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {!user.isVerified && user.role === 'TUTOR' && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-dark-400 text-sm">
                        <Calendar size={12} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 text-xs text-dark-500">
                        {user.role === 'TUTOR' && (
                          <>
                            <span>{user.totalCourses || 0} courses</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{user.totalEnrollments || 0} enrollments</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/users/${user.id}`}
                          className="p-2 rounded-lg text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/dashboard/admin/users/${user.id}/edit`}
                          className="p-2 rounded-lg text-dark-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Edit2 size={16} />
                        </Link>
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${user.name}?`)) {
                                // Handle delete
                              }
                            }}
                            className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-dark-800 flex items-center justify-between">
              <div className="text-sm text-dark-500">
                Showing {((pagination.page - 1) * 10) + 1} to {Math.min(pagination.page * 10, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="btn-secondary px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}