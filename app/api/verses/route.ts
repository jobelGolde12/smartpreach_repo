import { NextRequest, NextResponse } from 'next/server'
import { fetchVerse, searchByKeyword, BibleVerse } from '@/lib/bibleApi'
import { saveVerse, logSearch } from '@/lib/serverActions'
import { searchVersesLocally } from '@/lib/turso'

async function searchAllSources(query: string): Promise<BibleVerse[]> {
  let results: BibleVerse[] = []

  try {
    results = await searchByKeyword(query)
    if (results.length > 0) {
      return results
    }
  } catch (error) {
    console.log('Search by keyword failed:', error)
  }

  try {
    results = await fetchVerse(query)
    if (results.length > 0) {
      return results
    }
  } catch (error) {
    console.log('Fetch verse failed:', error)
  }

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

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  console.log('API: Search query:', query, 'type:', type)

  try {
    let verses = await searchAllSources(query)

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
