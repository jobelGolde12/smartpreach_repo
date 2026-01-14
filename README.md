# Smart Preach - Church Preaching Web App

A modern, responsive web application designed for church preaching, allowing pastors to instantly display Bible verses during services.

## Features

- **Live Verse Search**: Search for Bible verses by keyword, phrase, or verse reference
- **Debounced Search**: 300ms delay for smooth searching experience
- **Verse Display Screen**: Large, readable verse display with smooth animations
- **Verse Suggestion Panel**: Shows search results, recently used verses, and favorites
- **Bible API Integration**: Uses bible-api.com for King James Version verses
- **Turso Database**: Stores search history, recent verses, and favorites
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Fullscreen Mode**: Presentation-ready layout for congregation viewing
- **Dark Mode Support**: Friendly for different lighting conditions
- **Voice Recognition**: Allows pastors to search for verses using voice commands
- **Notes Management**: Create and manage notes with associated Bible verses
- **Presentations**: Create and manage presentations with multiple verses

## Tech Stack

- **Next.js** (App Router) - React framework
- **Tailwind CSS** - Styling
- **Turso** (SQLite + libSQL) - Database
- **TypeScript** - Type safety
- **Server Actions** - Database operations
- **lucide-react** - Icons
- **Web Speech API** - Voice recognition

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd smartspreach
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Turso database credentials:
```env
TURSO_DATABASE_URL=libsql://your-database-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

For local development without Turso, you can use a local SQLite database:
```env
TURSO_DATABASE_URL=file:local.db
# No auth token needed for local file
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai-suggestions/route.ts    # AI suggestions API endpoint
│   │   ├── generate-presentation/route.ts    # Generate presentation API endpoint
│   │   ├── translate/route.ts    # Translation API endpoint
│   │   └── verses/route.ts    # API endpoints for verse operations
│   ├── generate-presentation/page.tsx    # Generate presentation page
│   ├── presentation/[id]/page.tsx    # Presentation page
│   ├── settings/page.tsx    # Settings page
│   ├── layout.tsx             # Root layout with metadata
│   ├── page.tsx               # Main page with app integration
│   └── globals.css            # Global styles
├── components/
│   ├── BibleNavigatorContent.tsx    # Bible navigation content
│   ├── LeftSidebar.tsx    # Left sidebar with navigation
│   ├── NoteModal.tsx    # Note modal
│   ├── NotesModal.tsx    # Notes modal
│   ├── PresentationsModal.tsx    # Presentations modal
│   ├── SearchBar.tsx          # Search input with debouncing
│   ├── ThemeProvider.tsx    # Theme provider
│   ├── VerseDisplay.tsx       # Main verse display with fullscreen
│   └── VerseSidebar.tsx       # Sidebar with search, recent, favorites
└── lib/
    ├── bibleApi.ts            # Bible API integration
    ├── bibleData.ts            # Bible data utilities
    ├── bibleJson.ts            # Bible JSON utilities
    ├── serverActions.ts       # Server actions for DB operations
    └── turso.ts               # Turso database connection
```

## Usage

### Search for Verses

1. Type a verse reference (e.g., "John 3:16") in the search bar
2. Or type a keyword (e.g., "love", "faith", "forgiveness")
3. Results will appear in the sidebar
4. Click any verse to display it on the main screen

### Manage Verses

- **Recent Verses**: View your recently displayed verses in the "Recent" tab
- **Favorites**: Add verses to favorites by clicking the heart icon
- **Fullscreen**: Click the fullscreen button in the top-right of the verse display for presentation mode

### Voice Recognition

1. Click the microphone icon in the header
2. Speak a verse reference or keyword
3. The app will automatically search for and display the verse

### Notes Management

1. Click the notes icon in the left sidebar
2. Create a new note or edit an existing one
3. Associate verses with your notes

### Presentations

1. Click the presentations icon in the left sidebar
2. Create a new presentation or edit an existing one
3. Add verses to your presentation

### Responsive Design

- **Desktop**: Two-column layout with sidebar
- **Tablet**: Collapsible sidebar
- **Mobile**: Full-screen verse view with slide-up verse list

## Database Schema

### Tables

**verses**: Stores displayed verses
- `id` (INTEGER, PRIMARY KEY)
- `book` (TEXT)
- `chapter` (INTEGER)
- `verse` (INTEGER)
- `text` (TEXT)
- `translation` (TEXT)
- `reference` (TEXT, UNIQUE)
- `displayed_at` (INTEGER, timestamp)
- `created_at` (INTEGER, timestamp)

**search_logs**: Stores search history
- `id` (INTEGER, PRIMARY KEY)
- `query` (TEXT)
- `result_count` (INTEGER)
- `created_at` (INTEGER, timestamp)

**favorites**: Stores favorite verses
- `id` (INTEGER, PRIMARY KEY)
- `verse_id` (INTEGER, FOREIGN KEY)
- `created_at` (INTEGER, timestamp)

## Building for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License.
