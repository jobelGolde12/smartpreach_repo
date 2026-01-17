'use client'

import { useState, useEffect } from 'react'
import { Play, Square, QrCode, Smartphone, Monitor } from 'lucide-react'
import { createLiveSession, deleteLiveSession, getLiveSession, updateLiveSession, LiveSession } from '@/lib/serverActions'

interface LiveSessionControllerProps {
  presentationId?: number
  onSessionUpdate?: (session: LiveSession | null) => void
}

export default function LiveSessionController({ presentationId, onSessionUpdate }: LiveSessionControllerProps) {
  const [session, setSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (session && onSessionUpdate) {
      onSessionUpdate(session)
    }
  }, [session, onSessionUpdate])

  const startSession = async () => {
    setLoading(true)
    try {
      const result = await createLiveSession(presentationId)
      if (result.success && result.sessionId) {
        const newSession = await getLiveSession(result.sessionId)
        if (newSession) {
          setSession(newSession)
        }
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    if (!session) return
    
    setLoading(true)
    try {
      await deleteLiveSession(session.id)
      setSession(null)
      setShowQR(false)
    } catch (error) {
      console.error('Failed to end session:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRemoteUrl = () => {
    if (!session) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/remote/${session.id}`
  }

  const getQRCodeUrl = () => {
    if (!session) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/api/qr?sessionId=${session.id}`
  }

  if (session) {
    return (
      <div className="bg-white rounded-xl border border-indigo-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">Live Session Active</span>
          </div>
          <button
            onClick={endSession}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white text-sm rounded-lg transition-colors"
          >
            <Square size={14} />
            End Session
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Remote Controller</span>
            </div>
            <p className="text-xs text-gray-600 mb-2">Scan QR code or use this URL:</p>
            <div className="bg-white rounded border border-gray-200 p-2 mb-2">
              <p className="text-xs font-mono text-gray-700 break-all">{getRemoteUrl()}</p>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs rounded transition-colors"
            >
              <QrCode size={12} />
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Monitor size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Session Status</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Session ID:</span>
                <span className="font-mono text-gray-800">{session.id}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Font Size:</span>
                <span className="text-gray-800">{session.font_size}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Blackout:</span>
                <span className="text-gray-800">{session.is_blackout ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
        </div>

        {showQR && (
          <div className="mt-4 flex justify-center">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <img 
                src={getQRCodeUrl()} 
                alt="QR Code for Remote Controller"
                className="w-64 h-64"
              />
              <p className="text-xs text-gray-600 text-center mt-2">Scan to open remote controller</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">Start Live Session</h3>
          <p className="text-sm text-gray-600">Enable remote control from phone or tablet</p>
        </div>
        <button
          onClick={startSession}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          <Play size={16} />
          {loading ? 'Starting...' : 'Start Session'}
        </button>
      </div>
    </div>
  )
}