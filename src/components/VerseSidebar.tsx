'use client'

import { BibleVerse } from '@/lib/bibleApi'
import { getRecentVerses, getFavorites, addToFavorites, removeFromFavorites, Verse } from '@/lib/serverActions'
import { useEffect, useState } from 'react'
import { Clock, Heart, HeartOff, X, ChevronRight, ChevronLeft } from 'lucide-react'

interface VerseSidebarProps {
  searchedVerses: BibleVerse[]
  onSelectVerse: (verse: BibleVerse) => void
  activeVerse?: BibleVerse | null
  isMobileOpen?: boolean
  onCloseMobile?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

type DisplayVerse = BibleVerse | Verse

const getBookName = (verse: DisplayVerse): string => {
  return 'book_name' in verse ? verse.book_name : verse.book
}

export default function VerseSidebar({
  searchedVerses,
  onSelectVerse,
  activeVerse,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: VerseSidebarProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'favorites'>('search')
  const [recentVerses, setRecentVerses] = useState<Verse[]>([])
  const [favoriteVerses, setFavoriteVerses] = useState<Verse[]>([])

  const loadRecentVerses = async () => {
    const verses = await getRecentVerses()
    setRecentVerses(verses)
  }

  const loadFavorites = async () => {
    const verses = await getFavorites()
    setFavoriteVerses(verses)
  }

  useEffect(() => {
    ;(async () => {
      await loadRecentVerses()
      await loadFavorites()
    })()
  }, [])

  const handleToggleFavorite = async (verse: DisplayVerse) => {
    const verseId = 'id' in verse ? verse.id : null

    if (!verseId) return

    const isFavorited = favoriteVerses.some((v) => v.reference === verse.reference)

    if (isFavorited) {
      await removeFromFavorites(verseId)
      loadFavorites()
    } else {
      await addToFavorites(verseId)
      loadFavorites()
    }
  }

  const isFavorite = (verse: Verse | BibleVerse) => {
    return favoriteVerses.some((v) => v.reference === verse.reference)
  }

  const renderVerseItem = (verse: DisplayVerse) => {
    const isBibleVerse = 'book_name' in verse
    const bibleVerse: BibleVerse = isBibleVerse
      ? verse
      : {
          book_name: verse.book,
          book_id: '',
          chapter: verse.chapter,
          verse: verse.verse,
          text: verse.text,
          reference: verse.reference,
        }

    return (
      <button
        key={verse.reference + verse.verse}
        onClick={() => {
          onSelectVerse(bibleVerse)
          if (onCloseMobile) onCloseMobile()
        }}
        className={`w-full text-left p-4 rounded-xl transition-all mb-3 group ${
          activeVerse?.reference === verse.reference && activeVerse.verse === verse.verse
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p
              className={`font-semibold mb-1 ${
                activeVerse?.reference === verse.reference
                  ? 'text-white'
                  : 'text-gray-800 dark:text-gray-200'
              }`}
            >
              {getBookName(verse)} {verse.chapter}:{verse.verse}
            </p>
            <p
              className={`text-sm line-clamp-2 ${
                activeVerse?.reference === verse.reference
                  ? 'text-blue-100'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {verse.text}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleToggleFavorite(verse)
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
            aria-label={isFavorite(verse) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite(verse) ? (
              <Heart className="w-5 h-5 text-red-500 fill-current" />
            ) : (
              <HeartOff className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </button>
    )
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
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Verses</h2>
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

          {!isCollapsed && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab('recent')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                  activeTab === 'recent'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                Recent
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                  activeTab === 'favorites'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Heart className="w-4 h-4" />
                Favorites
              </button>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'search' && searchedVerses.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Search Results
                </p>
                {searchedVerses.map((verse) => renderVerseItem(verse))}
              </div>
            )}

            {activeTab === 'search' && searchedVerses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Search for a verse to see results</p>
              </div>
            )}

            {activeTab === 'recent' && recentVerses.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Recently Used
                </p>
                {recentVerses.map((verse) => renderVerseItem(verse))}
              </div>
            )}

            {activeTab === 'recent' && recentVerses.length === 0 && (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No recent verses yet</p>
              </div>
            )}

            {activeTab === 'favorites' && favoriteVerses.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Favorite Verses
                </p>
                {favoriteVerses.map((verse) => renderVerseItem(verse))}
              </div>
            )}

            {activeTab === 'favorites' && favoriteVerses.length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No favorite verses yet</p>
              </div>
            )}
          </div>
        )}

        {isCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Clock className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-400 writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>
                Verses
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
