'use client'

import { useState, useRef, useEffect } from 'react'
import { Highlighter, X } from 'lucide-react'

interface HighlightTooltipProps {
  onHighlight: (text: string) => void
  onUnhighlight: () => void
  selectedText: string
  position: { x: number; y: number }
  onClose: () => void
  isHighlighted: boolean
}

export default function HighlightTooltip({ 
  onHighlight, 
  onUnhighlight, 
  selectedText, 
  position, 
  onClose, 
  isHighlighted 
}: HighlightTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleHighlightClick = () => {
    onHighlight(selectedText)
    onClose()
  }

  const handleUnhighlightClick = () => {
    onUnhighlight()
    onClose()
  }

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[999999999] bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3 min-w-fit"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-10px)',
      }}
    >
      {isHighlighted ? (
        <button
          onClick={handleUnhighlightClick}
          className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-200 rounded-md transition-colors text-sm font-medium"
          title="Remove highlight from selected text"
        >
          <X className="w-4 h-4" />
          <span>Unhighlight</span>
        </button>
      ) : (
        <button
          onClick={handleHighlightClick}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-md transition-colors text-sm font-medium"
          title="Highlight selected text"
        >
          <Highlighter className="w-4 h-4" />
          <span>Highlight</span>
        </button>
      )}
    </div>
  )
}