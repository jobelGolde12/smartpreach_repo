'use client'

import { useEffect } from 'react'
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

  useEffect(() => {
    if (!session) return

    // Handle verse change
    if (session.current_reference && (!currentVerse || currentVerse.reference !== session.current_reference)) {
      console.log('LiveSessionSync: Verse reference changed to:', session.current_reference)
      fetch(`/api/verses?q=${encodeURIComponent(session.current_reference)}&type=auto`)
        .then(res => res.json())
        .then(data => {
          if (data.verses?.length > 0) {
            console.log('LiveSessionSync: Fetched verse:', data.verses[0].reference)
            onVerseChange(data.verses[0])
          } else {
            console.warn('LiveSessionSync: No verses found for reference:', session.current_reference)
          }
        })
        .catch(error => console.error('Error fetching verse from session:', error))
    }

    // Handle blackout change
    onBlackoutChange(session.is_blackout)

    // Handle font size change
    onFontSizeChange(session.font_size)
  }, [session, currentVerse, onVerseChange, onBlackoutChange, onFontSizeChange])

  return null // This is a sync-only component
}