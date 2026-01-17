'use client'

import { useEffect, useRef } from 'react'
import { useLiveSession } from '@/hooks/useLiveSession'
import { BibleVerse } from '@/lib/bibleApi'

interface LiveSessionSyncProps {
  sessionId: string | null
  currentVerse: BibleVerse | null
  onVerseChange: (verse: BibleVerse) => void
  onBlackoutChange: (isBlackout: boolean) => void
  onFontSizeChange: (fontSize: number) => void
}

export default function LiveSessionSync({
  sessionId,
  currentVerse,
  onVerseChange,
  onBlackoutChange,
  onFontSizeChange,
}: LiveSessionSyncProps) {
  const { session } = useLiveSession(sessionId)
  const lastProcessedRef = useRef<string | null>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!session) return

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Handle verse change only if reference actually changed and is different from current verse
    if (session.current_reference && 
        currentVerse?.reference !== session.current_reference &&
        lastProcessedRef.current !== session.current_reference) {
      
      console.log('LiveSessionSync: Verse reference changed to:', session.current_reference)
      
      // Debounce the API call to prevent rapid requests
      debounceTimeoutRef.current = setTimeout(() => {
        fetch(`/api/verses?q=${encodeURIComponent(session.current_reference!)}&type=auto`)
          .then(res => res.json())
          .then(data => {
            if (data.verses?.length > 0) {
              console.log('LiveSessionSync: Fetched verse:', data.verses[0].reference)
              onVerseChange(data.verses[0])
              lastProcessedRef.current = session.current_reference
            } else {
              console.warn('LiveSessionSync: No verses found for reference:', session.current_reference)
              lastProcessedRef.current = session.current_reference
            }
          })
          .catch(error => {
            console.error('Error fetching verse from session:', error)
            lastProcessedRef.current = session.current_reference
          })
      }, 300) // 300ms debounce delay
    }

    // Handle blackout change
    onBlackoutChange(session.is_blackout)

    // Handle font size change
    onFontSizeChange(session.font_size)
  }, [session?.current_reference, session?.is_blackout, session?.font_size, currentVerse?.reference, onVerseChange, onBlackoutChange, onFontSizeChange])

  return null // This is a sync-only component
}