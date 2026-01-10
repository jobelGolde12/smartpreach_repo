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
