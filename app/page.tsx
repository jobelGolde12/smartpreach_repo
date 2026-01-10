'use client'

import { useState, useCallback } from 'react'
import SearchBar from '@/components/SearchBar'
import VerseDisplay from '@/components/VerseDisplay'
import VerseSidebar from '@/components/VerseSidebar'
import BibleNavigator from '@/components/BibleNavigator'
import { BibleVerse } from '@/lib/bibleApi'
import { Menu, X, BookOpen } from 'lucide-react'

export default function Home() {
  const [searchedVerses, setSearchedVerses] = useState<BibleVerse[]>([])
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [verseContext, setVerseContext] = useState<{ book: string; chapter: number; verse: number } | null>(null)

  const handleVerseSelect = useCallback(async (verse: BibleVerse) => {
    setSelectedVerse(verse)
    setVerseContext({
      book: verse.book_name,
      chapter: verse.chapter,
      verse: verse.verse,
    })

    try {
      await fetch('/api/verses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: verse.reference,
          verses: [verse],
        }),
      })
    } catch (error) {
      console.error('Error saving verse:', error)
    }
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/verses?q=${encodeURIComponent(query)}&type=auto`)
      const data = await response.json()

      if (data.verses && data.verses.length > 0) {
        setSearchedVerses(data.verses)

        if (data.verses.length === 1) {
          await handleVerseSelect(data.verses[0])
        }
      } else {
        setSearchedVerses([])
      }
    } catch (error) {
      console.error('Error searching verses:', error)
      setSearchedVerses([])
    } finally {
      setIsLoading(false)
    }
  }, [handleVerseSelect])

  const handleNextVerse = useCallback(async () => {
    if (verseContext) {
      const { book, chapter, verse } = verseContext
      const response = await fetch(`/api/verses?q=${encodeURIComponent(`${book} ${chapter}:${verse + 1}`)}&type=auto`)
      const data = await response.json()
      if (data.verses?.length > 0) {
        await handleVerseSelect(data.verses[0])
      }
    }
  }, [verseContext, handleVerseSelect])

  const handlePreviousVerse = useCallback(async () => {
    if (verseContext && verseContext.verse > 1) {
      const { book, chapter, verse } = verseContext
      const response = await fetch(`/api/verses?q=${encodeURIComponent(`${book} ${chapter}:${verse - 1}`)}&type=auto`)
      const data = await response.json()
      if (data.verses?.length > 0) {
        await handleVerseSelect(data.verses[0])
      }
    }
  }, [verseContext, handleVerseSelect])

  const canGoNext = verseContext !== null
  const canGoPrevious = verseContext !== null && verseContext.verse > 1

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <header className="h-16 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 px-4">
        <div className="h-full flex items-center gap-3">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Bible Navigator"
          >
            {leftSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className={`flex-1 transition-all duration-300 ${leftSidebarCollapsed || rightSidebarCollapsed ? 'max-w-2xl' : 'max-w-2xl'}`}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Verses Sidebar"
          >
            {rightSidebarOpen ? <X className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <BibleNavigator
          onSelectVerse={handleVerseSelect}
          isLoading={isLoading}
          isMobileOpen={leftSidebarOpen}
          onCloseMobile={() => setLeftSidebarOpen(false)}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <VerseDisplay
            verse={selectedVerse}
            isLoading={isLoading}
            onNextVerse={handleNextVerse}
            onPreviousVerse={handlePreviousVerse}
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
          />
        </div>

        <VerseSidebar
          searchedVerses={searchedVerses}
          onSelectVerse={handleVerseSelect}
          activeVerse={selectedVerse}
          isMobileOpen={rightSidebarOpen}
          onCloseMobile={() => setRightSidebarOpen(false)}
          isCollapsed={rightSidebarCollapsed}
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        />
      </div>
    </div>
  )
}
