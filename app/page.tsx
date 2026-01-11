'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import VerseDisplay from '@/components/VerseDisplay'
import VerseSidebar from '@/components/VerseSidebar'
import LeftSidebar from '@/components/LeftSidebar'
import { BibleVerse } from '@/lib/bibleApi'
import { Menu, X, BookOpen, User, Settings, Languages, Mic, MicOff } from 'lucide-react'

function NineDotsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="5" r="1.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="18" cy="5" r="1.5" />
      <circle cx="6" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="18" cy="12" r="1.5" />
      <circle cx="6" cy="19" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
      <circle cx="18" cy="19" r="1.5" />
    </svg>
  )
}

export default function Home() {
  const [searchedVerses, setSearchedVerses] = useState<BibleVerse[]>([])
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
  const [verseContext, setVerseContext] = useState<{ book: string; chapter: number; verse: number } | null>(null)
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleVerseSelect = useCallback(async (verse: BibleVerse) => {
    console.log('handleVerseSelect called with:', verse)
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
    console.log('handleSearch called with:', query)
    setIsLoading(true)
    try {
      const response = await fetch(`/api/verses?q=${encodeURIComponent(query)}&type=auto`)
      const data = await response.json()

      console.log('API response:', data)

      if (data.verses && data.verses.length > 0) {
        console.log('Setting searched verses and selecting first verse:', data.verses[0])
        setSearchedVerses(data.verses)
        await handleVerseSelect(data.verses[0])
      } else {
        console.log('No verses found, checking local database')
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

  const extractVerseFromText = (text: string): string | null => {
    const lowerText = text.toLowerCase()

    const patterns = [
      /\b([1-3]?\s*\w+)\s+(\d+):(\d+)\b/i,
      /\b([1-3]?\s*\w+)\s+chapter\s+(\d+)\s+verse\s+(\d+)\b/i,
      /\b([1-3]?\s*\w+)\s+(\d+)\s+(\d+)\b/i,
      /\b(\w+)\s+(\d+):(\d+)\b/i,
      /\b(\w+)\s+(\d+)\b/i,
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const book = match[1].replace(/\s+/g, ' ').trim()
        if (match[3]) {
          return `${book} ${match[2]}:${match[3]}`
        } else {
          return `${book} ${match[2]}`
        }
      }
    }

    return null
  }

  const toggleMicListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      setIsListening(false)
    } else {
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript

            const verseRef = extractVerseFromText(transcript)
            if (verseRef) {
              console.log('Detected verse:', verseRef)
              handleSearch(verseRef)

              if (recognitionRef.current) {
                recognitionRef.current.stop()
                setTimeout(() => {
                  if (isListeningRef.current && recognitionRef.current) {
                    recognitionRef.current.start()
                  }
                }, 100)
              }
            }
          }
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          if (isListeningRef.current) {
            recognition.start()
          }
        }

        recognitionRef.current = recognition
        recognition.start()
      } else {
        alert('Speech recognition is not supported in your browser')
      }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <header className="h-10 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-5 py-[2rem] relative z-50 overflow-visible">
        <div className="h-full flex items-center justify-between w-full">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Left Sidebar"
          >
            {leftSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className={`flex-1 transition-all duration-300 px-3 ${leftSidebarCollapsed || rightSidebarCollapsed ? 'max-w-lg' : 'max-w-lg'}`}>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMicListening}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ''}`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            {isListening && (
              <span className="text-sm font-medium text-red-600 dark:text-red-400 animate-pulse">
                Listening...
              </span>
            )}
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Profile">
              <User className="w-5 h-5" />
            </button>
            <Link href="/settings" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Settings">
              <Settings className="w-5 h-5" />
            </Link>
            <div className="relative">
              <button
                onClick={() => {
                  setMoreOptionsOpen(prev => !prev)
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="More options"
              >
                <NineDotsIcon className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle Verses Sidebar"
            >
              {rightSidebarOpen ? <X className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
      {moreOptionsOpen && (
        <>
          <div onClick={() => { setMoreOptionsOpen(false); setLanguageDropdownOpen(false) }} className="fixed inset-0 z-[9999]" />
          <div className="fixed right-4 lg:right-[15px] top-12 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[10000]">
            <div
              className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onMouseEnter={() => setLanguageDropdownOpen(true)}
              onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
            >
              <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-base text-gray-700 dark:text-gray-300">Convert to</span>
            </div>
            {languageDropdownOpen && (
              <div
                className="absolute right-full top-0 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[10001]"
                onMouseEnter={() => setLanguageDropdownOpen(true)}
                onMouseLeave={() => setLanguageDropdownOpen(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedLanguage('English')
                    setMoreOptionsOpen(false)
                    setLanguageDropdownOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  English
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedLanguage('Tagalog')
                    setMoreOptionsOpen(false)
                    setLanguageDropdownOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Tagalog
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar
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
            selectedLanguage={selectedLanguage}
          />
        </div>

        <VerseSidebar
          currentVerse={selectedVerse ? { reference: selectedVerse.reference, text: selectedVerse.text } : null}
          searchedVerses={searchedVerses}
          onSelectVerse={handleVerseSelect}
          onSelectSuggestion={async (reference) => {
            const response = await fetch(`/api/verses?q=${encodeURIComponent(reference)}&type=auto`)
            const data = await response.json()
            if (data.verses?.length > 0) {
              await handleVerseSelect(data.verses[0])
            }
          }}
          isMobileOpen={rightSidebarOpen}
          onCloseMobile={() => setRightSidebarOpen(false)}
          isCollapsed={rightSidebarCollapsed}
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        />
      </div>
    </div>
  )
}
