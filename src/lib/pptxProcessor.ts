'use client'

import { PresentationSlide, Presentation } from '@/types/presentation'

declare global {
  interface Window {
    $: any
    jQuery: any
    pptxToHtml: any
  }
}

export interface PPTXDesignOptions {
  themeProcess?: boolean | 'colorsAndImageOnly'
  slidesScale?: string
  slideMode?: boolean
  incSlide?: { height?: number, width?: number }
  slideType?: 'divs2slidesjs' | 'revealjs'
  preserveFormatting?: boolean
  extractImages?: boolean
}

export class EnhancedPPTXProcessor {
  private static instance: EnhancedPPTXProcessor
  private jqueryLoaded = false
  private pptxjsLoaded = false

  static getInstance(): EnhancedPPTXProcessor {
    if (!EnhancedPPTXProcessor.instance) {
      EnhancedPPTXProcessor.instance = new EnhancedPPTXProcessor()
    }
    return EnhancedPPTXProcessor.instance
  }

  private async loadDependencies(): Promise<void> {
    if (typeof window === 'undefined') return

    // Load jQuery if not already loaded
    if (!window.jQuery && !this.jqueryLoaded) {
      await this.loadScript('https://code.jquery.com/jquery-3.6.0.min.js')
      this.jqueryLoaded = true
    }

    // Load PPTXjs if not already loaded
    if (!window.pptxToHtml && !this.pptxjsLoaded) {
      await this.loadScript('https://cdn.jsdelivr.net/gh/meshesha/PPTXjs/dist/pptxjs.min.js')
      await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
      this.pptxjsLoaded = true
    }

    // Wait for libraries to be available
    return new Promise((resolve) => {
      const checkLibraries = () => {
        if (window.jQuery && window.pptxToHtml) {
          resolve()
        } else {
          setTimeout(checkLibraries, 100)
        }
      }
      checkLibraries()
    })
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
      document.head.appendChild(script)
    })
  }

  async processPPTXFile(
    file: File, 
    options: PPTXDesignOptions = {}
  ): Promise<{ 
    presentation: Presentation, 
    designData: any, 
    htmlPreview?: string 
  }> {
    await this.loadDependencies()

    const defaultOptions: PPTXDesignOptions = {
      themeProcess: true,
      slidesScale: '100',
      slideMode: false,
      incSlide: { height: 2, width: 2 },
      slideType: 'divs2slidesjs',
      preserveFormatting: true,
      extractImages: true,
      ...options
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          
          // Create a temporary div for PPTX processing
          const tempDiv = document.createElement('div')
          tempDiv.id = `pptx-temp-${Date.now()}`
          tempDiv.style.display = 'none'
          document.body.appendChild(tempDiv)

          // Convert PPTX to HTML with design preservation
          const pptxConfig = {
            pptxFileUrl: URL.createObjectURL(new Blob([arrayBuffer])),
            slidesScale: defaultOptions.slidesScale,
            slideMode: defaultOptions.slideMode,
            keyBoardShortCut: false,
            mediaProcess: defaultOptions.extractImages,
            jsZipV2: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
            themeProcess: defaultOptions.themeProcess,
            incSlide: defaultOptions.incSlide,
            slideType: defaultOptions.slideType
          }

          // Process the PPTX with PPTXjs
          window.$(`#${tempDiv.id}`).pptxToHtml(pptxConfig)

          // Wait for processing to complete
          setTimeout(() => {
            try {
              const processedHTML = tempDiv.innerHTML
              const slides = this.extractSlidesWithDesign(processedHTML, tempDiv)
              const designData = this.extractDesignData(processedHTML, tempDiv)

              const presentation: Presentation = {
                id: Date.now().toString(),
                topic: file.name.replace(/\.pptx$/i, ''),
                slides,
                createdAt: new Date().toISOString()
              }

              // Clean up
              document.body.removeChild(tempDiv)

              resolve({
                presentation,
                designData,
                htmlPreview: processedHTML
              })
            } catch (error) {
              document.body.removeChild(tempDiv)
              reject(error)
            }
          }, 3000) // Allow time for PPTX processing

        } catch (error) {
          reject(new Error(`Failed to process PPTX file: ${error}`))
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  private extractSlidesWithDesign(processedHTML: string, container: HTMLElement): PresentationSlide[] {
    const slides: PresentationSlide[] = []
    const slideElements = container.querySelectorAll('[class*="slide"], .pptx-slide, [data-slide]')

    slideElements.forEach((slideEl, index) => {
      const titleEl = slideEl.querySelector('h1, h2, h3, [class*="title"]')
      const contentEl = slideEl.querySelector('[class*="content"], .slide-content, .pptx-content')
      
      // Extract background styles
      const computedStyle = window.getComputedStyle(slideEl)
      const background = computedStyle.background || computedStyle.backgroundColor
      const backgroundImage = computedStyle.backgroundImage

      // Extract text content while preserving structure
      const title = titleEl ? titleEl.textContent?.trim() || `Slide ${index + 1}` : `Slide ${index + 1}`
      
      let content = ''
      if (contentEl) {
        // Preserve line breaks and structure
        content = this.extractTextWithFormatting(contentEl)
      } else {
        // Fallback: extract all text from slide
        content = this.extractTextWithFormatting(slideEl)
      }

      // Extract design information
      const designInfo = this.extractSlideDesign(slideEl)

      slides.push({
        title,
        content: content || 'No content found on this slide.',
        scripture: this.extractScripture(content),
        notes: '', // Can be enhanced to extract speaker notes
        ...designInfo
      })
    })

    // Fallback if no slides found with selectors
    if (slides.length === 0) {
      return this.createFallbackSlides(processedHTML)
    }

    return slides
  }

  private extractTextWithFormatting(element: Element): string {
    const textContent: string[] = []
    
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element
            // Skip script and style elements
            if (['SCRIPT', 'STYLE'].includes(el.tagName)) {
              return NodeFilter.FILTER_REJECT
            }
            // Check for block elements to add line breaks
            if (['P', 'DIV', 'BR', 'LI'].includes(el.tagName)) {
              return NodeFilter.FILTER_ACCEPT
            }
          }
          return NodeFilter.FILTER_ACCEPT
        }
      }
    )

    let node
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        if (text) {
          textContent.push(text)
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element
        if (['P', 'DIV', 'BR', 'LI'].includes(el.tagName)) {
          textContent.push('\n')
        }
      }
    }

    return textContent.join(' ').replace(/\s+/g, ' ').trim()
  }

  private extractSlideDesign(slideEl: Element): any {
    const computedStyle = window.getComputedStyle(slideEl)
    
    return {
      background: {
        color: computedStyle.backgroundColor,
        image: computedStyle.backgroundImage,
        size: computedStyle.backgroundSize,
        position: computedStyle.backgroundPosition
      },
      text: {
        color: computedStyle.color,
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight
      }
    }
  }

  private extractDesignData(processedHTML: string, container: HTMLElement): any {
    // Extract theme colors, fonts, and overall design information
    const themeColors = this.extractThemeColors(container)
    const fonts = this.extractFonts(container)
    const layout = this.extractLayoutInfo(container)

    return {
      colors: themeColors,
      fonts,
      layout,
      rawHTML: processedHTML
    }
  }

  private extractThemeColors(container: HTMLElement): string[] {
    const colors = new Set<string>()
    const allElements = container.querySelectorAll('*')
    
    allElements.forEach(el => {
      const styles = window.getComputedStyle(el)
      const bgColor = styles.backgroundColor
      const textColor = styles.color
      
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        colors.add(bgColor)
      }
      if (textColor && textColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'transparent') {
        colors.add(textColor)
      }
    })

    return Array.from(colors)
  }

  private extractFonts(container: HTMLElement): string[] {
    const fonts = new Set<string>()
    const allElements = container.querySelectorAll('*')
    
    allElements.forEach(el => {
      const fontFamily = window.getComputedStyle(el).fontFamily
      if (fontFamily && fontFamily !== 'initial') {
        fonts.add(fontFamily)
      }
    })

    return Array.from(fonts)
  }

  private extractLayoutInfo(container: HTMLElement): any {
    const firstSlide = container.querySelector('[class*="slide"], .pptx-slide, [data-slide]')
    if (!firstSlide) return {}

    const styles = window.getComputedStyle(firstSlide)
    
    return {
      width: styles.width,
      height: styles.height,
      aspectRatio: styles.aspectRatio,
      padding: styles.padding,
      margin: styles.margin
    }
  }

  private extractScripture(content: string): string | undefined {
    // Common Bible verse patterns
    const scripturePatterns = [
      /(\d?\s?[A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g,
      /([A-Za-z]+\s+\d+:\d+(?:-\d+)?)/g,
      /(Psalm\s+\d+:\d+)/g,
      /(John\s+3:16)/g
    ]

    for (const pattern of scripturePatterns) {
      const match = content.match(pattern)
      if (match && match.length > 0) {
        return match[0]
      }
    }

    return undefined
  }

  private createFallbackSlides(processedHTML: string): PresentationSlide[] {
    // Fallback method using basic text extraction
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = processedHTML
    
    const text = tempDiv.textContent || tempDiv.innerText || ''
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0)
    
    return paragraphs.map((paragraph, index) => ({
      title: `Slide ${index + 1}`,
      content: paragraph.trim(),
      scripture: this.extractScripture(paragraph)
    }))
  }

  // Utility method to apply preserved design to presentation display
  generatePresentationCSS(designData: any): string {
    const { colors, fonts, layout } = designData
    
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
      .preserved-pptx-slide div {
        ${fonts?.[0] ? `font-family: ${fonts[0]};` : ''}
        ${colors?.[1] ? `color: ${colors[1]};` : ''}
      }
    `
  }
}