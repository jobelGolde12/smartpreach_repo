'use client'

import { useState, useEffect, useCallback } from 'react'
import { getLiveSession, updateLiveSession, LiveSession } from '@/lib/serverActions'

export function useLiveSession(sessionId: string | null) {
  const [session, setSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(false)

  const loadSession = useCallback(async () => {
    if (!sessionId) return
    
    try {
      const sessionData = await getLiveSession(sessionId)
      setSession(sessionData)
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }, [sessionId])

  const updateSession = useCallback(async (updates: Partial<Omit<LiveSession, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!sessionId) return
    
    setLoading(true)
    try {
      await updateLiveSession(sessionId, updates)
      await loadSession() // Refresh session data
    } catch (error) {
      console.error('Failed to update session:', error)
    } finally {
      setLoading(false)
    }
  }, [sessionId, loadSession])

  useEffect(() => {
    if (!sessionId) return

    loadSession()

    // Set up polling for real-time updates
    const interval = setInterval(loadSession, 1000)

    return () => clearInterval(interval)
  }, [sessionId, loadSession])

  return { session, loading, updateSession }
}