'use client'

import { useState, useEffect } from 'react'
import { User, Edit2, Key, LogOut, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getUserData } from '@/lib/serverActions'

export default function AccountPage() {
  const router = useRouter()
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    profilePic: null as string | null,
  })
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const userId = localStorage.getItem('userId')

      if (userId) {
        const userData = await getUserData(userId)
        if (userData) {
          setUserData({
            id: userId,
            name: userData.name || '',
            email: userData.email,
            profilePic: userData.profile_pic || null,
          })
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    localStorage.removeItem('userId')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your profile and settings</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Profile Header */}
          <div className="p-8 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                {userData.profilePic ? (
                  <img
                    src={userData.profilePic}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50 dark:ring-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center ring-4 ring-gray-50 dark:ring-gray-700">
                    <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="mb-1">
                  {isLoadingProfile ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {userData.name || 'User'}
                    </h3>
                  )}
                </div>
                
                {isLoadingProfile ? (
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {userData.email || 'user@example.com'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 space-y-4">
            <button
              onClick={() => router.push('/settings/edit-profile')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Edit Profile</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal information</p>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                →
              </div>
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                  <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your security settings</p>
                </div>
              </div>
              <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                →
              </div>
            </button>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-medium group"
              >
                <LogOut className="w-5 h-5" />
                Logout
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}