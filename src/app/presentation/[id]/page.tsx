'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Download, Play, ChevronLeft, ChevronRight, Minimize2, BookOpen, Presentation as PresentationIcon } from 'lucide-react'
import { PresentationSlide, Presentation } from '@/types/presentation'

export default function PresentationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPresentationMode, setIsPresentationMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const [designData, setDesignData] = useState<any>(null)

  const loadPresentation = () => {
    const saved = localStorage.getItem('presentations')
    if (saved) {
      try {
        const presentations: Presentation[] = JSON.parse(saved)
        const found = presentations.find(p => p.id === id)
        if (found) {
          setPresentation(found)
          // Load design data if available
          const savedDesign = localStorage.getItem(`design-${id}`)
          if (savedDesign) {
            try {
              setDesignData(JSON.parse(savedDesign))
            } catch (error) {
              console.error('Error loading design data:', error)
            }
          }
        } else {
          // Check sessionStorage for temp presentation
          const temp = sessionStorage.getItem('tempPresentation')
          if (temp) {
            const tempPresentation: Presentation = JSON.parse(temp)
            if (tempPresentation.id === id) {
              setPresentation(tempPresentation)
              // Save it permanently
              const updated = [...presentations, tempPresentation]
              localStorage.setItem('presentations', JSON.stringify(updated))
              sessionStorage.removeItem('tempPresentation')
            }
          }
        }
      } catch (error) {
        console.error('Error loading presentation:', error)
      }
    }
    setLoading(false)
  }

   useEffect(() => {
     if (id) {
       loadPresentation()
     }
   }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
     // Inject custom CSS for preserved design
     if (designData) {
       const styleId = 'preserved-pptx-styles'
       let styleElement = document.getElementById(styleId) as HTMLStyleElement
       
       if (!styleElement) {
         styleElement = document.createElement('style')
         styleElement.id = styleId
         document.head.appendChild(styleElement)
       }

       const css = generatePreservedCSS(designData)
       styleElement.textContent = css

       return () => {
         if (styleElement) {
           styleElement.remove()
         }
       }
     }
   }, [designData])

   const generatePreservedCSS = (design: any) => {
     const { colors, fonts, layout } = design
     return `
       .preserved-pptx-slide {
         ${layout?.width ? `width: ${layout.width};` : ''}
         ${layout?.height ? `height: ${layout.height};` : ''}
         ${layout?.padding ? `padding: ${layout.padding};` : ''}
         ${layout?.margin ? `margin: ${layout.margin};` : ''}
       }
       
       .preserved-pptx-slide h1,
       .preserved-pptx-slide h2,
       .preserved-pptx-slide h3 {
         ${fonts?.[0] ? `font-family: ${fonts[0]};` : ''}
         ${colors?.[0] ? `color: ${colors[0]};` : ''}
       }
       
       .preserved-pptx-slide p,
       .preserved-pptx-slide div,
       .preserved-pptx-slide span {
         ${fonts?.[0] ? `font-family: ${fonts[0]};` : ''}
         ${colors?.[1] ? `color: ${colors[1]};` : ''}
       }

       .preserved-pptx-slide .scripture-text {
         ${fonts?.[0] ? `font-family: ${fonts[0]};` : ''}
         ${colors?.[2] ? `color: ${colors[2]};` : ''}
         font-style: italic;
       }
     `
   }

  const handleNextSlide = () => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const getSlideStyle = (slide: PresentationSlide, index: number) => {
    // If we have preserved design data, use it
    if (designData && slide.background) {
      return {
        background: slide.background.color || 'transparent',
        backgroundImage: slide.background.image ? `url(${slide.background.image})` : 'none',
        backgroundSize: slide.background.size || 'cover',
        backgroundPosition: slide.background.position || 'center',
        color: slide.text?.color || '#ffffff',
        fontFamily: slide.text?.fontFamily || 'inherit',
        fontSize: slide.text?.fontSize || 'inherit',
        fontWeight: slide.text?.fontWeight || 'inherit'
      }
    }

    // Fallback to dynamic coloring based on slide index
    const colors = [
      'from-slate-900 via-blue-900 to-indigo-900',
      'from-slate-900 via-emerald-900 to-teal-900',
      'from-slate-900 via-orange-900 to-red-900',
      'from-slate-900 via-purple-900 to-pink-900'
    ]
    
    return {}
  }

  const getSlideClass = (index: number) => {
    if (designData) {
      return 'preserved-pptx-slide'
    }

    const colors = [
      'from-slate-900 via-blue-900 to-indigo-900',
      'from-slate-900 via-emerald-900 to-teal-900',
      'from-slate-900 via-orange-900 to-red-900',
      'from-slate-900 via-purple-900 to-pink-900'
    ]
    
    return `bg-gradient-to-br ${colors[index % 4]}`
  }

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleGoToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleDownloadPPT = () => {
    if (!presentation) return

    const content = presentation.slides.map((slide, index) =>
      `Slide ${index + 1}: ${slide.title}\n\n${slide.content.split('\n').map(point => `• ${point}`).join('\n')}`
    ).join('\n\n---\n\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${presentation.topic.replace(/\s+/g, '-').toLowerCase()}-presentation.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading presentation...</p>
        </div>
      </div>
    )
  }

  if (!presentation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <PresentationIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Presentation Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The presentation you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {!isPresentationMode ? (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                {presentation.topic}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {presentation.slides.length} slides • Created {new Date(presentation.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleDownloadPPT}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-slate-800 dark:text-slate-100"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setIsPresentationMode(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg font-medium"
              >
                <Play className="w-5 h-5" />
                Present
              </button>
            </div>
          </div>

          {/* Slides Preview */}
          <div className="space-y-6">
            {presentation.slides.map((slide, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/20 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
                onClick={() => {
                  setCurrentSlide(index)
                  setIsPresentationMode(true)
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
                      {slide.title}
                    </h3>
                    {slide.scripture && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-3 font-medium">
                        {slide.scripture}
                      </p>
                    )}
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                      {slide.content}
                    </p>
                    {slide.notes && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          <strong>Notes:</strong> {slide.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <Play className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-screen flex flex-col animate-in fade-in-0 zoom-in-95 duration-500">
          <div className="flex-1 flex items-center justify-center p-8 relative">
            <button
              onClick={() => setIsPresentationMode(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg z-20"
            >
              <Minimize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            <button
              onClick={handlePrevSlide}
              disabled={currentSlide === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-20"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <div className="w-full max-w-6xl h-full max-h-[80vh] flex flex-col">
              <div className={`flex-1 rounded-3xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-4 duration-700 ${getSlideClass(currentSlide)}`}
                   style={getSlideStyle(presentation.slides[currentSlide], currentSlide)}>
                {/* Modern Background Elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
                  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-3xl"></div>
                  {/* Subtle Grid Pattern */}
                  <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
                </div>

                {/* Geometric Shapes */}
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
                        Slide {currentSlide + 1} of {presentation.slides.length}
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
                    {presentation.slides[currentSlide].scripture && (
                      <div className="mb-6">
                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-md border scripture-text ${
                          designData ? 'bg-white/10 border-white/20 text-white/80' :
                          (currentSlide % 4 === 0 ? 'bg-blue-500/20 border-blue-400/30 text-blue-100' :
                           currentSlide % 4 === 1 ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100' :
                           currentSlide % 4 === 2 ? 'bg-orange-500/20 border-orange-400/30 text-orange-100' :
                           'bg-purple-500/20 border-purple-400/30 text-purple-100')
                        }`}>
                          <BookOpen className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium text-sm tracking-wide scripture-text">
                            {presentation.slides[currentSlide].scripture}
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
                          {presentation.slides[currentSlide].title}
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
                        {presentation.slides[currentSlide].content.split('\n').map((point, index) => (
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
                      <span className="font-medium">{presentation.topic}</span>
                      <span className="tracking-wider uppercase">SmartPreach</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextSlide}
              disabled={currentSlide === presentation.slides.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed z-20"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex-shrink-0 px-8 pb-6">
            <div className="flex items-center justify-center gap-2">
              {presentation.slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleGoToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'w-8 bg-blue-600'
                      : 'w-2 bg-gray-300 dark:bg-gray-600 hover:w-4'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}