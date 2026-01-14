// Helper functions for working with the KJV Bible JSON data

export interface BibleBook {
  book: string
  chapters: {
    chapter: string
    verses: {
      verse: string
      text: string
    }[]
  }[]
}

export interface BibleVerse {
  book_name: string
  book_id: string
  chapter: number
  verse: number
  text: string
  reference: string
}

let completeBibleData: BibleBook[] | null = null
const bookCache: Map<string, BibleBook> = new Map()

// Load the complete KJV Bible data
export async function loadCompleteBible(): Promise<BibleBook[]> {
  if (completeBibleData) return completeBibleData

  try {
    const response = await fetch('/bible/complete-bible.json')
    if (!response.ok) {
      throw new Error(`Failed to load complete Bible: ${response.status}`)
    }
    const data: { books: BibleBook[] } = await response.json()
    completeBibleData = data.books

    // Populate book cache
    for (const book of data.books) {
      bookCache.set(book.book.toLowerCase(), book)
    }

    return data.books
  } catch (error) {
    console.error('Error loading complete Bible data:', error)
    throw error
  }
}

// Load a specific book (uses cache if available)
export async function loadBook(bookName: string): Promise<BibleBook | null> {
  const cacheKey = bookName.toLowerCase()

  if (bookCache.has(cacheKey)) {
    return bookCache.get(cacheKey)!
  }

  // Load complete Bible to populate cache
  await loadCompleteBible()

  return bookCache.get(cacheKey) || null
}

// Load the KJV data (for backward compatibility)
export async function loadKJVData(): Promise<BibleBook[]> {
  return loadCompleteBible()
}

// Find a verse by reference (e.g., "John 3:16")
export async function findVerseByReference(reference: string): Promise<BibleVerse | null> {
  // Parse the reference
  const match = reference.match(/^(\d?\s*[A-Za-z]+)\s+(\d+):(\d+)$/)
  if (!match) return null

  const [, bookName, chapterNum, verseNum] = match

  // Load only the specific book
  const book = await loadBook(bookName.trim())
  if (!book) return null

  const chapter = book.chapters.find(c => c.chapter === chapterNum)
  if (!chapter) return null

  const verse = chapter.verses.find(v => v.verse === verseNum)
  if (!verse) return null

  return {
    book_name: book.book,
    book_id: book.book.replace(/\s+/g, '').toUpperCase().substring(0, 3),
    chapter: parseInt(chapterNum),
    verse: parseInt(verseNum),
    text: verse.text,
    reference
  }
}

// Get all verses from a chapter
export async function getChapterVerses(bookName: string, chapterNum: number): Promise<BibleVerse[]> {
  const book = await loadBook(bookName)
  if (!book) return []

  const chapter = book.chapters.find(c => parseInt(c.chapter) === chapterNum)
  if (!chapter) return []

  return chapter.verses.map(verse => ({
    book_name: book.book,
    book_id: book.book.replace(/\s+/g, '').toUpperCase().substring(0, 3),
    chapter: chapterNum,
    verse: parseInt(verse.verse),
    text: verse.text,
    reference: `${book.book} ${chapterNum}:${verse.verse}`
  }))
}

// Search for verses containing specific keywords
export async function searchVersesByKeyword(keyword: string): Promise<BibleVerse[]> {
  const data = await loadKJVData()
  const normalizedKeyword = keyword.toLowerCase().trim()
  const results: BibleVerse[] = []

  for (const book of data) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        if (verse.text.toLowerCase().includes(normalizedKeyword)) {
          results.push({
            book_name: book.book,
            book_id: book.book.replace(/\s+/g, '').toUpperCase().substring(0, 3),
            chapter: parseInt(chapter.chapter),
            verse: parseInt(verse.verse),
            text: verse.text,
            reference: `${book.book} ${chapter.chapter}:${verse.verse}`
          })
        }
      }
    }
  }

  return results
}

// Get book information
export async function getBooks(): Promise<{ name: string, chapters: number }[]> {
  const bibleBooks = await loadCompleteBible()

  return bibleBooks.map(book => ({
    name: book.book,
    chapters: book.chapters.length
  }))
}