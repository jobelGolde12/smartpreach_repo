import { NextRequest, NextResponse } from 'next/server'
import { fetchVerse, searchByKeyword, BibleVerse } from '@/lib/bibleApi'
import { saveVerse, logSearch, getRecentVerses, deleteVerse } from '@/lib/serverActions'
import { searchVersesLocally } from '@/lib/turso'
import { getChapterVerses } from '@/lib/bibleJson'

async function searchAllSources(query: string): Promise<BibleVerse[]> {
  let results: BibleVerse[] = []

  // Check if query is a chapter reference (e.g., "Exodus 3")
  const chapterMatch = query.match(/^([A-Za-z\s\d]+)\s+(\d+)$/)
  if (chapterMatch) {
    const [, bookName, chapterNum] = chapterMatch
    try {
      console.log('Detected chapter reference:', bookName, chapterNum)
      results = await getChapterVerses(bookName.trim(), parseInt(chapterNum))
      if (results.length > 0) {
        console.log('Found chapter verses:', results.length)
        return results
      }
    } catch (error) {
      console.log('Get chapter verses failed:', error)
    }
  }

  // Check if query is a verse reference (e.g., "Exodus 3:16")
  const verseMatch = query.match(/^([A-Za-z\s\d]+)\s+(\d+):(\d+)$/)
  if (verseMatch) {
    try {
      results = await fetchVerse(query)
      if (results.length > 0) {
        return results
      }
    } catch (error) {
      console.log('Fetch verse failed:', error)
    }
  }

  // Try keyword search
  try {
    results = await searchByKeyword(query)
    if (results.length > 0) {
      return results
    }
  } catch (error) {
    console.log('Search by keyword failed:', error)
  }

  // Try local database search
  try {
    const localResults = await searchVersesLocally(query)
    if (localResults.length > 0) {
      return localResults.map(v => ({
        book_name: v.book,
        book_id: '',
        chapter: v.chapter,
        verse: v.verse,
        text: v.text,
        reference: v.reference,
      }))
    }
  } catch (error) {
    console.log('Local search failed:', error)
  }

  return results
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'auto'
  const recentParam = searchParams.get('recent')

  if (recentParam === 'true') {
    const limitStr = searchParams.get('limit') || '20'
    const limit = Math.min(parseInt(limitStr, 10), 50)
    const recent = await getRecentVerses(limit)
    const bibleVerses: BibleVerse[] = recent.map((r: any) => ({
      book_name: r.book,
      book_id: '',
      chapter: r.chapter,
      verse: r.verse,
      text: r.text,
      reference: r.reference,
    }))
    return NextResponse.json({ verses: bibleVerses })
  }

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  console.log('API: Search query:', query, 'type:', type)

  try {
    const verses = await searchAllSources(query)

    console.log('API: Search result count:', verses.length)
    if (verses.length > 0) {
      console.log('API: First verse reference:', verses[0].reference)
    }

    logSearch(query, verses.length).catch(err => {
      console.error('Failed to log search:', err)
    })

    return NextResponse.json({ verses, reference: query })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch verses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, verses } = body

    if (!reference || !verses || !Array.isArray(verses)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    for (const verse of verses) {
      await saveVerse({
        book: verse.book_name,
        chapter: verse.chapter,
        verse: verse.verse,
        text: verse.text,
        translation: 'kjv',
        reference: reference,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save verses' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const result = await deleteVerse(reference)
    
    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete verse' },
      { status: 500 }
    )
  }
}
