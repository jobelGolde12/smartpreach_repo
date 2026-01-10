import { NextRequest, NextResponse } from 'next/server'
import { fetchVerse, searchByKeyword } from '@/lib/bibleApi'
import { saveVerse, logSearch } from '@/lib/serverActions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const type = searchParams.get('type') || 'auto'

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    let verses

    if (type === 'keyword') {
      verses = await searchByKeyword(query)
    } else if (type === 'auto') {
      try {
        verses = await fetchVerse(query)
      } catch {
        console.log('Verse fetch failed, trying keyword search:', query)
        verses = await searchByKeyword(query)
      }
    } else {
      verses = await fetchVerse(query)
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
