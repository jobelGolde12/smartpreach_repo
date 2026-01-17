'use server'

import { getTursoClient } from './turso'

export interface Verse {
  id: number
  book: string
  chapter: number
  verse: number
  text: string
  translation: string
  reference: string
  displayed_at: number | null
  created_at: number
}

export async function saveVerse(verse: Omit<Verse, 'id' | 'displayed_at' | 'created_at'>) {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    await turso.execute({
      sql: `INSERT INTO verses (book, chapter, verse, text, translation, reference)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(reference) DO UPDATE SET
              displayed_at = strftime('%s', 'now')`,
      args: [verse.book, verse.chapter, verse.verse, verse.text, verse.translation, verse.reference],
    })

    return { success: true }
  } catch (error) {
    console.error('Error saving verse:', error)
    return { success: false, error: 'Failed to save verse' }
  }
}

export async function getRecentVerses(limit: number = 10): Promise<Verse[]> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return []
    }

    const result = await turso.execute({
      sql: `SELECT * FROM verses
            WHERE displayed_at IS NOT NULL
            ORDER BY displayed_at DESC
            LIMIT ?`,
      args: [limit],
    })

    return result.rows.map((row) => ({
      id: row.id as number,
      book: row.book as string,
      chapter: row.chapter as number,
      verse: row.verse as number,
      text: row.text as string,
      translation: row.translation as string,
      reference: row.reference as string,
      displayed_at: row.displayed_at as number | null,
      created_at: row.created_at as number,
    }))
  } catch (error) {
    console.error('Error fetching recent verses:', error)
    return []
  }
}

export async function getFavorites(): Promise<Verse[]> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return []
    }

    const result = await turso.execute({
      sql: `SELECT v.* FROM verses v
            INNER JOIN favorites f ON v.id = f.verse_id
            ORDER BY f.created_at DESC`,
      args: [],
    })

    return result.rows.map((row) => ({
      id: row.id as number,
      book: row.book as string,
      chapter: row.chapter as number,
      verse: row.verse as number,
      text: row.text as string,
      translation: row.translation as string,
      reference: row.reference as string,
      displayed_at: row.displayed_at as number | null,
      created_at: row.created_at as number,
    }))
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  }
}

export async function addToFavorites(verseId: number) {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    await turso.execute({
      sql: `INSERT OR IGNORE INTO favorites (verse_id) VALUES (?)`,
      args: [verseId],
    })

    return { success: true }
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return { success: false, error: 'Failed to add to favorites' }
  }
}

export async function removeFromFavorites(verseId: number) {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    await turso.execute({
      sql: `DELETE FROM favorites WHERE verse_id = ?`,
      args: [verseId],
    })

    return { success: true }
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return { success: false, error: 'Failed to remove from favorites' }
  }
}

export async function logSearch(query: string, resultCount: number) {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return
    }

    await turso.execute({
      sql: `INSERT INTO search_logs (query, result_count) VALUES (?, ?)`,
      args: [query, resultCount],
    })
  } catch (error) {
    console.error('Error logging search:', error)
  }
}

export interface Highlight {
  id: number
  verse_id: number
  start_index: number
  end_index: number
  highlighted_text: string
  color: string
  created_at: number
}

export async function saveHighlight(highlight: Omit<Highlight, 'id' | 'created_at'>): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    const result = await turso.execute({
      sql: `INSERT INTO highlights (verse_id, start_index, end_index, highlighted_text, color)
            VALUES (?, ?, ?, ?, ?)`,
      args: [highlight.verse_id, highlight.start_index, highlight.end_index, highlight.highlighted_text, highlight.color],
    })

    const lastInsertId = result.lastInsertRowid
    if (lastInsertId) {
      return { 
        success: true, 
        id: typeof lastInsertId === 'bigint' ? Number(lastInsertId) : (lastInsertId as number)
      }
    } else {
      return { success: false, error: 'Failed to get insert ID' }
    }
  } catch (error) {
    console.error('Error saving highlight:', error)
    return { success: false, error: 'Failed to save highlight' }
  }
}

export async function getVerseHighlights(verseReference: string): Promise<Highlight[]> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return []
    }

    const result = await turso.execute({
      sql: `SELECT h.* FROM highlights h
            INNER JOIN verses v ON h.verse_id = v.id
            WHERE v.reference = ?
            ORDER BY h.start_index`,
      args: [verseReference],
    })

    return result.rows.map((row) => ({
      id: typeof row.id === 'bigint' ? Number(row.id) : row.id as number,
      verse_id: typeof row.verse_id === 'bigint' ? Number(row.verse_id) : row.verse_id as number,
      start_index: row.start_index as number,
      end_index: row.end_index as number,
      highlighted_text: row.highlighted_text as string,
      color: row.color as string,
      created_at: typeof row.created_at === 'bigint' ? Number(row.created_at) : row.created_at as number,
    }))
  } catch (error) {
    console.error('Error fetching highlights:', error)
    return []
  }
}

export async function deleteHighlight(highlightId: number) {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    await turso.execute({
      sql: `DELETE FROM highlights WHERE id = ?`,
      args: [highlightId],
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting highlight:', error)
    return { success: false, error: 'Failed to delete highlight' }
  }
}

export async function getVerseIdByReference(reference: string): Promise<number | null> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return null
    }

    const result = await turso.execute({
      sql: `SELECT id FROM verses WHERE reference = ? LIMIT 1`,
      args: [reference],
    })

    if (result.rows.length > 0) {
      const id = result.rows[0].id
      return typeof id === 'bigint' ? Number(id) : id as number
    }
    return null
  } catch (error) {
    console.error('Error getting verse ID:', error)
    return null
  }
}
