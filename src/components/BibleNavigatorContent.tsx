'use client'

import { useState, forwardRef, useImperativeHandle } from 'react'
import { BIBLE_BOOKS, BibleBook } from '@/lib/bibleData'
import { BibleVerse } from '@/lib/bibleApi'
import { BookOpen, Loader2 } from 'lucide-react'

type ViewState = 'books' | 'chapters' | 'verses'

interface BibleNavigatorContentProps {
  onSelectVerse: (verse: BibleVerse) => void
  isCollapsed?: boolean
  onViewChange?: (view: ViewState) => void
  onExitBibleNavigator?: () => void
}

export interface BibleNavigatorRef {
  handleBack: () => void
}

const BibleNavigatorContent = forwardRef<BibleNavigatorRef, BibleNavigatorContentProps>(({
  onSelectVerse,
  isCollapsed = false,
  onViewChange,
  onExitBibleNavigator,
}, ref) => {

  const handleBack = () => {
    if (viewState === 'verses') {
      setViewState('chapters')
      setVerses([])
      onViewChange?.('chapters')
    } else if (viewState === 'chapters') {
      setViewState('books')
      setSelectedBook(null)
      setSelectedChapter(null)
      onViewChange?.('books')
    } else {
      // At books level, call the parent back handler
      onExitBibleNavigator?.()
    }
  }

  useImperativeHandle(ref, () => ({
    handleBack,
  }))
  const [viewState, setViewState] = useState<ViewState>('books')

  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [loadingVerses, setLoadingVerses] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTestament, setSelectedTestament] = useState<'Old' | 'New' | 'All'>('All')

  const filteredBooks = BIBLE_BOOKS.filter((book) => {
    const matchesSearch =
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.testament.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTestament = selectedTestament === 'All' || book.testament === selectedTestament

    return matchesSearch && matchesTestament
  })

  const groupedBooks = {
    Old: filteredBooks.filter((b) => b.testament === 'Old'),
    New: filteredBooks.filter((b) => b.testament === 'New'),
  }

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book)
    setSelectedChapter(null)
    setVerses([])
    setViewState('chapters')
    onViewChange?.('chapters')
  }

  const handleChapterSelect = async (chapter: number) => {
    setSelectedChapter(chapter)
    setLoadingVerses(true)
    setViewState('verses')
    onViewChange?.('verses')

    try {
      const reference = `${selectedBook!.name} ${chapter}`
      const response = await fetch(`/api/verses?q=${encodeURIComponent(reference)}&type=auto`)
      const data = await response.json()

      if (data.verses && data.verses.length > 0) {
        setVerses(data.verses)
      } else {
        setVerses([])
      }
    } catch (error) {
      console.error('Error fetching verses:', error)
      setVerses([])
    } finally {
      setLoadingVerses(false)
    }
  }



  const handleVerseClick = (verse: BibleVerse) => {
    onSelectVerse(verse)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className={`${viewState === 'books' ? 'p-4' : ''} border-b border-gray-200/50 dark:border-gray-800/50`}>

        {viewState === 'books' && (
          <>
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search books..."
                className="w-full px-4 py-2 pl-10 text-sm rounded-lg bg-transparent dark:text-white placeholder-gray-400 outline-none transition-all"
              />
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTestament('All')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTestament === 'All'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTestament('Old')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTestament === 'Old'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Old
              </button>
              <button
                onClick={() => setSelectedTestament('New')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTestament === 'New'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                New
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {viewState === 'books' && (
          <div className="space-y-6">
            {Object.entries(groupedBooks).map(([testament, books]) =>
              books.length > 0 && (
                <div key={testament}>
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-2">
                    {testament} Testament
                  </h3>
                  <div className="space-y-1">
                    {books.map((book) => (
                      <button
                        key={book.name}
                        onClick={() => handleBookSelect(book)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all group dark:text-gray-200"
                      >
                        <span className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {book.name[0]}
                          </div>
                          {book.name}
                        </span>
                        <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                          {book.chapters} ch
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No books found</p>
              </div>
            )}
          </div>
        )}

        {viewState === 'chapters' && selectedBook && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                {selectedBook.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a chapter ({selectedBook.chapters} chapters)
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(
                (chapter) => (
                  <button
                    key={chapter}
                    onClick={() => handleChapterSelect(chapter)}
                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                      selectedChapter === chapter
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {chapter}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {viewState === 'verses' && (
          <div className="space-y-3">
            <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {selectedBook!.name} {selectedChapter}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {verses.length} verses
              </p>
            </div>

            {loadingVerses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : verses.length > 0 ? (
              <div className="space-y-2">
                {verses.map((verse) => (
                  <button
                    key={verse.verse}
                    onClick={() => handleVerseClick(verse)}
                    className="w-full text-left p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {verse.verse}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {verse.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No verses found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
})

BibleNavigatorContent.displayName = 'BibleNavigatorContent'

export default BibleNavigatorContent
