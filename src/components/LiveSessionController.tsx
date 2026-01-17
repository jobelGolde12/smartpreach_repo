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
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-900">Live Session Active</span>
          </div>
          <button
            onClick={endSession}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 disabled:bg-gray-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
          >
            <Square size={14} />
            End Session
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone size={18} className="text-gray-700" />
              <span className="text-sm font-medium text-gray-900">Remote Controller</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">Scan QR code or use this URL:</p>
            <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
              <p className="text-xs font-mono text-gray-700 break-all">{getRemoteUrl()}</p>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              <QrCode size={14} />
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Monitor size={18} className="text-gray-700" />
              <span className="text-sm font-medium text-gray-900">Session Status</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Session ID</span>
                <span className="font-mono text-sm text-gray-900">{session.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Font Size</span>
                <span className="text-sm text-gray-900">{session.font_size}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Blackout</span>
                <span className={`text-sm font-medium ${session.is_blackout ? 'text-red-600' : 'text-gray-900'}`}>
                  {session.is_blackout ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {showQR && (
          <div className="mt-8 flex flex-col items-center">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <img 
                src={getQRCodeUrl()} 
                alt="QR Code for Remote Controller"
                className="w-64 h-64"
              />
              <p className="text-sm text-gray-600 text-center mt-3">Scan to open remote controller</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div 
        onClick={startSession}
        className="w-full max-w-2xl bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-12 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-6 group-hover:bg-indigo-100 transition-colors">
            <Play size={28} className="text-indigo-600" />
          </div>
          
          <h3 className="text-2xl font-medium text-gray-900 mb-3">Start Live Session</h3>
          <p className="text-gray-600 text-lg mb-8">Enable remote control from phone or tablet</p>
          
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg group-hover:bg-indigo-700 transition-colors">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Starting...</span>
              </>
            ) : (
              <>
                <Play size={18} />
                <span className="font-medium">Start Session</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}