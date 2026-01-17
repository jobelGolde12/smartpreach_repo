import { NextRequest, NextResponse } from 'next/server'
import { saveHighlight, getVerseHighlights, deleteHighlight, getVerseIdByReference } from '@/lib/serverActions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const verseReference = searchParams.get('verseReference')

  if (!verseReference) {
    return NextResponse.json({ error: 'verseReference parameter is required' }, { status: 400 })
  }

  try {
    const highlights = await getVerseHighlights(verseReference)
    
    // Convert BigInt values to numbers for JSON serialization
    const serializedHighlights = highlights.map(highlight => ({
      ...highlight,
      id: typeof highlight.id === 'bigint' ? Number(highlight.id) : highlight.id,
      verse_id: typeof highlight.verse_id === 'bigint' ? Number(highlight.verse_id) : highlight.verse_id,
      created_at: typeof highlight.created_at === 'bigint' ? Number(highlight.created_at) : highlight.created_at,
    }))
    
    return NextResponse.json({ highlights: serializedHighlights })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch highlights' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { verse_id, verse_reference, start_index, end_index, highlighted_text, color = 'yellow' } = body

    let finalVerseId = verse_id

    // If verse_reference is provided instead of verse_id, get the verse_id
    if (verse_reference && !verse_id) {
      const verseId = await getVerseIdByReference(verse_reference)
      if (!verseId) {
        return NextResponse.json({ error: 'Verse not found' }, { status: 404 })
      }
      finalVerseId = verseId
    }

    if (!finalVerseId || start_index === undefined || end_index === undefined || !highlighted_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await saveHighlight({
      verse_id: finalVerseId,
      start_index,
      end_index,
      highlighted_text,
      color,
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        id: typeof result.id === 'bigint' ? Number(result.id) : result.id 
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save highlight' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { highlightId } = body

    if (!highlightId) {
      return NextResponse.json({ error: 'highlightId is required' }, { status: 400 })
    }

    const result = await deleteHighlight(highlightId)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete highlight' },
      { status: 500 }
    )
  }
}