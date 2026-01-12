# TODO - Fix Notes Formatting Preview

## Problem
The note formatting didn't work properly - users could only see raw markdown syntax in the textarea while editing, but couldn't preview how their formatted text would look until after saving.

## Solution
Add a Preview toggle button that allows users to switch between editing mode (raw markdown) and preview mode (formatted HTML) while creating/editing notes.

## Tasks
- [x] Add Eye/EyeOff icons import
- [x] Add showPreview state variable
- [x] Add preview toggle button to formatting toolbar
- [x] Modify content area to conditionally render textarea or preview
- [x] Reset preview state when changing views
- [x] Test the implementation

## Changes Made
1. **NotesModal.tsx**:
   - Added `Eye` and `EyeOff` icons from lucide-react
   - Added `showPreview` state variable (defaults to false)
   - Added preview toggle button in formatting toolbar with visual feedback
   - Modified content area to conditionally render:
     - Textarea for editing (when `showPreview` is false)
     - Formatted HTML preview (when `showPreview` is true)
   - Added effect to reset `showPreview` when changing views

## Result
- Users can now toggle between "Edit" mode (raw markdown) and "Preview" mode (formatted HTML)
- Preview button shows Eye icon when preview is off, EyeOff when preview is on
- Preview uses the existing `renderContent()` function for consistent formatting
- Preview mode shows formatted text with proper styling (bold, italic, headings, etc.)
- Preview state resets when switching between add/edit views

---

# TODO - Fix Left Sidebar Back Button Layout

## Problem
When navigating Bible Navigator, two back buttons were displayed:
1. "Back to Menu" from LeftSidebar (always shown when `currentView !== 'menu'`)
2. "Back to Books/Chapters" from BibleNavigatorContent (shown when `viewState !== 'books'`)

## Solution
- Pass callback from BibleNavigatorContent to LeftSidebar to control back button visibility
- LeftSidebar only shows "Back to Menu" when Bible Navigator is at books level (not chapters/verses)

## Tasks
- [x] Modify BibleNavigatorContent `onViewStateChange` callback
- [x] Update LeftSidebar to add state for tracking Bible Navigator view level
- [x] Implement callback mechanism to sync view states between components
- [x] Test navigation flow

## Changes Made
1. **BibleNavigatorContent.tsx**:
   - Added `onViewStateChange?: (isAtBooksLevel: boolean) => void` prop
   - Added `updateViewState` function that notifies parent when view state changes
   - Updated `handleBookSelect`, `handleChapterSelect`, and `handleBack` to use `updateViewState`

2. **LeftSidebar.tsx**:
   - Added `isBibleNavigatorAtBooksLevel` state
   - Added `handleBibleNavigatorViewStateChange` callback
   - Updated back button condition to check `isBibleNavigatorAtBooksLevel`
   - Passed `onViewStateChange` prop to `BibleNavigatorContent`

## Result
- When Bible Navigator shows books list: LeftSidebar shows "Back to Menu"
- When Bible Navigator shows chapters or verses: BibleNavigatorContent handles its own "Back to Books/Chapters" button, and LeftSidebar does NOT show "Back to Menu"
- This eliminates the duplicate back button issue


