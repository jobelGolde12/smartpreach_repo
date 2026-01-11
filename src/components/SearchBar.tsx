'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [removeBorder, setRemoveBorder] = useState(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query])

  useEffect(() => {
    if (debouncedQuery.trim()) {
      onSearch(debouncedQuery)
    }
  }, [debouncedQuery, onSearch])

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleExpand = () => {
    setIsExpanded(true)
    setRemoveBorder(true)
  }

  const handleCollapse = () => {
    if (!query.trim()) {
      setIsExpanded(false)
      setRemoveBorder(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={handleExpand}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open search"
      >
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={handleCollapse}
          placeholder="Search by verse (e.g., John 3:16) or keyword (e.g., love)..."
          className={`w-full px-4 py-2.5 pl-12 text-base rounded-xl bg-white shadow-sm outline-none transition-all dark:bg-gray-800 dark:text-white ${removeBorder ? '' : 'border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:focus:border-blue-400'}`}
          disabled={isLoading}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-pulse' : ''}`} />
        </div>
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </form>
  )
}
