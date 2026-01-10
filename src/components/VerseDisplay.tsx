'use client'

import { BibleVerse } from '@/lib/bibleApi'
import { useState, useEffect } from 'react'
import { Book, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react'

interface VerseDisplayProps {
  verse: BibleVerse | null
  isLoading?: boolean
  onNextVerse?: () => void
  onPreviousVerse?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
}

export default function VerseDisplay({
  verse,
  isLoading,
  onNextVerse,
  onPreviousVerse,
  canGoNext = false,
  canGoPrevious = false,
}: VerseDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
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

  return (
    <div
      className={`flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 md:p-16 lg:p-24 flex flex-col relative ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Maximize2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-wide text-blue-600 dark:text-blue-400 uppercase mb-4">
            {verse.book_name}
          </p>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 dark:text-gray-300">
            Chapter {verse.chapter}:{verse.verse}
          </p>
        </div>

        <blockquote className="text-4xl md:text-6xl lg:text-8xl font-serif leading-relaxed text-gray-800 dark:text-gray-100 max-w-5xl">
          &ldquo;{verse.text}&rdquo;
        </blockquote>
      </div>

      <div className="mt-12 flex items-center justify-between">
        <button
          onClick={onPreviousVerse}
          disabled={!canGoPrevious}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            canGoPrevious
              ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Previous verse"
        >
          <ChevronLeft className="w-6 h-6" />
          Previous
        </button>

        <p className="text-base text-gray-500 dark:text-gray-400">
          King James Version
        </p>

        <button
          onClick={onNextVerse}
          disabled={!canGoNext}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
            canGoNext
              ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Next verse"
        >
          Next
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
