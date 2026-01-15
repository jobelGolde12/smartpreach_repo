'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowLeft, Presentation, Download, Play, Sparkles, ChevronLeft, ChevronRight, Minimize2, BookOpen, FileUp } from 'lucide-react'
import { parse, Text } from 'pptxtojson'

interface PresentationSlide {
  title: string
  scripture?: string
  content: string
  notes?: string
}

interface Presentation {
  id: string
  topic: string
  slides: PresentationSlide[]
  createdAt: string
}

interface PresentationsModalProps {
  isOpen: boolean
  onClose: () => void
}

type View = 'list' | 'view'

export default function PresentationsModal({ isOpen, onClose }: PresentationsModalProps) {
  const router = useRouter()
  const [view, setView] = useState<View>('list')
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null)
   const [currentSlide, setCurrentSlide] = useState(0)
   const [isPresentationMode, setIsPresentationMode] = useState(false)
   const inputRef = useRef<HTMLInputElement>(null)

  const loadPresentations = () => {
    const saved = localStorage.getItem('presentations')
    if (saved) {
      try {
        setPresentations(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading presentations:', error)
      }
    }
  }

  const savePresentations = (newPresentations: Presentation[]) => {
    localStorage.setItem('presentations', JSON.stringify(newPresentations))
    setPresentations(newPresentations)
  }

  const handleNextSlide = () => {
    if (selectedPresentation && currentSlide < selectedPresentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleGoToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleBack = () => {
    setView('list')
    setSelectedPresentation(null)
  }

  useEffect(() => {
    if (isOpen) {
      setView('list')
      setSelectedPresentation(null)
      setCurrentSlide(0)
      setIsPresentationMode(false)
      loadPresentations()

      // Check for temp presentation from generation page
      const tempPresentation = sessionStorage.getItem('tempPresentation')
      if (tempPresentation) {
        try {
          const presentation = JSON.parse(tempPresentation)
          setSelectedPresentation(presentation)
          setView('view')
          setCurrentSlide(0)
          setIsPresentationMode(true)
          sessionStorage.removeItem('tempPresentation')
        } catch (error) {
          console.error('Error parsing temp presentation:', error)
        }
      }
     }
   }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPresentationMode) return

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        handleNextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevSlide()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsPresentationMode(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPresentationMode, currentSlide])

  const handleViewPresentation = (presentation: Presentation) => {
    // Navigate to the new presentation page
    router.push(`/presentation/${presentation.id}`)
  }

  const handleDownloadPPT = () => {
    if (!selectedPresentation) return

    const content = selectedPresentation.slides.map((slide, index) =>
      `Slide ${index + 1}: ${slide.title}\n\n${slide.content.split('\n').map(point => `• ${point}`).join('\n')}`
    ).join('\n\n---\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedPresentation.topic.replace(/\s+/g, '-').toLowerCase()}-presentation.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

   const handleRunInApp = () => {
     if (!selectedPresentation) return

     setCurrentSlide(0)
     setIsPresentationMode(true)
   }

    // Helper function to strip HTML tags and get plain text
    const stripHtml = (html: string): string => {
      // Remove HTML tags
      const text = html.replace(/<[^>]*>/g, '')
      // Decode HTML entities
      const decoded = text
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
      return decoded.trim()
    }

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      if (!file.name.toLowerCase().endsWith('.pptx')) {
        alert('Please select a .pptx file')
        return
      }
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pptxData = await parse(arrayBuffer)

        // Extract slides from PPTX data
        const slides = pptxData.slides.map((slide, index) => {
          // Collect all text content from elements
          const textElements = slide.elements.filter((el): el is Text => el.type === 'text') as Text[]
          const content = textElements
            .map((el) => stripHtml(el.content))
            .filter((text) => text && text.trim())
            .join('\n')

          // Try to find a title (usually the first text element or largest)
          let title = `Slide ${index + 1}`
          if (textElements.length > 0) {
            // Assume the first substantial text is the title
            const firstText = textElements.find(el => el.content && stripHtml(el.content).trim().length > 0)
            if (firstText) {
              const cleanTitle = stripHtml(firstText.content).trim()
              if (cleanTitle.length < 100 && cleanTitle.length > 0) { // Reasonable title length
                title = cleanTitle
              }
            }
          }

          return {
            title,
            content: content || 'No content found on this slide.'
          }
        })

        if (slides.length === 0) {
          alert('No slides found in the PPTX file.')
          return
        }

        const newPresentation = {
          id: Date.now().toString(),
          topic: file.name.replace(/\.pptx$/i, ''),
          slides,
          createdAt: new Date().toISOString()
        }
        const updated = [...presentations, newPresentation]
        savePresentations(updated)
        // Close modal and redirect to presentation page
        onClose()
        router.push(`/presentation/${newPresentation.id}`)
        e.target.value = ''
      } catch (error) {
        console.error('Error importing PPTX:', error)
        alert('Error importing presentation. Please try again.')
      }
    }

   if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 rounded-3xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 w-full max-w-6xl h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 ease-out overflow-hidden">
        {/* Enhanced Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200/40 dark:border-gray-700/40 bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {view === 'view' && (
              <button
                onClick={handleBack}
                className="p-3.5 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Presentation className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                {view === 'list' ? 'My Presentations' : selectedPresentation?.topic}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-3.5 rounded-2xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-110 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {view === 'list' ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-8 overflow-y-auto">
                {presentations.length === 0 ? (
                  <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                        <Presentation className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">No presentations yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                      Create stunning AI-powered presentations for your sermons and teachings
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {presentations.map((presentation, index) => (
                      <div
                        key={presentation.id}
                        onClick={() => handleViewPresentation(presentation)}
                        className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 backdrop-blur-sm rounded-2xl border border-gray-200/60 dark:border-gray-700/60 p-6 hover:shadow-2xl hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-300 cursor-pointer hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-4 overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Background gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Presentation className="w-7 h-7 text-white" />
                              </div>
                              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 truncate mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {presentation.topic}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              {presentation.slides.length} slide{presentation.slides.length > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Created {new Date(presentation.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enhanced Bottom Action Buttons */}
              <div className="flex-shrink-0 p-8 pt-0 border-t border-gray-200/40 dark:border-gray-700/40 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 backdrop-blur-sm">
                <div className="flex gap-6 justify-center">
                  {/* Button with huge padding, border radius, and no background */}
                   <button
                     onClick={() => inputRef.current?.click()}
                     className="flex items-center gap-3 px-10 py-5 border-2 border-gray-300 dark:border-gray-600 rounded-[2rem] hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:scale-[1.02] font-semibold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-lg hover:shadow-xl"
                   >
                     <FileUp className="w-6 h-6" />
                     Import Presentation
                   </button>

                  {/* Button with ultra light blue background */}
                  <button
                    onClick={() => router.push('/generate-presentation')}
                    className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-300 rounded-[2rem] hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/40 dark:hover:to-blue-700/40 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Sparkles className="w-6 h-6" />
                    Generate with AI
                  </button>
                </div>
              </div>
            </div>
          ) : view === 'view' && selectedPresentation ? (
            isPresentationMode ? (
              <div className="h-full flex flex-col animate-in fade-in-0 zoom-in-95 duration-500">
                <div className="flex-1 flex items-center justify-center p-8 relative">
                  <button
                    onClick={() => setIsPresentationMode(false)}
                    className="absolute top-6 right-6 p-3.5 rounded-2xl bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>

                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed z-50"
                  >
                    <ChevronLeft className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                  </button>

                  <div className="w-full max-w-6xl h-full max-h-[70vh] flex flex-col">
                    <div className={`flex-1 rounded-3xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-700 ${
                      currentSlide % 4 === 0 ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' :
                      currentSlide % 4 === 1 ? 'bg-gradient-to-br from-slate-900 via-emerald-900 to-teal-900' :
                      currentSlide % 4 === 2 ? 'bg-gradient-to-br from-slate-900 via-orange-900 to-red-900' :
                      'bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900'
                    }`}>
                      {/* Modern Background Elements */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl"></div>
                        {/* Subtle Grid Pattern */}
                        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                      </div>

                      {/* Enhanced Geometric Shapes */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full border-2 opacity-10 ${
                          currentSlide % 4 === 0 ? 'border-blue-300' :
                          currentSlide % 4 === 1 ? 'border-emerald-300' :
                          currentSlide % 4 === 2 ? 'border-orange-300' :
                          'border-purple-300'
                        }`}></div>
                        <div className={`absolute top-1/4 -left-10 w-24 h-24 rotate-45 border opacity-5 ${
                          currentSlide % 4 === 0 ? 'border-blue-400' :
                          currentSlide % 4 === 1 ? 'border-emerald-400' :
                          currentSlide % 4 === 2 ? 'border-orange-400' :
                          'border-purple-400'
                        }`}></div>
                        <div className={`absolute bottom-1/4 right-10 w-32 h-32 rounded-lg opacity-5 ${
                          currentSlide % 4 === 0 ? 'bg-blue-500/20' :
                          currentSlide % 4 === 1 ? 'bg-emerald-500/20' :
                          currentSlide % 4 === 2 ? 'bg-orange-500/20' :
                          'bg-purple-500/20'
                        }`}></div>
                      </div>

                      <div className="relative z-10 h-full flex flex-col p-12">
                        {/* Header Section */}
                        <div className="flex-shrink-0 mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-xs font-semibold tracking-wider text-white/60 uppercase">
                              Slide {currentSlide + 1} of {selectedPresentation.slides.length}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                currentSlide % 4 === 0 ? 'bg-blue-400' :
                                currentSlide % 4 === 1 ? 'bg-emerald-400' :
                                currentSlide % 4 === 2 ? 'bg-orange-400' :
                                'bg-purple-400'
                              } animate-pulse`}></div>
                              <span className="text-xs text-white/60">Live</span>
                            </div>
                          </div>

                          {/* Scripture Display */}
                          {selectedPresentation.slides[currentSlide].scripture && (
                            <div className="mb-6">
                              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-md border ${
                                currentSlide % 4 === 0 ? 'bg-blue-500/20 border-blue-400/30 text-blue-100' :
                                currentSlide % 4 === 1 ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100' :
                                currentSlide % 4 === 2 ? 'bg-orange-500/20 border-orange-400/30 text-orange-100' :
                                'bg-purple-500/20 border-purple-400/30 text-purple-100'
                              }`}>
                                <BookOpen className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium text-sm tracking-wide">
                                  {selectedPresentation.slides[currentSlide].scripture}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="space-y-8">
                            {/* Title */}
                            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none tracking-tight text-white mb-2">
                                {selectedPresentation.slides[currentSlide].title}
                              </h1>
                              <div className={`w-24 h-1 rounded-full ${
                                currentSlide % 4 === 0 ? 'bg-blue-400' :
                                currentSlide % 4 === 1 ? 'bg-emerald-400' :
                                currentSlide % 4 === 2 ? 'bg-orange-400' :
                                'bg-purple-400'
                              }`}></div>
                            </div>

                            {/* Content Points */}
                            <div className="space-y-6 max-w-4xl">
                              {selectedPresentation.slides[currentSlide].content.split('\n').map((point, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-4 animate-in fade-in-0 slide-in-from-left-4 duration-500"
                                  style={{ animationDelay: `${(index + 2) * 150}ms` }}
                                >
                                  <div className={`flex-shrink-0 w-3 h-3 rounded-full mt-3 ${
                                    currentSlide % 4 === 0 ? 'bg-blue-400 shadow-blue-400/50' :
                                    currentSlide % 4 === 1 ? 'bg-emerald-400 shadow-emerald-400/50' :
                                    currentSlide % 4 === 2 ? 'bg-orange-400 shadow-orange-400/50' :
                                    'bg-purple-400 shadow-purple-400/50'
                                  } shadow-lg`}></div>
                                  <div className="flex-1">
                                    <p className="text-xl md:text-2xl leading-relaxed text-white/90 font-medium">
                                      {point}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex-shrink-0 mt-8 pt-6 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <span className="font-medium">{selectedPresentation.topic}</span>
                            <span className="tracking-wider uppercase">SmartPreach</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlide === selectedPresentation.slides.length - 1}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed z-50"
                  >
                    <ChevronRight className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>

                <div className="flex-shrink-0 px-8 pb-6">
                  <div className="flex items-center justify-center gap-2">
                    {selectedPresentation.slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleGoToSlide(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentSlide === index
                            ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600'
                            : 'w-2 bg-gray-300 dark:bg-gray-600 hover:w-4 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
                        {selectedPresentation.topic}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedPresentation.slides.length} slides • Created {new Date(selectedPresentation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDownloadPPT}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-gray-800 dark:text-gray-100 shadow-md hover:shadow-lg"
                      >
                        <Download className="w-5 h-5" />
                        Export PPT
                      </button>
                      <button
                        onClick={handleRunInApp}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg font-semibold"
                      >
                        <Play className="w-5 h-5" />
                        Start Presentation
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedPresentation.slides.map((slide, index) => (
                      <div
                        key={index}
                        className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.01] overflow-hidden"
                        onClick={() => {
                          setCurrentSlide(index)
                          setIsPresentationMode(true)
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative z-10 flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {slide.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                              {slide.content}
                            </p>
                          </div>
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500/20 group-hover:to-purple-600/20 transition-all duration-300">
                            <Play className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
      <input
        type="file"
        ref={inputRef}
        accept=".pptx"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />
    </div>
  )
}