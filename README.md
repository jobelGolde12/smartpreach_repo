Smart Preach – Church Preaching Web App

A modern, responsive web application designed for church preaching, allowing pastors to instantly display Bible verses and control preaching flow during live services.

Features

Live Verse Search: Search for Bible verses by keyword, phrase, or verse reference

Debounced Search: 300ms delay for smooth searching experience

Verse Display Screen: Large, readable verse display with smooth animations

Verse Suggestion Panel: Shows search results, recently used verses, and favorites

Bible API Integration: Uses bible-api.com for King James Version verses

Turso Database: Stores search history, recent verses, and favorites

Responsive Design: Optimized for desktop, tablet, and mobile devices

Fullscreen Mode: Presentation-ready layout for congregation viewing

Dark Mode Support: Friendly for different lighting conditions

Voice Recognition: Allows pastors to search for verses using voice commands

Notes Management: Create and manage notes with associated Bible verses

Presentations: Create and manage presentations with multiple verses

🆕 Live Remote Controller (Second-Screen Mode)

Live Session Control: Start a live preaching session that synchronizes verse and presentation state across devices

Mobile Remote Control: Use a phone or tablet as a remote controller during preaching

QR Code Access: Instantly connect a remote device by scanning a QR code

Real-Time Sync: All connected clients stay in sync with the current verse and presentation state

Remote Actions:

Next / Previous verse

Jump to recent or favorite verses

Navigate presentation slides

Adjust verse font size

Black screen / fade verses temporarily

Session-Based Security: Remote access is scoped to an active session using secure tokens

Tech Stack

Next.js (App Router) – React framework

Tailwind CSS – Styling

Turso (SQLite + libSQL) – Database

TypeScript – Type safety

Server Actions – Database operations

lucide-react – Icons

Web Speech API – Voice recognition

Getting Started
Prerequisites

Node.js 18+ installed

npm, yarn, pnpm, or bun package manager

Installation

Clone the repository:

git clone <your-repo-url>
cd smartspreach


Install dependencies:

npm install
# or
yarn install
# or
pnpm install


Set up environment variables:

Copy the .env.example file to .env:

cp .env.example .env


Edit .env and add your Turso database credentials:

TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here


For local development without Turso, you can use a local SQLite database:

TURSO_DATABASE_URL=file:local.db
# No auth token needed for local file

Running the Development Server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


Open http://localhost:3000
 with your browser to see the application.

Project Structure
src/
├── app/
│   ├── api/
│   │   ├── ai-suggestions/route.ts        # AI suggestions API
│   │   ├── generate-presentation/route.ts # Presentation generation API
│   │   ├── translate/route.ts             # Translation API
│   │   └── verses/route.ts                # Verse API
│   ├── generate-presentation/page.tsx
│   ├── presentation/[id]/page.tsx
│   ├── settings/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── BibleNavigatorContent.tsx
│   ├── LeftSidebar.tsx
│   ├── NoteModal.tsx
│   ├── NotesModal.tsx
│   ├── PresentationsModal.tsx
│   ├── SearchBar.tsx
│   ├── ThemeProvider.tsx
│   ├── VerseDisplay.tsx
│   └── VerseSidebar.tsx
└── lib/
    ├── bibleApi.ts
    ├── bibleData.ts
    ├── bibleJson.ts
    ├── serverActions.ts
    └── turso.ts

Usage
Search for Verses

Type a verse reference (e.g., John 3:16) in the search bar

Or type a keyword (e.g., love, faith, forgiveness)

Results appear in the sidebar

Click a verse to display it instantly

Live Remote Controller

Start a Live Session from the main interface

Scan the generated QR code using a phone or tablet

Use the mobile interface to:

Navigate verses or presentation slides

Control font size

Temporarily hide verses (black screen)

End the session at any time

Manage Verses

Recent Verses: Quickly revisit recently displayed verses

Favorites: Save frequently used verses

Fullscreen: Presentation-ready mode for live services

Voice Recognition

Click the microphone icon

Speak a verse reference or keyword

The verse is searched and displayed automatically

Notes Management

Open Notes from the sidebar

Create or edit sermon notes

Attach Bible verses to notes for quick reference

Presentations

Open Presentations from the sidebar

Create or edit a presentation

Add multiple verses and navigate them live

Responsive Design

Desktop: Two-column layout with sidebar

Tablet: Collapsible sidebar

Mobile: Full-screen verse view with slide-up controls

Database Schema
Tables

verses

id (INTEGER, PRIMARY KEY)

book (TEXT)

chapter (INTEGER)

verse (INTEGER)

text (TEXT)

translation (TEXT)

reference (TEXT, UNIQUE)

displayed_at (INTEGER)

created_at (INTEGER)

search_logs

id (INTEGER, PRIMARY KEY)

query (TEXT)

result_count (INTEGER)

created_at (INTEGER)

favorites

id (INTEGER, PRIMARY KEY)

verse_id (INTEGER, FOREIGN KEY)

created_at (INTEGER)

live_sessions

id (TEXT, PRIMARY KEY)

presentation_id (INTEGER, nullable)

current_reference (TEXT)

slide_index (INTEGER)

font_size (INTEGER)

is_blackout (BOOLEAN)

created_at (INTEGER)

updated_at (INTEGER)

Building for Production
npm run build
npm start

Deploy on Vercel

Deploy easily using the Vercel Platform
.
See the Next.js deployment documentation
.

License

This project is licensed under the MIT License.