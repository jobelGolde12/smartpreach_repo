'use client'

import { BibleVerse } from '@/lib/bibleApi'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Book, Maximize2, Minimize2, ChevronLeft, ChevronRight, ChevronDown, Trash2 } from 'lucide-react'
import HighlightTooltip from './HighlightTooltip'

interface VerseDisplayProps {
  verse: BibleVerse | null
  isLoading?: boolean
  onNextVerse?: () => void
  onPreviousVerse?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  selectedLanguage?: string
  onRecentSelect?: (reference: string) => void
  setDefaultVerse?: (verse: BibleVerse) => void
  isBlackout?: boolean
  fontSize?: number
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
  setDefaultVerse,
  isBlackout = false,
  fontSize = 100,
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
    const [verseToRestore, setVerseToRestore] = useState<BibleVerse | null>(null)
    
    // Highlighting states
    const [highlights, setHighlights] = useState<any[]>([])
    const [selectedText, setSelectedText] = useState('')
    const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
    const [showTooltip, setShowTooltip] = useState(false)

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

  const fetchHighlights = useCallback(async (verseReference: string) => {
    try {
      const response = await fetch(`/api/highlights?verseReference=${encodeURIComponent(verseReference)}`)
      if (response.ok) {
        const data = await response.json()
        setHighlights(data.highlights || [])
      }
    } catch (error) {
      console.error('Failed to fetch highlights:', error)
    }
  }, [])

