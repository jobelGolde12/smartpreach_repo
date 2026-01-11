# TODO - Fix Left Sidebar Back Button Layout

## Problem
When navigating Bible Navigator, there are TWO back buttons displayed:
1. "Back to Menu" from LeftSidebar (always shown when `currentView !== 'menu'`)
2. "Back to Books/Chapters" from BibleNavigatorContent (shown when `viewState !== 'books'`)

## Solution
- Pass a prop/callback from BibleNavigatorContent to LeftSidebar to control back button visibility
- LeftSidebar only shows "Back to Menu" when at the books level (not in chapters/verses)

## Tasks
- [x] 1. Modify BibleNavigatorContent to accept `onViewStateChange` callback
- [x] 2. Update LeftSidebar to add state for tracking Bible Navigator view level
- [x] 3. Implement the callback mechanism to sync view state between components
- [x] 4. Test the navigation flow

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


