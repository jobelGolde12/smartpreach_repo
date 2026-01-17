export interface PresentationSlide {
  title: string
  scripture?: string
  content: string
  notes?: string
  background?: any
  text?: any
}

export interface Presentation {
  id: string
  topic: string
  slides: PresentationSlide[]
  createdAt: string
}