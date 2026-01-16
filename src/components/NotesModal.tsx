'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus, ArrowLeft, Edit, Type, Heading1, Heading2, Bold, Italic, Underline } from 'lucide-react'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  verses: string[]
}

interface NotesModalProps {
  isOpen: boolean
  onClose: () => void
  notes: Note[]
  onSave: (note: Omit<Note, 'id' | 'createdAt'> & { id?: string }) => void
}

export default function NotesModal({ isOpen, onClose, notes, onSave }: NotesModalProps) {
   const [view, setView] = useState<'list' | 'add' | 'edit'>('list')
   const [editingNote, setEditingNote] = useState<Note | null>(null)
   const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const editorRef = useRef<HTMLDivElement>(null)
     const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
     const [lineCount, setLineCount] = useState(1)

     // Function to convert HTML back to markdown
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

     const updateLineCount = useCallback(() => {
       if (editorRef.current) {
         const html = editorRef.current.innerHTML
         const md = htmlToMarkdown(html)
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

    // Function to render markdown to HTML for preview
   const renderContent = (content: string): string => {
     return content
       .replace(/`(.*?)`/g, '<code>$1</code>')
       .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
       .replace(/\*(.*?)\*/g, '<em>$1</em>')
       .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
       .replace(/^# (.+)$/gm, '<h1>$1</h1>')
       .replace(/^## (.+)$/gm, '<h2>$1</h2>')
   }





    // Text formatting functions
    const formatText = useCallback((format: string) => {
     const selection = window.getSelection()
     if (!selection || selection.rangeCount === 0) return
     const range = selection.getRangeAt(0)

     switch (format) {
       case 'h1':
         const selectedText1 = range.toString()
         const html1 = selectedText1 ? `<h1>${selectedText1}</h1>` : '<h1>Heading 1</h1>'
         document.execCommand('insertHTML', false, html1)
         break
       case 'h2':
         const selectedText2 = range.toString()
         const html2 = selectedText2 ? `<h2>${selectedText2}</h2>` : '<h2>Heading 2</h2>'
         document.execCommand('insertHTML', false, html2)
         break
       case 'bold':
       case 'italic':
       case 'underline':
         document.execCommand(format)
         updateActiveFormats()
         break
       case 'code':
         const code = document.createElement('code')
         try {
           range.surroundContents(code)
          } catch {
            // If can't surround, insert HTML
            document.execCommand('insertHTML', false, '<code>code</code>')
          }
          break
      }
    }, [updateActiveFormats])

   // Keyboard shortcuts
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if (view === 'add' || view === 'edit') {
         if (e.ctrlKey || e.metaKey) {
           switch (e.key.toLowerCase()) {
             case 'b':
               e.preventDefault()
               formatText('bold')
               break
             case 'i':
               e.preventDefault()
               formatText('italic')
               break
             case 'u':
               e.preventDefault()
               formatText('underline')
               break
           }
         } else if (e.key === 'Enter') {
           // Update line count immediately after Enter
           setTimeout(() => updateLineCount(), 0)
         }
       }
     }

     document.addEventListener('keydown', handleKeyDown)
     return () => document.removeEventListener('keydown', handleKeyDown)
   }, [view, content])

   // Update active formats on selection change and input
   useEffect(() => {
     const handleSelectionChange = () => {
       if (view === 'add' || view === 'edit') {
         updateActiveFormats()
       }
     }

     const handleInput = () => {
       if (view === 'add' || view === 'edit') {
         updateActiveFormats()
       }
     }

     document.addEventListener('selectionchange', handleSelectionChange)
     if (editorRef.current) {
       editorRef.current.addEventListener('input', handleInput)
     }

     return () => {
       document.removeEventListener('selectionchange', handleSelectionChange)
       if (editorRef.current) {
         editorRef.current.removeEventListener('input', handleInput)
       }
     }
    }, [view, formatText, updateLineCount])

   useEffect(() => {
     if (isOpen) {
       setView('list')
       setEditingNote(null)
       setTitle('')
       setContent('')
     }
   }, [isOpen]) // eslint-disable-line react-hooks/set-state-in-effect

     useEffect(() => {
       if (view === 'edit' && editingNote) {
         setTitle(editingNote.title)
         setContent('')
       } else if (view === 'add') {
         setTitle('')
         setContent('')
       }
     }, [view, editingNote]) // eslint-disable-line react-hooks/set-state-in-effect

     useEffect(() => {
       if (editorRef.current) {
         editorRef.current.innerHTML = content ? renderContent(content) : ''
         // Reset active formats when content changes
         setActiveFormats(new Set())
         setLineCount(content.split('\n').length || 1)
       }
     }, [content, view]) // eslint-disable-line react-hooks/set-state-in-effect

  const handleSave = () => {
    if (!content.trim()) return

    const noteData: Omit<Note, 'id' | 'createdAt'> & { id?: string } = {
      id: editingNote?.id,
      title: title.trim(),
      content: content.trim(),
      verses: editingNote?.verses || [],
    }
    onSave(noteData)
    setView('list')
    setEditingNote(null)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setView('edit')
  }

  const handleAdd = () => {
    setEditingNote(null)
    setView('add')
  }

  const handleBack = () => {
    setView('list')
    setEditingNote(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/30 w-full max-w-6xl h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 ease-out">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200/40 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {(view === 'add' || view === 'edit') && (
              <button
                onClick={handleBack}
                className="p-2.5 rounded-2xl hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-200 hover:scale-110"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {view === 'list' ? 'My Notes' : view === 'add' ? 'Create Note' : 'Edit Note'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {view === 'list' ? (
            <div className="p-8">
              {notes.length === 0 ? (
                <div className="text-center py-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-gray-100/80 dark:bg-gray-800/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Plus className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-3">No notes yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Start capturing your thoughts and insights from Bible study</p>
                  <button
                    onClick={handleAdd}
                    className="px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                  >
                    Create First Note
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* New Note Button */}
                  <button
                    key="new-note-button"
                    onClick={handleAdd}
                    className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 rounded-2xl border border-gray-200/40 dark:border-gray-700/40 p-6 hover:shadow-xl hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-300 cursor-pointer group hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-4 flex flex-col items-center justify-center gap-3 text-white"
                    style={{ animationDelay: `0ms` }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-semibold text-lg">New</span>
                  </button>
                  {notes.map((note, index) => (
                    <div
                      key={note.id}
                      onClick={() => handleEdit(note)}
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/40 dark:border-gray-700/40 p-6 hover:shadow-xl hover:border-gray-300/60 dark:hover:border-gray-600/60 transition-all duration-300 cursor-pointer group hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate flex-1 text-lg">
                          {note.title || 'Untitled Note'}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(note)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:scale-110"
                        >
                          <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                       <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: note.content ? renderContent(note.content) : 'No content' }} />
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{new Date(note.createdAt).toLocaleDateString()}</span>
                        {note.verses.length > 0 && (
                          <span className="bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full font-medium">
                            {note.verses.length} verse{note.verses.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Title <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your note a title..."
                  className="w-full px-5 py-4 border border-gray-200/60 rounded-2xl bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 text-lg focus:outline-none"
                />
              </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                   Content
                 </label>
                 <div className="flex border border-gray-200/60 rounded-2xl bg-white focus-within:outline-none min-h-[120px]">
                   <div className="flex-shrink-0 w-10 text-gray-400 text-base font-mono leading-relaxed py-4 pr-1 select-none border-r border-gray-200/40">
                     {Array.from({ length: lineCount }, (_, i) => (
                       <span key={`line-${i}`} className="block text-right">
                         {i + 1}
                       </span>
                     ))}
                   </div>
                   <div
                     ref={editorRef}
                     contentEditable
                     onInput={updateLineCount}
                     onBlur={() => {
                       if (editorRef.current) {
                         const html = editorRef.current.innerHTML
                         if (html.trim() === '') {
                           setContent('')
                         } else {
                           setContent(htmlToMarkdown(html).trim())
                         }
                         updateLineCount()
                       }
                     }}
                     className="flex-1 px-5 py-4 text-gray-900 resize-none transition-all duration-200 text-base leading-relaxed focus:outline-none overflow-hidden font-['Inter','system-ui','-apple-system','sans-serif']"
                     style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', textAlign: 'left', whiteSpace: 'pre-wrap' }}
                   />
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer - only show for add/edit */}
        {(view === 'add' || view === 'edit') && (
          <div className="flex-shrink-0 p-6 border-t border-gray-200/40 bg-gray-50/30">
            {/* Formatting Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-200/40 shadow-sm">
                <button
                  onClick={() => formatText('h1')}
                  className="p-2 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105"
                  title="Heading 1 (Ctrl+Alt+1)"
                >
                  <Heading1 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => formatText('h2')}
                  className="p-2 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105"
                  title="Heading 2 (Ctrl+Alt+2)"
                >
                  <Heading2 className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                 <button
                   onClick={() => formatText('bold')}
                   className={`p-2 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105 ${activeFormats.has('bold') ? 'bg-blue-100 text-blue-900 border border-blue-300' : ''}`}
                   title="Bold (Ctrl+B)"
                 >
                   <Bold className={`w-4 h-4 ${activeFormats.has('bold') ? 'text-blue-700' : 'text-gray-600'}`} />
                 </button>
                 <button
                   onClick={() => formatText('italic')}
                   className={`p-2 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105 ${activeFormats.has('italic') ? 'bg-blue-100 text-blue-900 border border-blue-300' : ''}`}
                   title="Italic (Ctrl+I)"
                 >
                   <Italic className={`w-4 h-4 ${activeFormats.has('italic') ? 'text-blue-700' : 'text-gray-600'}`} />
                 </button>
                 <button
                   onClick={() => formatText('underline')}
                   className={`p-2 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105 ${activeFormats.has('underline') ? 'bg-blue-100 text-blue-900 border border-blue-300' : ''}`}
                   title="Underline (Ctrl+U)"
                 >
                   <Underline className={`w-4 h-4 ${activeFormats.has('underline') ? 'text-blue-700' : 'text-gray-600'}`} />
                 </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={() => formatText('code')}
                  className="p-2 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all duration-200 hover:scale-105"
                  title="Code"
                >
                  <Type className="w-4 h-4 text-gray-600" />
                </button>

              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 text-gray-600 hover:bg-white hover:shadow-sm rounded-2xl transition-all duration-200 hover:scale-105 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!content.trim()}
                  className="px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                >
                  {view === 'add' ? 'Create Note' : 'Update Note'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}