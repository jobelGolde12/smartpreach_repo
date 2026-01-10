export interface BibleVerse {
  book_name: string
  book_id: string
  chapter: number
  verse: number
  text: string
  reference: string
}

export interface BibleResponse {
  reference: string
  verses: BibleVerse[]
  text: string
  translation_id: string
  translation_name: string
  translation_note: string
}

const BIBLE_API_BASE = 'https://bible-api.com'

export async function fetchVerse(reference: string): Promise<BibleVerse[]> {
  const response = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(reference)}?translation=kjv`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch verse: ${response.statusText}`)
  }

  const data: BibleResponse = await response.json()

  if (!data.verses || data.verses.length === 0) {
    throw new Error('No verses found for this reference')
  }

  return data.verses.map((verse) => ({
    ...verse,
    reference: data.reference,
  }))
}

export async function searchByKeyword(keyword: string): Promise<BibleVerse[]> {
  try {
    const response = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(keyword)}?translation=kjv`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const data: BibleResponse = await response.json()

    if (!data.verses || data.verses.length === 0) {
      return []
    }

    return data.verses.map((verse) => ({
      ...verse,
      reference: data.reference,
    }))
  } catch (error) {
    console.error('Error searching by keyword:', error)
    return []
  }
}
