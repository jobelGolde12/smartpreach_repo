'use client'

import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { BibleVerse } from '@/lib/bibleApi'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  verses: string[]
}

interface NoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void
  editingNote: Note | null
  selectedVerse: BibleVerse | null
}

export default function NoteModal({ isOpen, onClose, onSave, editingNote, selectedVerse }: NoteModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (editingNote) {
        setTitle(editingNote.title)
        setContent(editingNote.content)
      } else {
        setTitle('')
        setContent('')
      }
    }
  }, [isOpen, editingNote])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return

    const now = new Date().toISOString()
    const note: Omit<Note, 'id' | 'createdAt'> & { id?: string } = {
      id: editingNote?.id,
      title: title.trim(),
      content: content.trim(),
      verses: editingNote?.verses || [],
    }
    onSave(note)
    onClose()
  }

  const insertCurrentVerse = () => {
    if (selectedVerse) {
      const verseRef = `${selectedVerse.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}`
      setContent(prev => prev + (prev ? '\n\n' : '') + verseRef + '\n' + selectedVerse.text)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-100/50 dark:border-gray-800/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {editingNote ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all hover:scale-105"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Content
              </label>
              {selectedVerse && (
                <button
                  onClick={insertCurrentVerse}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Insert Verse
                </button>
              )}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm resize-none transition-all"
            />
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center justify-end gap-4 p-6 border-t border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/30">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 rounded-xl transition-all hover:scale-105 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg font-medium"
          >
            {editingNote ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>
  )
}