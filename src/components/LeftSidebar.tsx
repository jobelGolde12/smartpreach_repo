'use client'

import { useState } from 'react'
import { BibleVerse } from '@/lib/bibleApi'
import { ChevronLeft, ChevronRight, X, BookOpen, Layout, Settings, Home, FileText } from 'lucide-react'
import BibleNavigatorContent from './BibleNavigatorContent'

interface LeftSidebarProps {
  onSelectVerse: (verse: BibleVerse) => void
  isLoading?: boolean
  isMobileOpen?: boolean
  onCloseMobile?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

type SidebarView = 'menu' | 'bible-navigator' | 'notes' | 'settings'

export default function LeftSidebar({
  onSelectVerse,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: LeftSidebarProps) {
  const [currentView, setCurrentView] = useState<SidebarView>('menu')
  const [isBibleNavigatorAtBooksLevel, setIsBibleNavigatorAtBooksLevel] = useState(true)

  const menuItems = [
    { id: 'bible-navigator' as SidebarView, label: 'Bible Navigator', icon: BookOpen },
    { id: 'notes' as SidebarView, label: 'Notes', icon: FileText },
    { id: 'settings' as SidebarView, label: 'Settings', icon: Settings },
  ]

  const handleMenuClick = (viewId: SidebarView) => {
    if (currentView === viewId) {
      setCurrentView('menu')
    } else {
      setCurrentView(viewId)
    }
  }

  const handleBackToMenu = () => {
    setCurrentView('menu')
  }

  const handleBibleNavigatorViewStateChange = (isAtBooksLevel: boolean) => {
    setIsBibleNavigatorAtBooksLevel(isAtBooksLevel)
  }

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          ${isCollapsed ? 'w-16' : 'w-[25%] min-w-[320px]'}
          bg-white/80 dark:bg-gray-900/80
          backdrop-blur-xl
          border-r border-gray-200/50 dark:border-gray-800/50
          flex flex-col
          transition-all duration-300
          md:translate-x-0
          fixed inset-y-0 left-0 z-50 md:static
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          h-full
        `}
      >
        <div className="p-4 pb-0 dark:border-gray-800/50">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Sidebar
              </h2>
            )}
            <div className="flex gap-2">
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={onCloseMobile}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isCollapsed && currentView !== 'menu' && isBibleNavigatorAtBooksLevel && (
            <button
              onClick={handleBackToMenu}
              className="w-full flex items-center gap-2 px-3 py-2 mb-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Menu
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {currentView === 'menu' && (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all group dark:text-gray-200"
                    >
                      <item.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentView === 'bible-navigator' && (
              <BibleNavigatorContent 
                onSelectVerse={onSelectVerse} 
                isCollapsed={isCollapsed}
                onViewStateChange={handleBibleNavigatorViewStateChange}
              />
            )}

            {currentView === 'notes' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Coming soon</p>
                </div>
              </div>
            )}

            {currentView === 'settings' && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Use the settings page</p>
                </div>
              </div>
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Layout className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-400" style={{ writingMode: 'vertical-rl' }}>
                Menu
              </p>
            </div>
          </div>
        )}
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  )
}
