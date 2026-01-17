'use client'

import { ArrowLeft, Palette, Bell, Shield, User, Music } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SettingsSection = 'appearance' | 'audio' | 'notifications' | 'privacy' | 'account'

const sidebarItems = [
  { id: 'appearance' as SettingsSection, icon: Palette, label: 'Appearance' },
  { id: 'audio' as SettingsSection, icon: Music, label: 'Audio' },
  { id: 'notifications' as SettingsSection, icon: Bell, label: 'Notifications' },
  { id: 'privacy' as SettingsSection, icon: Shield, label: 'Privacy' },
  { id: 'account' as SettingsSection, icon: User, label: 'Account' },
]

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Determine current section from pathname
  const getCurrentSection = () => {
    if (pathname === '/settings') return 'appearance'
    if (pathname === '/settings/appearance') return 'appearance'
    if (pathname === '/settings/audio') return 'audio'
    if (pathname === '/settings/notifications') return 'notifications'
    if (pathname === '/settings/privacy') return 'privacy'
    if (pathname === '/settings/account') return 'account'
    if (pathname === '/settings/edit-profile') return 'account'
    return 'appearance'
  }

  const currentSection = getCurrentSection()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="h-14 flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-[1.3rem]">
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
          <Link
            href="/"
            className="group p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        <aside className="w-64 flex-shrink-0 p-6 hidden lg:block">
          <nav className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-800 sticky top-24">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = currentSection === item.id
                return (
                  <li key={item.id}>
                    <Link
                      href={`/settings${item.id === 'appearance' ? '' : `/${item.id}`}`}
                      className="group relative block"
                    >
                      <div className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-transparent'
                        }
                      `}>
                        {/* Icon with subtle animation */}
                        <div className={`
                          transition-all duration-300
                          ${isActive 
                            ? 'scale-110' 
                            : 'group-hover:scale-110 group-hover:translate-x-0.5'
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <span className="font-medium text-sm">{item.label}</span>
                        
                        {/* Active indicator */}
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        
                        {/* Hover arrow indicator */}
                        <div className={`
                          absolute right-4 transition-all duration-300 opacity-0
                          ${!isActive ? 'group-hover:opacity-100 group-hover:translate-x-0' : 'translate-x-2'}
                        `}>
                          <svg 
                            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
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
                value={currentSection}
                onChange={(e) => {
                  const section = e.target.value as SettingsSection
                  window.location.href = `/settings${section === 'appearance' ? '' : `/${section}`}`
                }}
                className="w-full p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white font-medium transition-colors focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {sidebarItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}