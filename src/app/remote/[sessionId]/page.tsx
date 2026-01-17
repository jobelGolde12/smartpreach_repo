'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus,
  Home,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'
import { getLiveSession, updateLiveSession, getRecentVerses, getFavorites, Verse } from '@/lib/serverActions'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function RemoteControllerContent() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(true)
  const [recentVerses, setRecentVerses] = useState<Verse[]>([])
  const [favorites, setFavorites] = useState<Verse[]>([])
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent')

  useEffect(() => {
    if (!sessionId) {
      router.push('/')
      return
    }

    loadSession()
    loadVerses()

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadSession()
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionId, router])

  const loadSession = async () => {
    try {
      const sessionData = await getLiveSession(sessionId)
      if (sessionData) {
        setSession(sessionData)
        setConnected(true)
      } else {
        setConnected(false)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const loadVerses = async () => {
    try {
      const [recent, favs] = await Promise.all([
        getRecentVerses(10),
        getFavorites()
      ])
      setRecentVerses(recent)
      setFavorites(favs)
    } catch (error) {
      console.error('Failed to load verses:', error)
    }
  }

  const updateSessionState = async (updates: any) => {
    try {
      const result = await updateLiveSession(sessionId, updates)
      if (!result.success) {
        console.error('Failed to update session:', result.error)
        return
      }
      // Optimistically update local state
      setSession((prev: any) => prev ? { ...prev, ...updates, updated_at: Date.now() / 1000 } : null)
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  }

  const nextVerse = async () => {
    if (!session || !session.current_reference) return

    const verses = [...recentVerses, ...favorites]
    const currentIndex = verses.findIndex(v => v.reference === session.current_reference)
    
    if (currentIndex < verses.length - 1) {
      await updateSessionState({ current_reference: verses[currentIndex + 1].reference })
    }
  }

  const previousVerse = async () => {
    if (!session || !session.current_reference) return

    const verses = [...recentVerses, ...favorites]
    const currentIndex = verses.findIndex(v => v.reference === session.current_reference)
    
    if (currentIndex > 0) {
      await updateSessionState({ current_reference: verses[currentIndex - 1].reference })
    }
  }

  const toggleBlackout = async () => {
    if (!session) return
    await updateSessionState({ is_blackout: !session.is_blackout })
  }

  const increaseFontSize = async () => {
    if (!session) return
    const newSize = Math.min(session.font_size + 10, 200)
    await updateSessionState({ font_size: newSize })
  }

  const decreaseFontSize = async () => {
    if (!session) return
    const newSize = Math.max(session.font_size - 10, 50)
    await updateSessionState({ font_size: newSize })
  }

  const selectVerse = async (reference: string) => {
    await updateSessionState({ current_reference: reference })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p>Connecting to session...</p>
        </div>
      </div>
    )
  }

  if (!connected || !session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="text-white text-center max-w-md">
          <WifiOff className="mx-auto mb-4" size={48} />
          <h1 className="text-xl font-bold mb-2">Session Not Found</h1>
          <p className="text-gray-400 mb-4">Unable to connect to the live session. It may have ended or session ID is invalid.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">Remote Controller</span>
          </div>
          <div className="flex items-center gap-2">
            {connected ? <Wifi size={16} className="text-green-500" /> : <WifiOff size={16} className="text-red-500" />}
            <span className="text-xs text-gray-400">{sessionId}</span>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-1">Current Verse</p>
          <p className="text-sm font-medium">
            {session.current_reference || 'No verse selected'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Font: {session.font_size}% | Blackout: {session.is_blackout ? 'ON' : 'OFF'}
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={previousVerse}
            disabled={!session.current_reference}
            className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 rounded-xl transition-colors"
          >
            <ChevronLeft size={32} />
            <span className="text-xs mt-2">Previous</span>
          </button>
          <button
            onClick={nextVerse}
            disabled={!session.current_reference}
            className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 rounded-xl transition-colors"
          >
            <ChevronRight size={32} />
            <span className="text-xs mt-2">Next</span>
          </button>
        </div>

        {/* Display Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={toggleBlackout}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors ${
              session.is_blackout 
                ? 'bg-indigo-600 hover:bg-indigo-700' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            {session.is_blackout ? <EyeOff size={32} /> : <Eye size={32} />}
            <span className="text-xs mt-2">
              {session.is_blackout ? 'Show Screen' : 'Blackout'}
            </span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
            <Home size={32} />
            <span className="text-xs mt-2">Clear</span>
          </button>
        </div>

        {/* Font Size Controls */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-center mb-3 text-gray-400">Font Size</p>
          <div className="flex items-center justify-between">
            <button
              onClick={decreaseFontSize}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Minus size={20} />
            </button>
            <span className="text-lg font-medium min-w-[60px] text-center">{session.font_size}%</span>
            <button
              onClick={increaseFontSize}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Verse Selection */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'recent' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'favorites' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Favorites
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(activeTab === 'recent' ? recentVerses : favorites).map((verse) => (
              <button
                key={verse.id}
                onClick={() => selectVerse(verse.reference)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  session.current_reference === verse.reference
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <p className="font-medium">{verse.reference}</p>
                <p className="text-xs opacity-75 truncate">{verse.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RemoteController() {
  return (
    <ErrorBoundary>
      <RemoteControllerContent />
    </ErrorBoundary>
  )
}