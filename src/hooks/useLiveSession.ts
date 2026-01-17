'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getLiveSession, updateLiveSession, LiveSession } from '@/lib/serverActions'

export function useLiveSession(sessionId: string | null) {
  const [session, setSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(false)
  const prevSessionRef = useRef<LiveSession | null>(null)

  const loadSession = useCallback(async () => {
    if (!sessionId) return
    
    try {
      const sessionData = await getLiveSession(sessionId)
      
      // Only update session if data actually changed
      if (!prevSessionRef.current || 
          JSON.stringify(prevSessionRef.current) !== JSON.stringify(sessionData)) {
        setSession(sessionData)
        prevSessionRef.current = sessionData
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }, [sessionId])

  const updateSession = useCallback(async (updates: Partial<Omit<LiveSession, 'id' | 'created_at' | 'updated_at'>>) => {
    if (!sessionId) return
    
    setLoading(true)
    try {
      await updateLiveSession(sessionId, updates)
      // Don't immediately reload session - let the polling handle it
      // This prevents recursive updates
    } catch (error) {
      console.error('Failed to update session:', error)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return

    // Initial load
    loadSession()

    // Set up polling for real-time updates with reduced frequency (5 seconds)
    const interval = setInterval(loadSession, 5000)

    return () => {
      clearInterval(interval)
      prevSessionRef.current = null
    }
  }, [sessionId, loadSession])

  return { session, loading, updateSession }
}