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

export async function deleteVerse(reference: string) {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    // Get the verse ID first
    const verseId = await getVerseIdByReference(reference)
    if (!verseId) {
      return { success: false, error: 'Verse not found' }
    }

    // Delete related highlights first (foreign key constraint)
    await turso.execute({
      sql: `DELETE FROM highlights WHERE verse_id = ?`,
      args: [verseId],
    })

    // Delete from favorites
    await turso.execute({
      sql: `DELETE FROM favorites WHERE verse_id = ?`,
      args: [verseId],
    })

    // Delete the verse
    await turso.execute({
      sql: `DELETE FROM verses WHERE id = ?`,
      args: [verseId],
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting verse:', error)
    return { success: false, error: 'Failed to delete verse' }
  }
}

export async function deleteAllRecentVerses(): Promise<{ success: boolean; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    // Delete all verses from the verses table
    await turso.execute({
      sql: `DELETE FROM verses`,
      args: [],
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting all recent verses:', error)
    return { success: false, error: 'Failed to delete all recent verses' }
  }
}

export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: string | null
  image: string | null
  profile_pic: string | null
  contact_number: string | null
  church_name: string | null
  bio: string | null
}

export interface Profile {
  id: number
  user_id: string
  profile_pic: string | null
  contact_number: string | null
  church_name: string | null
  bio: string | null
  updated_at: number
}

export async function getUserData(userId: string): Promise<User | null> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return null
    }

    const result = await turso.execute({
      sql: `SELECT * FROM "User" WHERE id = ? LIMIT 1`,
      args: [userId],
    })

    if (result.rows.length > 0) {
      const row = result.rows[0]
      return {
        id: row.id as string,
        name: row.name as string | null,
        email: row.email as string,
        emailVerified: row.emailVerified as string | null,
        image: row.image as string | null,
        profile_pic: row.profile_pic as string | null,
        contact_number: row.contact_number as string | null,
        church_name: row.church_name as string | null,
        bio: row.bio as string | null,
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

export async function updateUserData(userId: string, userData: Partial<Pick<User, 'name' | 'email' | 'profile_pic' | 'contact_number' | 'church_name' | 'bio'>>): Promise<{ success: boolean; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    // Build dynamic update query
    const updateFields = []
    const args = []

    if (userData.name !== undefined) {
      updateFields.push('"name" = ?')
      args.push(userData.name)
    }
    if (userData.email !== undefined) {
      updateFields.push('"email" = ?')
      args.push(userData.email)
    }
    if (userData.profile_pic !== undefined) {
      updateFields.push('"profile_pic" = ?')
      args.push(userData.profile_pic)
    }
    if (userData.contact_number !== undefined) {
      updateFields.push('"contact_number" = ?')
      args.push(userData.contact_number)
    }
    if (userData.church_name !== undefined) {
      updateFields.push('"church_name" = ?')
      args.push(userData.church_name)
    }
    if (userData.bio !== undefined) {
      updateFields.push('"bio" = ?')
      args.push(userData.bio)
    }

    if (updateFields.length === 0) {
      return { success: true } // No changes to make
    }

    args.push(userId) // Add userId at the end

    const sql = `UPDATE "User" SET ${updateFields.join(', ')} WHERE id = ?`

    await turso.execute({
      sql,
      args,
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating user data:', error)
    return { success: false, error: 'Failed to update user data' }
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return null
    }

    const result = await turso.execute({
      sql: `SELECT * FROM profiles WHERE user_id = ? LIMIT 1`,
      args: [userId],
    })

    if (result.rows.length > 0) {
      const row = result.rows[0]
      return {
        id: typeof row.id === 'bigint' ? Number(row.id) : row.id as number,
        user_id: row.user_id as string,
        profile_pic: row.profile_pic as string | null,
        contact_number: row.contact_number as string | null,
        church_name: row.church_name as string | null,
        bio: row.bio as string | null,
        updated_at: typeof row.updated_at === 'bigint' ? Number(row.updated_at) : row.updated_at as number,
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, profileData: Partial<Omit<Profile, 'id' | 'user_id' | 'updated_at'>>): Promise<{ success: boolean; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    // Check if profile exists
    const existing = await getUserProfile(userId)

    if (existing) {
      // Update existing profile
      await turso.execute({
        sql: `UPDATE profiles SET
              profile_pic = ?,
              contact_number = ?,
              church_name = ?,
              bio = ?,
              updated_at = strftime('%s', 'now')
              WHERE user_id = ?`,
        args: [
          profileData.profile_pic ?? existing.profile_pic,
          profileData.contact_number ?? existing.contact_number,
          profileData.church_name ?? existing.church_name,
          profileData.bio ?? existing.bio,
          userId
        ],
      })
    } else {
      // Create new profile
      await turso.execute({
        sql: `INSERT INTO profiles (user_id, profile_pic, contact_number, church_name, bio)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          userId,
          profileData.profile_pic || null,
          profileData.contact_number || null,
          profileData.church_name || null,
          profileData.bio || null
        ],
      })
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

export interface Presentation {
  id: number
  title: string
  description: string | null
  verses: string
  user_id: string
  created_at: number
  updated_at: number
}

export async function createPresentation(userId: string, title: string, description: string | null, verses: string): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    const result = await turso.execute({
      sql: `INSERT INTO presentations (title, description, verses, user_id)
            VALUES (?, ?, ?, ?)`,
      args: [title, description, verses, userId],
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
    console.error('Error creating presentation:', error)
    return { success: false, error: 'Failed to create presentation' }
  }
}

export async function getPresentations(userId: string): Promise<Presentation[]> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return []
    }

    const result = await turso.execute({
      sql: `SELECT * FROM presentations WHERE user_id = ? ORDER BY updated_at DESC`,
      args: [userId],
    })

    return result.rows.map((row) => ({
      id: typeof row.id === 'bigint' ? Number(row.id) : row.id as number,
      title: row.title as string,
      description: row.description as string | null,
      verses: row.verses as string,
      user_id: row.user_id as string,
      created_at: typeof row.created_at === 'bigint' ? Number(row.created_at) : row.created_at as number,
      updated_at: typeof row.updated_at === 'bigint' ? Number(row.updated_at) : row.updated_at as number,
    }))
  } catch (error) {
    console.error('Error fetching presentations:', error)
    return []
  }
}

export async function getPresentation(id: number): Promise<Presentation | null> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return null
    }

    const result = await turso.execute({
      sql: `SELECT * FROM presentations WHERE id = ? LIMIT 1`,
      args: [id],
    })

    if (result.rows.length > 0) {
      const row = result.rows[0]
      return {
        id: typeof row.id === 'bigint' ? Number(row.id) : row.id as number,
        title: row.title as string,
        description: row.description as string | null,
        verses: row.verses as string,
        user_id: row.user_id as string,
        created_at: typeof row.created_at === 'bigint' ? Number(row.created_at) : row.created_at as number,
        updated_at: typeof row.updated_at === 'bigint' ? Number(row.updated_at) : row.updated_at as number,
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching presentation:', error)
    return null
  }
}

export interface LiveSession {
  id: string
  presentation_id: number | null
  current_reference: string | null
  slide_index: number
  font_size: number
  is_blackout: boolean
  created_at: number
  updated_at: number
}

export async function createLiveSession(presentationId?: number): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    // Generate a random session ID
    const sessionId = generateSessionId()

    await turso.execute({
      sql: `INSERT INTO live_sessions (id, presentation_id, current_reference, slide_index, font_size, is_blackout)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [sessionId, presentationId || null, null, 0, 100, 0],
    })

    return { success: true, sessionId }
  } catch (error) {
    console.error('Error creating live session:', error)
    return { success: false, error: 'Failed to create live session' }
  }
}

export async function getLiveSession(sessionId: string): Promise<LiveSession | null> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return null
    }

    const result = await turso.execute({
      sql: `SELECT * FROM live_sessions WHERE id = ? LIMIT 1`,
      args: [sessionId],
    })

    if (result.rows.length > 0) {
      const row = result.rows[0]
      return {
        id: row.id as string,
        presentation_id: row.presentation_id as number | null,
        current_reference: row.current_reference as string | null,
        slide_index: row.slide_index as number,
        font_size: row.font_size as number,
        is_blackout: Boolean(row.is_blackout),
        created_at: typeof row.created_at === 'bigint' ? Number(row.created_at) : row.created_at as number,
        updated_at: typeof row.updated_at === 'bigint' ? Number(row.updated_at) : row.updated_at as number,
      }
    }
    return null
  } catch (error) {
    console.error('Error fetching live session:', error)
    return null
  }
}

export async function updateLiveSession(sessionId: string, updates: Partial<Omit<LiveSession, 'id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    // Build dynamic update query
    const updateFields = []
    const args = []

    if (updates.presentation_id !== undefined) {
      updateFields.push('presentation_id = ?')
      args.push(updates.presentation_id)
    }
    if (updates.current_reference !== undefined) {
      updateFields.push('current_reference = ?')
      args.push(updates.current_reference)
    }
    if (updates.slide_index !== undefined) {
      updateFields.push('slide_index = ?')
      args.push(updates.slide_index)
    }
    if (updates.font_size !== undefined) {
      updateFields.push('font_size = ?')
      args.push(updates.font_size)
    }
    if (updates.is_blackout !== undefined) {
      updateFields.push('is_blackout = ?')
      args.push(updates.is_blackout ? 1 : 0)
    }

    if (updateFields.length === 0) {
      return { success: true } // No changes to make
    }

    updateFields.push('updated_at = strftime(\'%s\', \'now\')')
    args.push(sessionId)

    const sql = `UPDATE live_sessions SET ${updateFields.join(', ')} WHERE id = ?`

    await turso.execute({
      sql,
      args,
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating live session:', error)
    return { success: false, error: 'Failed to update live session' }
  }
}

export async function deleteLiveSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    await turso.execute({
      sql: `DELETE FROM live_sessions WHERE id = ?`,
      args: [sessionId],
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting live session:', error)
    return { success: false, error: 'Failed to delete live session' }
  }
}

function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function cleanupExpiredSessions(): Promise<{ success: boolean; cleanedCount?: number; error?: string }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { success: false, error: 'Database not available' }
    }

    // Delete sessions older than 24 hours
    const twentyFourHoursAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60)
    
    await turso.execute({
      sql: `DELETE FROM live_sessions WHERE created_at < ?`,
      args: [twentyFourHoursAgo],
    })

    // Note: libSQL doesn't return changes count in the same way, so we'll estimate
    // For production, you might want to run a COUNT query first
    
    return { success: true, cleanedCount: 0 }
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    return { success: false, error: 'Failed to cleanup expired sessions' }
  }
}

export async function getSessionStats(): Promise<{ totalSessions: number; activeSessions: number }> {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return { totalSessions: 0, activeSessions: 0 }
    }

    const oneHourAgo = Math.floor(Date.now() / 1000) - (60 * 60)
    
    const totalResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM live_sessions`,
      args: [],
    })

    const activeResult = await turso.execute({
      sql: `SELECT COUNT(*) as count FROM live_sessions WHERE updated_at > ?`,
      args: [oneHourAgo],
    })

    const totalSessions = (totalResult.rows[0]?.count as number) || 0
    const activeSessions = (activeResult.rows[0]?.count as number) || 0

    return { totalSessions, activeSessions }
  } catch (error) {
    console.error('Error getting session stats:', error)
    return { totalSessions: 0, activeSessions: 0 }
  }
}
