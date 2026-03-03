'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  User, Mail, Phone, Lock, Camera, Save, ArrowLeft,
  Bell, Shield, Moon, Sun, Globe, CreditCard, Banknote,
  Key, AlertCircle, CheckCircle, XCircle, Eye, EyeOff
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
  avatar?: string
  bio?: string
  phone?: string
  isVerified: boolean
  createdAt: string
  preferences?: {
    emailNotifications: boolean
    pushNotifications: boolean
    darkMode: boolean
    language: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<UserProfile | null>(null)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    courseUpdates: true,
    paymentAlerts: true,
  })

  // Appearance preferences
  const [appearance, setAppearance] = useState({
    darkMode: true,
    compactView: false,
    language: 'en',
  })

  useEffect(() => {
    fetchUserProfile()
  }, [])

  async function fetchUserProfile() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (!userStr) {
        router.push('/auth/login')
        return
      }

      const userData = JSON.parse(userStr)
      
      // Fetch full profile from API
      const res = await fetch(`/api/users/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (res.ok) {
        const data = await res.json()
        setUser(data.data)
        setProfileForm({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          bio: data.data.bio || '',
        })
      } else {
        // Use localStorage data as fallback
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isVerified: false,
          createdAt: new Date().toISOString(),
        })
        setProfileForm({
          name: userData.name || '',
          email: userData.email || '',
          phone: '',
          bio: '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Update localStorage
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userData = JSON.parse(userStr)
        userData.name = profileForm.name
        userData.email = profileForm.email
        localStorage.setItem('user', JSON.stringify(userData))
      }

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'IMAGE')

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      // Update user avatar
      await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar: data.data.url }),
      })

      setSuccess('Avatar updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
      
      // Refresh user data
      fetchUserProfile()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/${user?.role?.toLowerCase() || ''}`} className="text-dark-400 hover:text-dark-300">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display text-2xl font-black text-dark-300">Settings</h1>
        </div>
        <div className="card-dark rounded-2xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-dark-400">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${user?.role?.toLowerCase() || ''}`} className="text-dark-400 hover:text-dark-300">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-2xl font-black text-dark-300">Settings</h1>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl p-4">
          <CheckCircle size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Settings Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-dark-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'profile' 
              ? 'bg-brand-500 text-white' 
              : 'text-dark-400 hover:text-dark-300 hover:bg-dark-800'
          }`}
        >
          <User size={16} className="inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'security' 
              ? 'bg-brand-500 text-white' 
              : 'text-dark-400 hover:text-dark-300 hover:bg-dark-800'
          }`}
        >
          <Lock size={16} className="inline mr-2" />
          Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'notifications' 
              ? 'bg-brand-500 text-white' 
              : 'text-dark-400 hover:text-dark-300 hover:bg-dark-800'
          }`}
        >
          <Bell size={16} className="inline mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'appearance' 
              ? 'bg-brand-500 text-white' 
              : 'text-dark-400 hover:text-dark-300 hover:bg-dark-800'
          }`}
        >
          <Sun size={16} className="inline mr-2" />
          Appearance
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <div className="lg:col-span-1">
            <div className="card-dark rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl mx-auto">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user?.name[0].toUpperCase()
                  )}
                </div>
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Camera size={14} />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <h2 className="text-xl font-bold text-dark-300">{user?.name}</h2>
              <p className="text-dark-400 text-sm mb-3">{user?.role}</p>
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand-500/10 text-brand-400 rounded-full text-xs">
                <Shield size={12} />
                {user?.isVerified ? 'Verified Account' : 'Unverified'}
              </div>
              <p className="text-dark-500 text-xs mt-4">
                Member since {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleProfileUpdate} className="card-dark rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-dark-300 mb-4">Profile Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="input-dark w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="input-dark w-full pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input-dark w-full pl-10"
                    placeholder="+234 123 456 7890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  className="input-dark w-full resize-y"
                  placeholder="Tell us a little about yourself..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handlePasswordChange} className="card-dark rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-dark-300 mb-4">Change Password</h2>
              
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Current Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-dark w-full pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-400"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">New Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-dark w-full pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-400"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-dark-500 mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-dark w-full pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-400"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="card-dark rounded-2xl p-6">
              <h3 className="text-sm font-medium text-dark-400 mb-4 flex items-center gap-2">
                <Shield size={16} />
                Security Tips
              </h3>
              <ul className="space-y-3 text-sm text-dark-400">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5" />
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5" />
                  <span>Enable two-factor authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5" />
                  <span>Don't share your password with anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-green-400 mt-0.5" />
                  <span>Change your password regularly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card-dark rounded-2xl p-6">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Notification Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 font-medium">Email Notifications</div>
                <div className="text-dark-500 text-sm">Receive updates via email</div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  notifications.emailNotifications ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  notifications.emailNotifications ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 font-medium">Push Notifications</div>
                <div className="text-dark-500 text-sm">Receive real-time updates in browser</div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, pushNotifications: !notifications.pushNotifications })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  notifications.pushNotifications ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  notifications.pushNotifications ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 font-medium">Marketing Emails</div>
                <div className="text-dark-500 text-sm">Receive promotions and offers</div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, marketingEmails: !notifications.marketingEmails })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  notifications.marketingEmails ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  notifications.marketingEmails ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 font-medium">Course Updates</div>
                <div className="text-dark-500 text-sm">Get notified when courses are updated</div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, courseUpdates: !notifications.courseUpdates })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  notifications.courseUpdates ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  notifications.courseUpdates ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 font-medium">Payment Alerts</div>
                <div className="text-dark-500 text-sm">Get notified about payments and withdrawals</div>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, paymentAlerts: !notifications.paymentAlerts })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  notifications.paymentAlerts ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  notifications.paymentAlerts ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="btn-primary inline-flex items-center gap-2 px-6 py-2">
              <Save size={16} />
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="card-dark rounded-2xl p-6">
          <h2 className="text-lg font-bold text-dark-300 mb-4">Appearance Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 font-medium">Dark Mode</div>
                <div className="text-dark-500 text-sm">Switch between light and dark themes</div>
              </div>
              <button
                onClick={() => setAppearance({ ...appearance, darkMode: !appearance.darkMode })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  appearance.darkMode ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  appearance.darkMode ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl">
              <div>
                <div className="text-dark-300 font-medium">Compact View</div>
                <div className="text-dark-500 text-sm">Show more content with less spacing</div>
              </div>
              <button
                onClick={() => setAppearance({ ...appearance, compactView: !appearance.compactView })}
                className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                  appearance.compactView ? 'bg-brand-500' : 'bg-dark-600'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  appearance.compactView ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">Language</label>
              <select
                value={appearance.language}
                onChange={e => setAppearance({ ...appearance, language: e.target.value })}
                className="input-dark w-full"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
                <option value="ar">Arabic</option>
                <option value="zh">Chinese</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="btn-primary inline-flex items-center gap-2 px-6 py-2">
              <Save size={16} />
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}