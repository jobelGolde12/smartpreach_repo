'use client'

import { useState, useEffect } from 'react'
import { X, Plus, ArrowLeft, Presentation, Download, Play, Sparkles, Loader2 } from 'lucide-react'

interface PresentationSlide {
  title: string
  content: string
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

type View = 'list' | 'create' | 'generate' | 'view' | 'options'

export default function PresentationsModal({ isOpen, onClose }: PresentationsModalProps) {
  const [view, setView] = useState<View>('list')
  const [topic, setTopic] = useState('')
  const [additionalContent, setAdditionalContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPresentation, setGeneratedPresentation] = useState<Presentation | null>(null)
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null)

  useEffect(() => {
    if (isOpen) {
      setView('list')
      setTopic('')
      setAdditionalContent('')
      setGeneratedPresentation(null)
      setSelectedPresentation(null)
      loadPresentations()
    }
  }, [isOpen])

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

  const generatePresentation = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    setView('generate')

    setTimeout(() => {
      const slides: PresentationSlide[] = [
        {
          title: topic,
          content: additionalContent || `This presentation explores the topic of ${topic}.`
        },
        {
          title: 'Introduction',
          content: `Welcome to this presentation about ${topic}. Today we will explore key aspects and insights related to this important topic.`
        },
        {
          title: 'Key Points',
          content: `• Point 1: Understanding the fundamentals\n• Point 2: Exploring the implications\n• Point 3: Practical applications\n• Point 4: Future considerations`
        },
        {
          title: 'Deep Dive',
          content: additionalContent || 'Let us take a closer look at the subject matter and understand its deeper meaning and significance.'
        },
        {
          title: 'Conclusion',
          content: `Thank you for joining this presentation on ${topic}. We hope these insights will be valuable for your journey.`
        }
      ]

      const newPresentation: Presentation = {
        id: Date.now().toString(),
        topic,
        slides,
        createdAt: new Date().toISOString()
      }

      setGeneratedPresentation(newPresentation)
      setIsGenerating(false)
      setView('options')
    }, 3000)
  }

  const handleSavePresentation = () => {
    if (generatedPresentation) {
      savePresentations([...presentations, generatedPresentation])
      setView('list')
      setGeneratedPresentation(null)
    }
  }

  const handleViewPresentation = (presentation: Presentation) => {
    setSelectedPresentation(presentation)
    setView('view')
  }

  const handleDownloadPPT = () => {
    alert('PPT download feature coming soon!')
  }

  const handleRunInApp = () => {
    if (selectedPresentation) {
      alert('Presentation player coming soon!')
    }
  }

  const handleBack = () => {
    if (view === 'options') {
      setView('create')
    } else {
      setView('list')
      setSelectedPresentation(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 w-full max-w-6xl h-[85vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-500 ease-out">
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200/40 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            {(view === 'create' || view === 'generate' || view === 'options' || view === 'view') && (
              <button
                onClick={handleBack}
                disabled={isGenerating}
                className="p-2.5 rounded-2xl hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-200 hover:scale-110 disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {view === 'list' ? 'Presentations' : 
               view === 'create' ? 'Create Presentation' : 
               view === 'generate' ? 'Generating...' : 
               view === 'options' ? 'Presentation Options' : 
               'View Presentation'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {view === 'list' && (
              <button
                onClick={() => setView('create')}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-all duration-200 hover:scale-110"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {view === 'list' ? (
            <div className="p-8">
              {presentations.length === 0 ? (
                <div className="text-center py-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Presentation className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-3">No presentations yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Create AI-powered presentations for your sermons and teachings</p>
                  <button
                    onClick={() => setView('create')}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg font-medium"
                  >
                    Create First Presentation
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {presentations.map((presentation, index) => (
                    <div
                      key={presentation.id}
                      onClick={() => handleViewPresentation(presentation)}
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/40 dark:border-gray-700/40 p-6 hover:shadow-xl hover:border-blue-300/60 dark:hover:border-blue-600/60 transition-all duration-300 cursor-pointer group hover:scale-[1.02] animate-in fade-in-0 slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                            <Presentation className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate text-lg">
                            {presentation.topic}
                          </h3>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {presentation.slides.length} slide{presentation.slides.length > 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{new Date(presentation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : view === 'create' ? (
            <div className="p-8 space-y-6 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Presentation Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The Power of Faith, Love Your Neighbor, Finding Peace..."
                  className="w-full px-5 py-4 border border-gray-200/60 dark:border-gray-600/60 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Additional Content <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={additionalContent}
                  onChange={(e) => setAdditionalContent(e.target.value)}
                  placeholder="Add any specific points, scriptures, or context you want to include..."
                  rows={6}
                  className="w-full px-5 py-4 border border-gray-200/60 dark:border-gray-600/60 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={generatePresentation}
                  disabled={!topic.trim()}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] shadow-lg font-medium flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate with AI
                </button>
              </div>
            </div>
          ) : view === 'generate' ? (
            <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in-0 duration-300">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Loader2 className="w-20 h-20 text-blue-600 dark:text-blue-400 relative animate-spin" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Generating Presentation
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                AI is creating your presentation about "{topic}". This may take a few moments...
              </p>
            </div>
          ) : view === 'options' && generatedPresentation ? (
            <div className="p-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-200/50 dark:border-blue-800/50 p-8 mb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Presentation className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        {generatedPresentation.topic}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {generatedPresentation.slides.length} slides generated
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generatedPresentation.slides.slice(0, 3).map((slide, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{slide.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{slide.content}</p>
                      </div>
                    ))}
                    {generatedPresentation.slides.length > 3 && (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        +{generatedPresentation.slides.length - 3} more slides
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleDownloadPPT}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02] shadow-md font-medium text-gray-800 dark:text-gray-100"
                  >
                    <Download className="w-5 h-5" />
                    Download as PPT
                  </button>
                  <button
                    onClick={handleRunInApp}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:opacity-90 transition-all duration-200 hover:scale-[1.02] shadow-lg font-medium"
                  >
                    <Play className="w-5 h-5" />
                    Run in App
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleSavePresentation}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    Save to Presentations
                  </button>
                </div>
              </div>
            </div>
          ) : view === 'view' && selectedPresentation ? (
            <div className="p-8 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {selectedPresentation.topic}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPPT}
                      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-gray-800 dark:text-gray-100"
                    >
                      <Download className="w-4 h-4" />
                      PPT
                    </button>
                    <button
                      onClick={handleRunInApp}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-200"
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedPresentation.slides.map((slide, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                            {slide.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                            {slide.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
