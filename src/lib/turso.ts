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

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_verses_text_fts ON verses(text)
    `)

    // Initialize NextAuth tables for Prisma
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "emailVerified" DATETIME,
        "image" TEXT
      )
    `)

    await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `)

    await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `)

    await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")
    `)

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" DATETIME NOT NULL
      )
    `)

    await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token")
    `)

    await db.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")
    `)
  } catch (error) {
    console.error('Failed to initialize database:', error)
  }
}

export async function searchVersesLocally(keyword: string, limit: number = 20) {
  try {
    const turso = getTursoClient()
    if (!turso) {
      return []
    }

    const searchTerm = `%${keyword}%`

    const result = await turso.execute({
      sql: `SELECT * FROM verses
            WHERE text LIKE ?
            ORDER BY displayed_at DESC
            LIMIT ?`,
      args: [searchTerm, limit],
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
    console.error('Error searching verses locally:', error)
    return []
  }
}

initializeDatabase()
