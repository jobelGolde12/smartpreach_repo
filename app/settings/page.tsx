'use client'

import { useState } from 'react'
import { ArrowLeft, Type, Volume2, Palette, Bell, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

type SettingsSection = 'appearance' | 'audio' | 'notifications' | 'privacy' | 'account'
type Theme = 'light' | 'dark' | 'system'

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('appearance')
  const [fontSize, setFontSize] = useState('medium')
  const [volume, setVolume] = useState(75)
  const [notifications, setNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const { theme, setTheme } = useTheme()

  if (theme === undefined) {
    return null
  }

  const sidebarItems = [
    { id: 'appearance' as SettingsSection, icon: Palette, label: 'Appearance' },
    { id: 'audio' as SettingsSection, icon: Volume2, label: 'Audio' },
    { id: 'notifications' as SettingsSection, icon: Bell, label: 'Notifications' },
    { id: 'privacy' as SettingsSection, icon: Shield, label: 'Privacy' },
    { id: 'account' as SettingsSection, icon: User, label: 'Account' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Font Size</h3>
              <div className="grid grid-cols-3 gap-4">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      fontSize === size
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {(['light', 'dark', 'system'] as Theme[]).map((t) => {
                  const Icon = t === 'light' ? Type : t === 'dark' ? Volume2 : Palette
                  return (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-200 ${
                        theme === t
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-400 dark:border-indigo-500'
                          : 'bg-gray-100 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Icon className={`w-7 h-7 ${theme === t ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`} />
                      <span className={`text-sm font-medium ${theme === t ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'audio':
        return (
          <div className="space-y-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Master Volume</h3>
              <div className="space-y-6">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Quiet</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{volume}%</span>
                  <span className="font-medium">Loud</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Notification Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive notifications on your device</p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${notifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${notifications ? 'translate-x-7' : ''}`} />
                  </button>
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${emailNotifications ? 'translate-x-7' : ''}`} />
                  </button>
                </label>
              </div>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Data & Privacy</h3>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">Manage your personal data and privacy settings.</p>
                <button className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors">
                  Download My Data
                </button>
                <button className="w-full py-3 px-6 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-medium transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )

      case 'account':
        return (
          <div className="space-y-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Profile</h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">User Name</p>
                  <p className="text-gray-600 dark:text-gray-400">user@example.com</p>
                </div>
              </div>
              <div className="space-y-4">
                <button className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/30">
                  Edit Profile
                </button>
                <button className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="h-14 flex-shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-6">
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
          <Link
            href="/"
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        <aside className="w-64 flex-shrink-0 p-6 hidden lg:block">
          <nav className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50 sticky top-24">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        activeSection === item.id
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-3xl">
            <div className="lg:hidden mb-6">
              <select
                value={activeSection}
                onChange={(e) => setActiveSection(e.target.value as SettingsSection)}
                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium"
              >
                {sidebarItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