  const deleteRecentVerse = useCallback(async (reference: string) => {
    try {
      const response = await fetch(`/api/verses`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      })
      
      if (response.ok) {
        // Refresh the recent verses list
        await fetchRecentVerses()
        console.log('Verse deleted successfully')
      } else {
        console.error('Failed to delete verse:', await response.text())
      }
    } catch (error) {
      console.error('Error deleting verse:', error)
    }
  }, [fetchRecentVerses])

  const deleteAllRecentVerses = useCallback(async () => {
    try {
      // Store current verse to restore when verse changes
      let currentVerseToRestore: BibleVerse | null = null
      if (verse) {
        const matchingVerse = recentVerses.find(v => v.reference === verse.reference)
        if (matchingVerse) {
          currentVerseToRestore = matchingVerse
        }
      }
      
      // Store verse to restore
      setVerseToRestore(currentVerseToRestore)

      const response = await fetch('/api/verses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteAll: true }),
      })
      
      if (response.ok) {
        // Refresh the recent verses list
        await fetchRecentVerses()
        console.log('All recent verses deleted successfully')
      } else {
        console.error('Failed to delete all recent verses:', await response.text())
      }
    } catch (error) {
      console.error('Error deleting all recent verses:', error)
    }
  }, [fetchRecentVerses, recentVerses, verse])





  const renderHighlightedText = useCallback((text: string) => {
    if (highlights.length === 0) {
      return text
    }

    // Sort highlights by start index
    const sortedHighlights = [...highlights].sort((a, b) => a.start_index - b.start_index)
    
    const elements: React.ReactNode[] = []
    let lastIndex = 0

    for (const highlight of sortedHighlights) {
      // Add text before highlight
      if (highlight.start_index > lastIndex) {
        elements.push(text.slice(lastIndex, highlight.start_index))
      }

      // Add highlighted text
      const highlightedText = text.slice(highlight.start_index, highlight.end_index)
      elements.push(
        <span
          key={highlight.id}
          className="bg-yellow-200 dark:bg-yellow-800/40 rounded px-1"
          style={{ backgroundColor: highlight.color === 'yellow' ? 'rgba(250, 204, 21, 0.3)' : highlight.color }}
        >
          {highlightedText}
        </span>
      )

      lastIndex = highlight.end_index
    }

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex))
    }

    return elements
  }, [highlights])

  const isTextAlreadyHighlighted = useCallback(() => {
    if (!selectionRange || highlights.length === 0) {
      return false
    }

    // Check if the selected range matches any existing highlight
    return highlights.some(highlight => 
      selectionRange!.start >= highlight.start_index && 
      selectionRange!.end <= highlight.end_index
    )
  }, [selectionRange, highlights])

  const handleUnhighlight = useCallback(async () => {
    if (!selectionRange || highlights.length === 0) return

    // Find the highlight that matches the selected range
    const matchingHighlight = highlights.find(highlight => 
      selectionRange.start >= highlight.start_index && 
      selectionRange.end <= highlight.end_index
    )

    if (matchingHighlight) {
      await removeHighlight(matchingHighlight.id)
    }

    // Clear selection
    window.getSelection()?.removeAllRanges()
    setShowTooltip(false)
  }, [selectionRange, highlights])

  const removeHighlight = useCallback(async (highlightId: number) => {
    try {
      const response = await fetch('/api/highlights', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highlightId: highlightId
        }),
      })

      if (response.ok) {
        // Refresh highlights
        if (verse) {
          fetchHighlights(verse.reference)
        }
        console.log('Highlight removed successfully')
      } else {
        console.error('Failed to remove highlight:', await response.text())
      }
    } catch (error) {
      console.error('Error removing highlight:', error)
    }
  }, [fetchHighlights, verse])

  // Track which verses have been saved to prevent redundant saves
  const savedVersesRef = useRef<Set<string>>(new Set())
  // Track if default verse has been set to prevent repeated setting
  const defaultVerseSetRef = useRef<boolean>(false)

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

  const handleHighlight = useCallback(async (text: string) => {
    if (!verse || !selectionRange) return

    try {
      // Save the verse first to ensure it exists in database
      await saveCurrentVerse()

      // Small delay to ensure verse is saved
      await new Promise(resolve => setTimeout(resolve, 100))

      // Save highlight using verse reference
      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse_reference: verse.reference,
          start_index: selectionRange.start,
          end_index: selectionRange.end,
          highlighted_text: text,
          color: 'yellow',
        }),
      })

      if (response.ok) {
        // Refresh highlights
        fetchHighlights(verse.reference)
        console.log('Highlight saved successfully')
      } else {
        console.error('Failed to save highlight:', await response.text())
      }
    } catch (error) {
      console.error('Error saving highlight:', error)
    }

    // Clear selection
    window.getSelection()?.removeAllRanges()
    setShowTooltip(false)
  }, [verse, selectionRange, fetchHighlights, saveCurrentVerse])

   useEffect(() => {
      if (verse) {
        handleLanguageChange(selectedLanguage)
        fetchHighlights(verse.reference)
      }
    }, [selectedLanguage, verse, fetchHighlights]) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  useEffect(() => {
    fetchRecentVerses()
  }, [])

  // Set default verse when no verse is provided and recent verses are available
  useEffect(() => {
    if (!verse && recentVerses.length > 0 && setDefaultVerse && !defaultVerseSetRef.current) {
      const latestVerse = recentVerses[0] // recent verses are ordered by displayed_at desc
      setDefaultVerse(latestVerse)
      defaultVerseSetRef.current = true
    } else if (verse) {
      // Reset the flag when a verse is manually selected
      defaultVerseSetRef.current = false
    }
  }, [verse, recentVerses.length, setDefaultVerse]) // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
     if (verse) {
       saveCurrentVerse()
       
       // Restore previous verse to recent verses if it was stored
       if (verseToRestore && verseToRestore.reference !== verse.reference) {
         // Re-save the previous verse to recent verses
         fetch('/api/verses', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             reference: verseToRestore.reference,
             verses: [verseToRestore],
           }),
         }).then(() => {
           // Refresh the recent verses list
           fetchRecentVerses()
           // Clear the verse to restore after adding it back
           setVerseToRestore(null)
         }).catch(error => {
           console.error('Error restoring verse:', error)
         })
       }
     }
   }, [verse, saveCurrentVerse, verseToRestore, fetchRecentVerses])

   const displayText = translatedText || verse?.text || ''

   // Apply blackout effect
   const shouldShowBlackout = isBlackout && verse !== null

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      setShowTooltip(false)
      return
    }

    const selectedText = selection.toString().trim()
    if (selectedText.length === 0) {
      setShowTooltip(false)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    setSelectedText(selectedText)
    
    // Create a temporary range to count characters from the beginning
    const tempRange = document.createRange()
    tempRange.selectNodeContents(range.startContainer.parentElement!)
    tempRange.setEnd(range.startContainer, range.startOffset)
    const startCharCount = tempRange.toString().length
    
    const endCharCount = startCharCount + selectedText.length
    
    setSelectionRange({ start: startCharCount, end: endCharCount })
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
    setShowTooltip(true)
  }, [])

  const isLongText = displayText.length > 500 || displayText.split(/\s+/).filter(word => word.length > 0).length > 80
  const shouldMoveNavUp = displayText.length >= 330

  const getFontSizeClass = () => {
    // If session fontSize is set, use it instead of auto-sizing
    if (fontSize !== 100) {
      const baseSize = fontSize / 100
      if (baseSize < 0.7) return 'text-xs md:text-sm'
      if (baseSize < 0.85) return 'text-sm md:text-base'
      if (baseSize < 1) return 'text-base md:text-lg'
      if (baseSize < 1.15) return 'text-lg md:text-xl'
      if (baseSize < 1.3) return 'text-xl md:text-2xl'
      if (baseSize < 1.5) return 'text-2xl md:text-3xl'
      return 'text-3xl md:text-4xl'
    }

    // Original auto-sizing logic
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
    if (recentVerses.length > 0 && !defaultVerseSetRef.current) {
      return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 md:p-16">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-xl text-gray-600 dark:text-gray-400">Getting Recent Verse...</p>
          </div>
        </div>
      )
    }
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
      {showTooltip && tooltipPosition && (
        <HighlightTooltip
          selectedText={selectedText}
          position={tooltipPosition}
          onHighlight={handleHighlight}
          onUnhighlight={handleUnhighlight}
          isHighlighted={isTextAlreadyHighlighted()}
          onClose={() => setShowTooltip(false)}
        />
      )}
      
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
              <blockquote 
                className={`font-serif leading-relaxed text-gray-800 dark:text-gray-100 max-w-6xl mx-auto transition-all duration-300 max-h-[50vh] overflow-y-auto ${getModalFontSizeClass()} ${
                  textVisible && !shouldShowBlackout ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                } select-text`}
                onMouseUp={handleTextSelection}
                onSelect={handleTextSelection}
              >
                &ldquo;{renderHighlightedText(displayText)}&rdquo;
              </blockquote>
              {isTranslating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {shouldShowBlackout && (
                <div className="absolute inset-0 bg-black transition-opacity duration-500 flex items-center justify-center">
                  <div className="text-white text-lg font-medium">Screen Hidden</div>
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
            <blockquote 
              className={`font-serif leading-relaxed text-gray-800 dark:text-gray-100 max-w-5xl mx-auto transition-all duration-500 max-h-[45vh] overflow-y-auto ${getFontSizeClass()} ${
                textVisible && !shouldShowBlackout ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              } relative select-text`}
              onMouseUp={handleTextSelection}
              onSelect={handleTextSelection}
            >
              &ldquo;{renderHighlightedText(displayText)}&rdquo;
            </blockquote>
            {isTranslating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {shouldShowBlackout && (
              <div className="absolute inset-0 bg-black transition-opacity duration-500 flex items-center justify-center">
                <div className="text-white text-lg font-medium">Screen Hidden</div>
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
          <div className="shrink-0 mt-4 p-3 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 relative">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Recent ({recentVerses.length})
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={deleteAllRecentVerses}
                  className="group p-1 rounded hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
                </button>
                <button
                  onClick={() => setShowRecent(prev => !prev)}
                  className="p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors flex items-center"
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${showRecent ? 'rotate-180' : ''}`} />
                </button>
              </div>
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
                      onClick={() => {
                        setHoveredVerse(null)
                        onRecentSelect?.(v.reference)
                      }}
                  >
                    {v.reference}
                    {hoveredVerse?.reference === v.reference && (
                      <div 
                        className="verse-tooltip absolute -top-2 left-1/2 -translate-x-1/2 z-[999999999] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-2xl border rounded-lg p-4 text-sm font-serif leading-relaxed max-w-md whitespace-pre-wrap -translate-y-full mt-1 max-h-40 overflow-y-auto w-max border-gray-200 dark:border-gray-700"
                        onMouseEnter={() => setHoveredVerse(v)}
                        onMouseLeave={() => setHoveredVerse(null)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100 text-base">{v.reference}</div>
                            <div className="leading-relaxed text-gray-800 dark:text-gray-200 text-sm">{v.text}</div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteRecentVerse(v.reference)
                              setHoveredVerse(null)
                            }}
                            className="flex-shrink-0 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors"
                            aria-label="Delete verse"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
