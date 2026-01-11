'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, Loader2, X } from 'lucide-react'

interface AiSuggestion {
  reference: string
  reason: string
}

import { BibleVerse } from '@/lib/bibleApi'

interface VerseSidebarProps {
  currentVerse?: {
    reference: string
    text: string
  } | null
  onSelectSuggestion?: (reference: string) => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  searchedVerses?: BibleVerse[]
  onSelectVerse?: (verse: BibleVerse) => void
}

export default function VerseSidebar({
  currentVerse,
  onSelectSuggestion,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  searchedVerses = [],
  onSelectVerse,
}: VerseSidebarProps) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentVerse?.reference && currentVerse?.text) {
      fetchSuggestions()
    } else {
      setSuggestions([])
    }
  }, [currentVerse?.reference, currentVerse?.text])

  const fetchSuggestions = async () => {
    if (!currentVerse?.reference || !currentVerse?.text) return

    setIsLoading(true)
    setError(null)
    setSuggestions([])

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: currentVerse.reference,
          text: currentVerse.text,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get suggestions')
      }

      setSuggestions(data.suggestions || [])
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError('Failed to load suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = async (reference: string) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(reference)
    }
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
          border-l border-gray-200/50 dark:border-gray-800/50
          flex flex-col
          transition-all duration-300
          md:translate-x-0
          fixed inset-y-0 right-0 z-50 md:static
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          h-full
        `}
      >
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">{searchedVerses.length > 0 ? 'Search Results' : 'Related Scriptures'}</h2>
              </div>
            )}
            <div className="flex gap-2">
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
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
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {searchedVerses.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Search Results</h3>
                {searchedVerses.map((verse, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectVerse && onSelectVerse(verse)}
                    className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                  >
                    <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {verse.reference}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {verse.text}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {searchedVerses.length === 0 && isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">Preparing Scriptures…</p>
              </div>
            )}

            {searchedVerses.length === 0 && !isLoading && error && (
              <div className="text-center py-12">
                <p className="text-red-500 dark:text-red-400 mb-2">Error loading suggestions</p>
                <button
                  onClick={fetchSuggestions}
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  Try again
                </button>
              </div>
            )}

            {searchedVerses.length === 0 && !isLoading && !error && suggestions.length === 0 && currentVerse && (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No suggestions available</p>
              </div>
            )}

            {searchedVerses.length === 0 && !isLoading && !error && suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">AI Suggestions</h3>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.reference)}
                    className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                  >
                    <p className="font-semibold text-blue-600 dark:text-blue-400 mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                      {suggestion.reference}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {suggestion.reason}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {searchedVerses.length === 0 && !isLoading && !error && suggestions.length === 0 && !currentVerse && (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Select a verse to see AI suggestions</p>
              </div>
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-400 writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>
                AI
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
