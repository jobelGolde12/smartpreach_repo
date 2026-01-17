'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  ArrowLeft, 
  Edit3, 
  Type, 
  Heading1, 
  Heading2, 
  Bold, 
  Italic, 
  Underline, 
  Search,
  Star,
  Trash2
} from 'lucide-react'
import { 
  getNotes, 
  createNote, 
  updateNote, 
  toggleNoteFavorite, 
  deleteNote as deleteNoteFromDb,
  getFavoriteNotes,
  type Note 
} from '@/lib/serverActions'

const CARD_COLORS = [
  'bg-[#FFD179]', // Orange/Yellow
  'bg-[#FF9E7D]', // Coral/Peach
  'bg-[#E4EE91]', // Lime
  'bg-[#B69CFF]', // Purple
  'bg-[#00D1FF]', // Cyan
]

export default function NotesPage() {
  const { data: session } = useSession()
  const [notes, setNotes] = useState<Note[]>([])
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([])
  const [view, setView] = useState<'list' | 'favorites' | 'add' | 'edit'>('list')
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const [lineCount, setLineCount] = useState(1)

  const loadNotes = useCallback(async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const [userNotes, favNotes] = await Promise.all([
        getNotes(session.user.id),
        getFavoriteNotes(session.user.id)
      ])
      setNotes(userNotes)
      setFavoriteNotes(favNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])

  const htmlToMarkdown = useCallback((html: string): string => {
    return html
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<h1>(.*?)<\/h1>/g, '# $1')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1')
      .replace(/<div>(.*?)<\/div>/g, '$1\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n')
  }, [])

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      const md = htmlToMarkdown(html)
      setContent(md)
      setLineCount(md.split('\n').length || 1)
    }
  }, [htmlToMarkdown])

  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return
    const formats = new Set<string>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    setActiveFormats(formats)
  }, [])

  const renderContent = (content: string): string => {
    return content
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  }

  const formatText = useCallback((format: string) => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    switch (format) {
      case 'h1': document.execCommand('formatBlock', false, 'H1'); break
      case 'h2': document.execCommand('formatBlock', false, 'H2'); break
      case 'bold':
      case 'italic':
      case 'underline':
        document.execCommand(format)
        updateActiveFormats()
        break
      case 'code':
        document.execCommand('insertHTML', false, `<code>${range.toString() || 'code'}</code>`)
        break
    }
  }, [updateActiveFormats])

  useEffect(() => {
    if (view === 'edit' && editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
    } else if (view === 'add') {
      setTitle('')
      setContent('')
    }
  }, [view, editingNote])

  useEffect(() => {
    if (editorRef.current && (view === 'add' || view === 'edit')) {
      // Only set content if it's different from current editor content
      const currentHtml = editorRef.current.innerHTML
      const newHtml = content ? renderContent(content) : ''
      
      if (currentHtml !== newHtml) {
        editorRef.current.innerHTML = newHtml
      }
      
      // Update line count after setting content
      if (content) {
        const lines = content.split('\n').length || 1
        setLineCount(lines)
      } else {
        setLineCount(1)
      }
    }
  }, [view, content])

  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    const editorHtml = editorRef.current?.innerHTML || '';
    const contentToSave = htmlToMarkdown(editorHtml).trim();
    const titleToSave = title.trim() || 'Untitled Note';
    
    if (!contentToSave && !title.trim()) {
      return;
    }

    setLoading(true);
    try {
      if (editingNote) {
        const result = await updateNote(editingNote.id, titleToSave, contentToSave);
        if (result.success && result.note) {
          // Replace the note and sort again
          setNotes(prev => prev.map(n => n.id === editingNote.id ? result.note! : n).sort((a,b) => b.updated_at - a.updated_at));
          if (favoriteNotes.some(n => n.id === editingNote.id)) {
            setFavoriteNotes(prev => prev.map(n => n.id === editingNote.id ? result.note! : n).sort((a,b) => b.updated_at - a.updated_at));
          }
        } else {
          await loadNotes(); // fallback
        }
      } else {
        const result = await createNote(session.user.id, titleToSave, contentToSave);
        if (result.success && result.note) {
          setNotes(prev => [result.note!, ...prev]);
        } else {
          await loadNotes(); // fallback
        }
      }
      setView('list');
      setEditingNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleFavorite = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user?.id) return;

    const originalNotes = notes;
    const originalFavoriteNotes = favoriteNotes;

    const noteToToggle = notes.find(n => n.id === noteId);
    if (!noteToToggle) return;

    const updatedNote = { ...noteToToggle, is_favorite: !noteToToggle.is_favorite };

    setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));

    if (updatedNote.is_favorite) {
      setFavoriteNotes(prev => [updatedNote, ...prev]);
    } else {
      setFavoriteNotes(prev => prev.filter(n => n.id !== noteId));
    }

    try {
      await toggleNoteFavorite(noteId)
    } catch (error) {
      console.error('Error toggling favorite:', error)
      setNotes(originalNotes);
      setFavoriteNotes(originalFavoriteNotes);
    }
  }

  const deleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!session?.user?.id) return

    const originalNotes = notes;
    const originalFavoriteNotes = favoriteNotes;

    // Optimistically update UI
    setNotes(prev => prev.filter(n => n.id !== noteId));
    setFavoriteNotes(prev => prev.filter(n => n.id !== noteId));
    
    try {
      await deleteNoteFromDb(noteId)
    } catch (error) {
      console.error('Error deleting note:', error)
      // Rollback on failure
      setNotes(originalNotes);
      setFavoriteNotes(originalFavoriteNotes);
    }
  }

  const getCurrentNotes = () => {
    const baseNotes = view === 'favorites' ? favoriteNotes : notes
    return baseNotes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2] dark:bg-slate-950">
        <p className="text-slate-600 dark:text-slate-400">Please sign in to access your notes.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] dark:bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className="w-24 flex flex-col items-center py-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full z-10">
        <div className="mb-12">
          <span className="font-bold text-lg tracking-tight">Docket</span>
        </div>
        <button
          onClick={() => setView('add')}
          className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
        >
          <Plus className="w-8 h-8" />
        </button>
        
        {/* View Toggle */}
        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={() => setView('list')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              view === 'list' 
                ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="text-xs font-bold">All</span>
          </button>
          <button
            onClick={() => setView('favorites')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              view === 'favorites' 
                ? 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Star className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-24 p-8 bg-white dark:bg-slate-900 min-h-screen shadow-2xl overflow-y-auto">
        
        {/* Header with Search */}
        <header className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center gap-2 text-slate-400 mb-6">
            <Search className="w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <h1 className="text-4xl font-bold text-black dark:text-white tracking-tight">
            {view === 'list' ? 'Notes' : view === 'favorites' ? 'Favorites' : view === 'add' ? 'New Note' : 'Edit Note'}
          </h1>
        </header>

        {view === 'list' || view === 'favorites' ? (
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
              </div>
            ) : getCurrentNotes().length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">
                  {view === 'favorites' ? 'No favorite notes yet.' : 'No notes yet. Create your first note!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {getCurrentNotes().map((note, index) => (
                  <div
                    key={note.id}
                    onClick={() => { setEditingNote(note); setView('edit'); }}
                    className={`${CARD_COLORS[index % CARD_COLORS.length]} rounded-xl p-4 h-40 flex flex-col justify-between relative group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1`}
                  >
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button 
                        onClick={(e) => toggleFavorite(note.id, e)}
                        className="w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors"
                      >
                        <Star className={`w-3 h-3 ${note.is_favorite ? 'text-yellow-400 fill-current' : 'text-white'}`} />
                      </button>
                      <button 
                        onClick={(e) => deleteNote(note.id, e)}
                        className="w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    
                    <div className="pr-6">
                      <h3 className="text-sm font-semibold text-black leading-tight line-clamp-2">
                        {note.title}
                      </h3>
                      {note.content && (
                        <p className="text-xs text-black/70 mt-1 line-clamp-3">
                          {note.content}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-black/60 text-xs">
                        {new Date(note.created_at * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="w-6 h-6 bg-black/70 rounded-full flex items-center justify-center">
                        <Edit3 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Editor Section */
          <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-2">
                <button onClick={() => formatText('bold')} className="p-2 border rounded-lg hover:bg-slate-50"><Bold size={16}/></button>
                <button onClick={() => formatText('italic')} className="p-2 border rounded-lg hover:bg-slate-50"><Italic size={16}/></button>
                <button onClick={() => formatText('h1')} className="p-2 border rounded-lg hover:bg-slate-50"><Heading1 size={16}/></button>
              </div>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="ml-auto px-6 py-2 bg-black text-white text-sm rounded-full font-semibold hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full text-3xl font-bold bg-transparent border-none outline-none mb-6 placeholder:text-slate-400"
            />
            
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              className="w-full min-h-[400px] text-lg leading-relaxed outline-none"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>
        )}
      </main>
    </div>
  )
}