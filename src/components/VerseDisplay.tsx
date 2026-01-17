'use client'

import { BibleVerse } from '@/lib/bibleApi'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Book, Maximize2, Minimize2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

interface VerseDisplayProps {
  verse: BibleVerse | null
  isLoading?: boolean
  onNextVerse?: () => void
  onPreviousVerse?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  selectedLanguage?: string
  onRecentSelect?: (reference: string) => void
}

export default function VerseDisplay({
  verse,
  isLoading,
  onNextVerse,
  onPreviousVerse,
  canGoNext = false,
  canGoPrevious = false,
  selectedLanguage = 'King James Version',
  onRecentSelect,
}: VerseDisplayProps) {
  const [isModal, setIsModal] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [translatedText, setTranslatedText] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [textVisible, setTextVisible] = useState(true)
const [recentVerses, setRecentVerses] = useState<BibleVerse[]>([])
    const [showRecent, setShowRecent] = useState(true)
    const [hoveredVerse, setHoveredVerse] = useState<BibleVerse | null>(null)
    const [recentScrollIndex, setRecentScrollIndex] = useState(0)

  const translateText = async (text: string, targetLanguage: string) => {
    if (targetLanguage === 'English') {
      return text
    }
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
      })
      const data = await response.json()
      return data.translatedText || text
    } catch (error) {
      console.error('Translation error:', error)
      return text
    }
  }

  const handleLanguageChange = async (language: string) => {
    if (!verse) return

    setTextVisible(false)
    await new Promise(resolve => setTimeout(resolve, 200))

    if (language !== 'English') {
      setIsTranslating(true)
      const translated = await translateText(verse.text, language)
      setTranslatedText(translated)
      setIsTranslating(false)
    } else {
      setTranslatedText('')
    }

    await new Promise(resolve => setTimeout(resolve, 100))
    setTextVisible(true)
  }

  const fetchRecentVerses = useCallback(async () => {
    try {
      const response = await fetch('/api/verses?recent=true&limit=100')
      if (response.ok) {
        const data = await response.json()
        setRecentVerses(data.verses || [])
      }
    } catch (error) {
      console.error('Failed to fetch recent verses:', error)
    }
  }, [])

  // Track which verses have been saved to prevent redundant saves
  const savedVersesRef = useRef<Set<string>>(new Set())

  const saveCurrentVerse = useCallback(async () => {
    if (!verse) return

    // Skip if this verse was already saved in this session
    const verseKey = `${verse.reference}-${verse.text.substring(0, 50)}`
    if (savedVersesRef.current.has(verseKey)) {
      console.log('Verse already saved, skipping:', verse.reference)
      return
    }

    try {
      await fetch('/api/verses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: verse.reference,
          verses: [verse],
        }),
      })
      // Mark this verse as saved
      savedVersesRef.current.add(verseKey)
      console.log('Verse saved:', verse.reference)
    } catch (error) {
      console.error('Failed to save verse:', error)
    }
  }, [verse])
   useEffect(() => {
     if (verse) {
       handleLanguageChange(selectedLanguage)
     }
   }, [selectedLanguage, verse]) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

   useEffect(() => {
     fetchRecentVerses()
   }, [])

   useEffect(() => {
     if (verse) {
       saveCurrentVerse()
     }
   }, [verse, saveCurrentVerse])

  const displayText = translatedText || verse?.text || ''

  const isLongText = displayText.length > 500 || displayText.split(/\s+/).filter(word => word.length > 0).length > 80
  const shouldMoveNavUp = displayText.length >= 330

  const getFontSizeClass = () => {
    const textLength = displayText.length
    const wordCount = displayText.split(/\s+/).filter(word => word.length > 0).length
    const lineCount = displayText.split('\n').length
    const avgWordLength = wordCount > 0 ? textLength / wordCount : 0

    if (textLength > 800 || (wordCount > 130 && avgWordLength > 5) || lineCount > 12) {
      return 'text-xs md:text-sm'
    } else if (textLength > 600 || (wordCount > 100 && avgWordLength > 5) || lineCount > 10) {
      return 'text-sm md:text-base'
    } else if (textLength > 400 || (wordCount > 70 && avgWordLength > 4) || lineCount > 7) {
      return 'text-base md:text-lg'
    } else if (textLength > 250 || wordCount > 40 || lineCount > 5) {
      return 'text-lg md:text-xl'
    } else {
      return 'text-xl md:text-2xl'
    }
  }

  const getModalFontSizeClass = () => {
    const textLength = displayText.length
    const wordCount = displayText.split(/\s+/).filter(word => word.length > 0).length
    const lineCount = displayText.split('\n').length
    const avgWordLength = wordCount > 0 ? textLength / wordCount : 0

    if (textLength > 800 || (wordCount > 130 && avgWordLength > 5) || lineCount > 12) {
      return 'text-sm md:text-base lg:text-lg'
    } else if (textLength > 600 || (wordCount > 100 && avgWordLength > 5) || lineCount > 10) {
      return 'text-base md:text-lg lg:text-xl'
    } else if (textLength > 400 || (wordCount > 70 && avgWordLength > 4) || lineCount > 7) {
      return 'text-lg md:text-xl lg:text-2xl'
    } else if (textLength > 250 || wordCount > 40 || lineCount > 5) {
      return 'text-xl md:text-2xl lg:text-3xl'
    } else {
      return 'text-2xl md:text-3xl lg:text-4xl'
    }
  }

  const toggleModal = () => {
    setIsModal(!isModal)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 md:p-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading verse...</p>
        </div>
      </div>
    )
  }

  if (!verse) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 md:p-16">
        <div className="text-center max-w-2xl">
          <Book className="w-32 h-32 text-gray-300 dark:text-gray-700 mx-auto mb-8" />
          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Welcome to Smart Preach
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-500">
            Search for a Bible verse to get started. You can search by verse reference or by keyword.
          </p>
        </div>
      </div>
    )
  }

  const handlePreviousVerse = () => {
    if (canGoPrevious && onPreviousVerse) {
      setIsNavigating(true)
      onPreviousVerse()
      setTimeout(() => setIsNavigating(false), 500)
    }
  }

  const handleNextVerse = () => {
    if (canGoNext && onNextVerse) {
      setIsNavigating(true)
      onNextVerse()
      setTimeout(() => setIsNavigating(false), 500)
    }
  }

  return (
    <>
      {isModal && (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
          <div className="flex-1 min-h-0 p-8 md:p-16 lg:p-24 flex flex-col items-center justify-center text-center max-w-7xl mx-auto">
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors z-50"
              aria-label="Exit fullscreen"
            >
              <Minimize2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="mb-8 shrink-0">
              <p className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-wide text-blue-600 dark:text-blue-400 uppercase mb-4">
                {verse.book_name}
              </p>
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-700 dark:text-gray-300">
                Chapter {verse.chapter}:{verse.verse}
              </p>
            </div>

            <div className="relative w-full min-h-0">
              <blockquote className={`font-serif leading-relaxed text-gray-800 dark:text-gray-100 max-w-6xl mx-auto transition-all duration-300 max-h-[50vh] overflow-y-auto ${getModalFontSizeClass()} ${
                textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                &ldquo;{displayText}&rdquo;
              </blockquote>
              {isTranslating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className={`shrink-0 ${shouldMoveNavUp ? 'p-3 md:p-4' : 'p-4 md:p-6'} flex items-center justify-between gap-2`}>
            <button
              onClick={handlePreviousVerse}
              disabled={!canGoPrevious || isNavigating}
              className={`flex items-center gap-2 md:gap-3 ${isLongText ? 'px-3 py-2 md:px-3 md:py-2' : 'px-4 py-3'} rounded-lg ${isLongText ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-normal transition-all ${
                canGoPrevious && !isNavigating
                  ? 'bg-gray-100/50 dark:bg-gray-700/30 hover:bg-gray-200/50 dark:hover:bg-gray-600/40 text-gray-600 dark:text-gray-400'
                  : 'bg-gray-50/30 dark:bg-gray-700/20 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Previous verse"
            >
              <ChevronLeft className={`w-3 h-3 md:w-5 md:h-5 ${isNavigating ? 'animate-pulse' : ''}`} />
              <span className="hidden md:inline">Previous</span>
            </button>

            <p className={`${isLongText ? 'text-xs md:text-sm' : 'text-sm md:text-base'} text-gray-500 dark:text-gray-400 flex items-center gap-2`}>
              {isTranslating ? (
                <>
                  <div className={`border-2 border-blue-500 border-t-transparent rounded-full animate-spin ${isLongText ? 'w-3 h-3' : 'w-4 h-4'}`} />
                  <span className="hidden md:inline">Translating...</span>
                  <span className="md:hidden">...</span>
                </>
              ) : (
                selectedLanguage
              )}
            </p>

            <button
              onClick={handleNextVerse}
              disabled={!canGoNext || isNavigating}
              className={`flex items-center gap-2 md:gap-3 ${isLongText ? 'px-3 py-2 md:px-3 md:py-2' : 'px-4 py-3'} rounded-lg ${isLongText ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-normal transition-all ${
                canGoNext && !isNavigating
                  ? 'bg-gray-100/50 dark:bg-gray-700/30 hover:bg-gray-200/50 dark:hover:bg-gray-600/40 text-gray-600 dark:text-gray-400'
                  : 'bg-gray-50/30 dark:bg-gray-700/20 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Next verse"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className={`w-3 h-3 md:w-5 md:h-5 ${isNavigating ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      )}

      <div
        className={`${
          !isModal ? 'flex-1' : 'hidden'
        } bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 md:p-16 lg:p-24 flex flex-col relative z-0`}
      >
        <button
          onClick={toggleModal}
          className="absolute top-4 right-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors z-50"
          aria-label="Enter fullscreen"
        >
          <Maximize2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
          <div className="mb-8 shrink-0">
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-blue-600 dark:text-blue-400 uppercase mb-4">
              {verse.book_name}
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 dark:text-gray-300">
              Chapter {verse.chapter}:{verse.verse}
            </p>
          </div>

          <div className="relative w-full min-h-0">
            <blockquote className={`font-serif leading-relaxed text-gray-800 dark:text-gray-100 max-w-5xl mx-auto transition-all duration-500 max-h-[45vh] overflow-y-auto ${getFontSizeClass()} ${
              textVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
            } relative`}>
              &ldquo;{displayText}&rdquo;
            </blockquote>
            {isTranslating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className={`shrink-0 flex items-center justify-between ${shouldMoveNavUp ? 'mt-4 md:mt-6' : 'mt-12'}`}>
          <button
            onClick={handlePreviousVerse}
            disabled={!canGoPrevious || isNavigating}
            className={`flex items-center gap-2 md:gap-3 ${isLongText ? 'px-3 py-2 md:px-3 md:py-2' : 'px-4 py-3'} rounded-lg ${isLongText ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-normal transition-all ${
              canGoPrevious && !isNavigating
                ? 'bg-gray-100/50 dark:bg-gray-700/30 hover:bg-gray-200/50 dark:hover:bg-gray-600/40 text-gray-600 dark:text-gray-400'
                : 'bg-gray-50/30 dark:bg-gray-700/20 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Previous verse"
          >
            <ChevronLeft className={`w-3 h-3 md:w-5 md:h-5 ${isNavigating ? 'animate-pulse' : ''}`} />
            <span className="hidden md:inline">Previous</span>
          </button>

          <p className={`${isLongText ? 'text-xs md:text-sm' : 'text-sm md:text-base'} text-gray-500 dark:text-gray-400 flex items-center gap-2`}>
            {isTranslating ? (
              <>
                <div className={`border-2 border-blue-500 border-t-transparent rounded-full animate-spin ${isLongText ? 'w-3 h-3' : 'w-4 h-4'}`} />
                <span className="hidden md:inline">Translating...</span>
                <span className="md:hidden">...</span>
              </>
            ) : (
              selectedLanguage
            )}
          </p>

          <button
            onClick={handleNextVerse}
            disabled={!canGoNext || isNavigating}
            className={`flex items-center gap-2 md:gap-3 ${isLongText ? 'px-3 py-2 md:px-3 md:py-2' : 'px-4 py-3'} rounded-lg ${isLongText ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-normal transition-all ${
              canGoNext && !isNavigating
                ? 'bg-gray-100/50 dark:bg-gray-700/30 hover:bg-gray-200/50 dark:hover:bg-gray-600/40 text-gray-600 dark:text-gray-400'
                : 'bg-gray-50/30 dark:bg-gray-700/20 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Next verse"
          >
            <span className="hidden md:inline">Next</span>
            <ChevronRight className={`w-3 h-3 md:w-5 md:h-5 ${isNavigating ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        {!isLoading && recentVerses.length > 0 && (
          <div className="shrink-0 mt-4 p-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 relative">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Recent ({recentVerses.length})
              </p>
              <button
                onClick={() => setShowRecent(prev => !prev)}
                className="p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors flex items-center"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showRecent ? 'rotate-180' : ''}`} />
              </button>
            </div>
{showRecent && (
               <div className="relative">
                 {recentScrollIndex > 0 && (
                   <button
                     onClick={() => setRecentScrollIndex(recentScrollIndex - 1)}
                     className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-600"
                     aria-label="Scroll left"
                   >
                     <ChevronLeft className="w-3 h-3" />
                   </button>
                 )}
                 
                 <div className="flex flex-row gap-2" style={{ marginLeft: recentScrollIndex > 0 ? '2rem' : '0', marginRight: '1rem' }}>
                {recentVerses.slice(recentScrollIndex, recentScrollIndex + 8).map((v, i) => (
                  <div
                    key={i}
                    className="relative group text-xs whitespace-nowrap px-3 py-1 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors min-w-fit flex-shrink-0"
onMouseEnter={(e) => {
                       setHoveredVerse(v)
                       const tooltip = e.currentTarget.querySelector('.verse-tooltip') as HTMLElement
                       if (tooltip) {
                         const rect = e.currentTarget.getBoundingClientRect()
                         Object.assign(tooltip.style, {
                           position: 'fixed',
                           top: `${rect.top + rect.height / 2}px`,
                           left: `${rect.right + 15}px`,
                           transform: 'translateY(-50%)',
                           zIndex: '999999999'
                         })
                       }
                     }}
                     onMouseLeave={() => setHoveredVerse(null)}
                    onClick={() => onRecentSelect?.(v.reference)}
                  >
                    {v.reference}
                    {hoveredVerse?.reference === v.reference && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-[999999999] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border rounded-lg p-4 text-sm font-serif leading-relaxed max-w-md pointer-events-none whitespace-pre-wrap -translate-y-full mt-1 max-h-40 overflow-y-auto w-max border-gray-200 dark:border-gray-700">
                        <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-base">{v.reference}</div>
                        <div className="leading-relaxed text-gray-800 dark:text-gray-200 text-sm">{v.text}</div>
                      </div>
                    )}
                  </div>
                ))}
                 </div>
                 
                 {recentScrollIndex + 8 < recentVerses.length && (
                   <button
                     onClick={() => setRecentScrollIndex(recentScrollIndex + 1)}
                     className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-600"
                     aria-label="Scroll right"
                   >
                     <ChevronRight className="w-3 h-3" />
                   </button>
                 )}
               </div>
             )}
          </div>
        )}
      </div>
    </>
  )
}
