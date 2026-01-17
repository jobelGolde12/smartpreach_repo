'use client'

import { X } from 'lucide-react'
import LiveSessionController from './LiveSessionController'
import { LiveSession } from '@/lib/serverActions'
import { createPortal } from 'react-dom'

interface LiveSessionModalProps {
  onClose: () => void
  onSessionUpdate?: (session: LiveSession | null) => void
}

export default function LiveSessionModal({ onClose, onSessionUpdate }: LiveSessionModalProps) {
  if (typeof window === 'undefined') return null
  
  return createPortal(
    <div className="live-session-modal-wrapper fixed inset-0 bg-black/50 z-[999999] flex items-center justify-center" style={{ zIndex: 999999 }}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-3/4 flex flex-col m-4 relative z-[999999]" style={{ zIndex: 999999 }}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Live Session
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <LiveSessionController onSessionUpdate={onSessionUpdate} />
        </div>
      </div>
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .live-session-modal-wrapper {
          z-index: 999999 !important;
          position: fixed !important;
          inset: 0 !important;
        }
      `}</style>
    </div>,
    document.body
  )
}