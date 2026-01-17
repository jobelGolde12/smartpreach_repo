'use client'

import { useState, useCallback, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'
import VerseDisplay from '@/components/VerseDisplay'
import VerseSidebar from '@/components/VerseSidebar'
import LeftSidebar from '@/components/LeftSidebar'
import NotesModal from '@/components/NotesModal'
import PresentationsModal from '@/components/PresentationsModal'
import { BibleVerse } from '@/lib/bibleApi'
import { useSession } from 'next-auth/react'
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

interface Note {
   id: string
   title: string
   content: string
   createdAt: string
   verses: string[]
 }

 interface SpeechRecognitionEvent extends Event {
   results: SpeechRecognitionResultList
   resultIndex: number
 }

 interface SpeechRecognitionErrorEvent extends Event {
   error: string
   message: string
 }

 interface SpeechRecognition extends EventTarget {
   lang: string
   continuous: boolean
   interimResults: boolean
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
    onend: ((this: SpeechRecognition, ev: Event) => void) | null
   start(): void
   stop(): void
   abort(): void
 }

 interface SpeechRecognitionConstructor {
   new(): SpeechRecognition
 }

 declare global {
   interface Window {
     SpeechRecognition: SpeechRecognitionConstructor
     webkitSpeechRecognition: SpeechRecognitionConstructor
   }
 }

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const { data: session, status } = useSession();
 
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
    }
  }, [status, session, router]);
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
   const recognitionRef = useRef<SpeechRecognition | null>(null)
    const isListeningRef = useRef<boolean>(false)
    const shouldRestartRef = useRef<boolean>(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [notesModalOpen, setNotesModalOpen] = useState(false)
  const [presentationsModalOpen, setPresentationsModalOpen] = useState(false)

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

  useEffect(() => {
    const savedNotes = localStorage.getItem('bibleNotes')
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes))
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    }
  }, [])

  // Handle URL parameters for opening modals
  useEffect(() => {
    const openPresentations = searchParams.get('openPresentations')
    const viewPresentation = searchParams.get('viewPresentation')

    if (openPresentations === 'true') {
      setPresentationsModalOpen(true)

      // If there's a new presentation, it will be handled by the modal
      // If viewPresentation is true, check sessionStorage for temp presentation
      if (viewPresentation === 'true') {
        const tempPresentation = sessionStorage.getItem('tempPresentation')
        if (tempPresentation) {
          try {
            JSON.parse(tempPresentation)
            // The modal will handle loading this presentation
            sessionStorage.removeItem('tempPresentation')
          } catch (error) {
            console.error('Error parsing temp presentation:', error)
          }
        }
      }
    }
  }, [searchParams])

  const handleVerseSelect = useCallback(async (verse: BibleVerse) => {
    console.log('handleVerseSelect called with:', verse)
    setSelectedVerse(verse)
    setSearchedVerses([]) // Clear searched verses when selecting a verse
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

  // Track recently selected references to prevent redundant API calls
  const recentSelectionsRef = useRef<Set<string>>(new Set())

  const handleRecentSelect = useCallback(async (reference: string) => {
    // Prevent duplicate calls for the same reference
    if (recentSelectionsRef.current.has(reference)) {
      console.log('Recent selection already in progress, skipping:', reference)
      return
    }

    recentSelectionsRef.current.add(reference)
    setIsLoading(true)
    try {
      const response = await fetch(`/api/verses?q=${encodeURIComponent(reference)}&type=auto`)
      const data = await response.json()
      if (data.verses?.length > 0) {
        setSearchedVerses(data.verses)
        await handleVerseSelect(data.verses[0])
      }
    } catch (error) {
      console.error('Error loading recent verse:', error)
    } finally {
      setIsLoading(false)
      // Clean up after a short delay to allow for new selections
      setTimeout(() => {
        recentSelectionsRef.current.delete(reference)
      }, 1000)
    }
  }, [handleVerseSelect])

  const handleSetDefaultVerse = useCallback(async (verse: BibleVerse) => {
    console.log('Setting default verse:', verse)
    await handleVerseSelect(verse)
  }, [handleVerseSelect])

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

  const saveNotesToStorage = (newNotes: Note[]) => {
    localStorage.setItem('bibleNotes', JSON.stringify(newNotes))
    setNotes(newNotes)
  }

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString()
    if (noteData.id) {
      // edit
      const updatedNotes = notes.map(note =>
        note.id === noteData.id
          ? { ...note, ...noteData, updatedAt: now }
          : note
      )
      saveNotesToStorage(updatedNotes)
    } else {
      // new
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: now,
      }
      saveNotesToStorage([...notes, newNote])
    }
  }

  const handleOpenNotesModal = () => {
    setNotesModalOpen(true)
  }

  const handleOpenPresentationsModal = () => {
    setPresentationsModalOpen(true)
  }

  const extractVerseFromText = (text: string): string | null => {
    const patterns = [
      /\b([1-3]?\s*\w+)\s+(\d+):(\d+)\b/i,
      /\b([1-3]?\s*\w+)\s+chapter\s+(\d+)\s+verse\s+(\d+)\b/i,
      /\b([1-3]?\s*\w+)\s+(\d+)\s+(\d+)\b/i,
      /\b(\w+)\s+(\d+):(\d+)\b/i,
      /\b(\w+)\s+(\d+)\b/i,
    ]

    for (const pattern of patterns) {
      const match = text.toLowerCase().match(pattern)
      if (match) {
        const book = match[1].replace(/\s+/g, ' ').trim()
        if (match[3]) {
          return `${book} ${match[2]}:${match[3]}`
        } else {
          return `${book} ${match[2]}`
        }
      }
    }

    const numberPattern = /\b(?:verse\s*)?(\d+)\b/i
    const numberMatch = text.toLowerCase().trim().match(numberPattern)
    if (numberMatch && verseContext) {
      const verseNum = parseInt(numberMatch[1], 10)
      return `${verseContext.book} ${verseContext.chapter}:${verseNum}`
    }

    return null
  }

   const toggleMicListening = () => {
    if (isListening) {
      shouldRestartRef.current = false
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
      setIsListening(false)
    } else {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript

            const verseRef = extractVerseFromText(transcript)
            if (verseRef) {
              console.log('Detected verse:', verseRef)
              handleSearch(verseRef)

              if (recognitionRef.current) {
                shouldRestartRef.current = true
                recognitionRef.current.stop()
              }
            }
          }
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          if (isListeningRef.current && shouldRestartRef.current) {
            shouldRestartRef.current = false
            setTimeout(() => {
              if (recognitionRef.current && isListeningRef.current) {
                recognitionRef.current.start()
              }
            }, 100)
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
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-900">
      <header className="h-16 flex-shrink-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-6 py-3 relative z-50 overflow-visible border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="h-full flex items-center justify-between w-full max-w-7xl mx-auto">
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="md:hidden p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle Left Sidebar"
          >
            {leftSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className={`flex-1 transition-all duration-300 px-4 ${leftSidebarCollapsed || rightSidebarCollapsed ? 'max-w-2xl' : 'max-w-2xl'}`}>
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
          onOpenNotesModal={handleOpenNotesModal}
          onOpenPresentationsModal={handleOpenPresentationsModal}
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
            onRecentSelect={handleRecentSelect}
            setDefaultVerse={handleSetDefaultVerse}
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

      <NotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        notes={notes}
        onSave={handleSaveNote}
      />

      <PresentationsModal
        isOpen={presentationsModalOpen}
        onClose={() => setPresentationsModalOpen(false)}
      />
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
