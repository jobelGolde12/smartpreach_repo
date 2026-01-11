# Smart Preach – Church Preaching Web App

Role:
You are a senior full-stack developer and UI/UX designer.

Tech Stack (MANDATORY):

- Next.js (App Router)
- Tailwind CSS
- Turso (SQLite + libSQL)
- TypeScript
- Server Actions
- Responsive & modern UI

## Project Overview

Create a web application called Smart Preach designed for church preaching.

The app helps pastors instantly display Bible verses when:

- The pastor types a keyword (e.g., love, faith, forgiveness)
- The pastor types or selects a verse (e.g., John 3:16)
- The pastor clicks a suggested verse on the right panel

The selected verse should be displayed prominently on the main screen for congregation viewing.

## Core Features

1. Live Verse Search
   - Input box where pastor types a word (keyword), a phrase, or a verse reference
   - Automatically fetch and display relevant Bible verses
   - Debounced search (300ms)

2. Verse Display Screen (Main)
   - Large readable verse text
   - Book name, chapter, and verse clearly shown
   - Smooth fade/slide animation when verse changes
   - Fullscreen / presentation-ready layout

3. Verse Suggestion Panel (Right Side)
   - Displays related verses, recently used verses
   - Clicking a verse instantly updates the main display
   - Scrollable & collapsible on mobile

4. Bible API Integration
   - Use https://bible-api.com
   - Fetch verses by keyword
   - Fetch verses by book + chapter + verse
   - Handle API errors gracefully

## Database (Turso)

Use Turso (SQLite) to store:
- Search history
- Recently displayed verses
- Favorite verses

Schema:
- verses
- search_logs
- favorites

## UI / UX Design

Design style:
- Modern, minimal, dark mode friendly
- Church/presentation-friendly typography
- Large readable fonts
- Smooth transitions
- Mobile-first responsive design

Layout:
```
---------------------------------
| Search Bar                    |
---------------------------------
| Main Verse Display | Sidebar |
| (Center Screen)    | Verses  |
---------------------------------
```

## Required Folder Structure

```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
│       └── verses/
│           └── route.ts
├── components/
│   ├── SearchBar.tsx
│   ├── VerseDisplay.tsx
│   └── VerseSidebar.tsx
├── lib/
│   ├── turso.ts
│   ├── bibleApi.ts
│   └── serverActions.ts
└── styles/
    └── globals.css
```

## Functional Requirements

- Use Server Actions for DB operations
- Use Client Components only where needed
- Fully typed with TypeScript
- Clean, readable, production-ready code
- Comments explaining important logic

## Responsiveness

- Desktop: 2-column layout
- Tablet: collapsible sidebar
- Mobile: full-screen verse view with slide-up verse list

## Output Expectations

Generate:
- Complete Next.js project setup
- Tailwind configuration
- Turso database setup
- API integration logic
- Fully functional UI components
- Clear instructions to run locally

## Purpose Reminder

This app is for church preaching, so:
- Prioritize readability
- Avoid clutter
- Focus on fast verse access
- Ensure stability during live preaching
