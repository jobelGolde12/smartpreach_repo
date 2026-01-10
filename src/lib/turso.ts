import { createClient } from '@libsql/client'

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || 'file:local.db'
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN

let client: ReturnType<typeof createClient> | null = null

export function getTursoClient() {
  if (!client) {
    try {
      client = createClient({
        url: TURSO_DATABASE_URL,
        authToken: TURSO_AUTH_TOKEN,
      })
    } catch (error) {
      console.error('Failed to create Turso client:', error)
      return null
    }
  }
  return client
}

export const turso = getTursoClient()

export async function initializeDatabase() {
  const db = getTursoClient()
  if (!db) {
    console.warn('Turso client not available, skipping database initialization')
    return
  }

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book TEXT NOT NULL,
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        text TEXT NOT NULL,
        translation TEXT DEFAULT 'kjv',
        reference TEXT NOT NULL UNIQUE,
        displayed_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS search_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        result_count INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_id INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE
      )
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_verses_reference ON verses(reference)
    `)

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_verses_displayed_at ON verses(displayed_at)
    `)
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

initializeDatabase()
