You are a senior full-stack engineer and system architect helping build a feature for Smart Preach, a modern church preaching web app built with:

Next.js (App Router)

TypeScript

Tailwind CSS

Turso (SQLite + libSQL)

Server Actions

Web APIs (Web Speech API, etc.)

The app is used during live church services, allowing pastors to control verse and presentation flow in real time.

🎯 Feature Goal

Design and implement a Live Remote Controller (Second-Screen Mode) that allows a pastor to control the currently active preaching session from a phone or tablet in real time.

The purpose is to allow seamless control of verses and presentations without needing to interact directly with the main interface during preaching.

📱 Remote Controller Capabilities

The remote controller must support the following actions:

⏭️ Next verse

⏮️ Previous verse

📖 Jump to:

Recent verses

Favorite verses

Saved presentation slides

🌑 Black screen / fade screen (temporary hide verses)

🔠 Increase / decrease verse font size

🧭 Navigate presentation slides

🔄 Sync current verse and presentation state in real time

🔄 How It Works (User Flow)

Pastor starts a Live Session

App generates:

A session ID

A secure remote URL

A QR code

Pastor opens the remote URL on a phone or tablet

The phone becomes a remote controller

Any action taken on the remote:

Updates the active preaching session state instantly

The session can be ended at any time

🧠 System Design Requirements
Session State

Each live preaching session must maintain:

Active verse reference

Active presentation (optional)

Current slide index

Font size

Blackout / fade state

Last update timestamp

All connected clients must remain in sync with the session state.

🔐 Security Requirements

Remote access must be:

Session-scoped

Token-based

Remote links should:

Use random, non-guessable IDs

Optionally expire after inactivity

Prevent unauthorized control outside an active session

🗄️ Suggested Database Schema (Turso)
live_sessions (
  id TEXT PRIMARY KEY,
  presentation_id INTEGER,
  current_reference TEXT,
  slide_index INTEGER DEFAULT 0,
  font_size INTEGER DEFAULT 100,
  is_blackout BOOLEAN DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER
)

⚙️ Implementation Strategy
Preferred: Real-Time Communication

WebSockets or WebRTC data channels

Clients subscribe to session updates

Remote sends control events

Immediate state synchronization

Alternative: Polling + Server Actions

Remote updates session state via Server Actions

Clients poll session state every 300–500ms

Easier to implement, acceptable for small congregations

🧱 UI Requirements
Remote Controller UI

Mobile-first design

Large, touch-friendly buttons

Minimal text, high contrast

Sections:

Navigation controls

Verse & slide selector

Display control buttons

🧑‍💻 Code Expectations

When generating implementation guidance:

Use Next.js App Router

Prefer Server Actions for database mutations

Use TypeScript

Keep components modular and reusable

Include:

Live session creation logic

Remote controller routing

Session state synchronization

Example React components

Example server actions

🧪 Edge Cases to Handle

Remote refresh or disconnect

Multiple remotes connected simultaneously

Session expiration

Network latency or dropped connections

Accidental double input

🎁 Optional Enhancements

If relevant, suggest:

Confidence monitor mode (notes visible only to pastor)

Verse word highlighting

Auto-scroll for long passages

Sermon timer

Multi-language verse switching

📌 Output Format Required

Your response must include:

High-level architecture

Detailed data flow

UI structure

Database design

Step-by-step implementation plan

Sample code snippets

Best practices

Avoid vague descriptions. Provide practical, production-ready guidance.

🏁 Final Instruction

Treat this as a mission-critical live preaching feature where simplicity, reliability, and responsiveness are more important than experimental features.