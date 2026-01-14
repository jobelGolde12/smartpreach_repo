'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Sparkles, Loader2, BookOpen, FileText, Presentation, CheckCircle } from 'lucide-react'

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

function GeneratePresentationPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromEmptyState = searchParams.get('fromEmptyState') === 'true'

  const [topic, setTopic] = useState('')
  const [additionalContent, setAdditionalContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPresentation, setGeneratedPresentation] = useState<Presentation | null>(null)
  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'success'>('input')

  useEffect(() => {
    // Auto-start generation if coming from empty state
    if (fromEmptyState && !topic && !generatedPresentation) {
      setCurrentStep('generating')
      setIsGenerating(true)
      generatePresentation('')
    }
  }, [fromEmptyState, topic, generatedPresentation])

  const generatePresentation = async (userTopic?: string) => {
    const finalTopic = userTopic || topic
    if (!finalTopic.trim()) return

    setIsGenerating(true)
    setCurrentStep('generating')

    try {
      const totalSlides = 10
      const slides = []

      for (let i = 0; i < totalSlides; i++) {
        const response = await fetch('/api/generate-presentation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: finalTopic,
            additionalContent,
            slideIndex: i,
            totalSlides
          })
        })

        const slide = await response.json()

        if (!response.ok || slide.error) {
          throw new Error(slide.error || 'Failed to generate slide')
        }

        slides.push(slide)
      }

      const newPresentation: Presentation = {
        id: Date.now().toString(),
        topic: finalTopic,
        slides,
        createdAt: new Date().toISOString()
      }

      setGeneratedPresentation(newPresentation)
      setCurrentStep('success')
    } catch (error) {
      console.error('Error generating presentation:', error)
      alert('Failed to generate presentation. Please check your OpenRouter API key and connection.')
      setCurrentStep('input')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAndContinue = () => {
    if (generatedPresentation) {
      // Save to localStorage
      const saved = localStorage.getItem('presentations')
      const presentations = saved ? JSON.parse(saved) : []
      const updatedPresentations = [...presentations, generatedPresentation]
      localStorage.setItem('presentations', JSON.stringify(updatedPresentations))

      // Navigate to the new presentation page
      router.push('/presentation/' + generatedPresentation.id)
    }
  }

  const handleViewInApp = () => {
    if (generatedPresentation) {
      // Save temporarily and navigate to presentation page
      sessionStorage.setItem('tempPresentation', JSON.stringify(generatedPresentation))
      router.push('/presentation/' + generatedPresentation.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Generate Presentation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Create AI-powered presentations for your sermons and teachings
            </p>
          </div>
        </div>

        {/* Input Step */}
        {currentStep === 'input' && (
          <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Presentation Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The Power of Faith, Love Your Neighbor, Finding Peace..."
                    className="w-full px-6 py-4 border border-slate-200/60 dark:border-slate-600/60 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all duration-200 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Additional Content <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={additionalContent}
                    onChange={(e) => setAdditionalContent(e.target.value)}
                    placeholder="Add any specific points, scriptures, or context you want to include..."
                    rows={6}
                    className="w-full px-6 py-4 border border-slate-200/60 dark:border-slate-600/60 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => generatePresentation()}
                    disabled={!topic.trim() || isGenerating}
                    className="w-full px-8 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] shadow-lg font-semibold text-lg flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-6 h-6" />
                    Generate with AI
                  </button>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Biblical Content</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AI-generated presentations with scripture references and spiritual insights
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <Presentation className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Modern Slides</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Professional, modernistic slide designs perfect for presentations
                </p>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Speaker Notes</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Detailed notes for each slide to guide your presentation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generating Step */}
        {currentStep === 'generating' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in-0 duration-500">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20">
                <Loader2 className="w-24 h-24 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
                  Creating Your Presentation
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                  AI is crafting a spiritually rich presentation about &quot;{topic || 'your topic'}&quot;. This may take a few moments...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {currentStep === 'success' && generatedPresentation && (
          <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    Presentation Generated Successfully!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {generatedPresentation.slides.length} slides created for &quot;{generatedPresentation.topic}&quot;
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleViewInApp}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:opacity-90 transition-all duration-200 hover:scale-[1.02] shadow-lg font-medium"
                >
                  <Presentation className="w-5 h-5" />
                  View in Presentation Mode
                </button>
                <button
                  onClick={handleSaveAndContinue}
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 hover:scale-[1.02] shadow-md font-medium text-slate-800 dark:text-slate-100"
                >
                  <FileText className="w-5 h-5" />
                  Save & Continue
                </button>
              </div>
            </div>

            {/* Preview Slides */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
                Preview Slides
              </h3>
              <div className="space-y-4">
                {generatedPresentation.slides.slice(0, 5).map((slide, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                          {slide.title}
                        </h4>
                        {slide.scripture && (
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">
                            {slide.scripture}
                          </p>
                        )}
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {slide.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {generatedPresentation.slides.length > 5 && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    +{generatedPresentation.slides.length - 5} more slides
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GeneratePresentationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeneratePresentationPageContent />
    </Suspense>
  )
}