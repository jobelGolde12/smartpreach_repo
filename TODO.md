# Theme Fix Plan

## Problems Identified:
1. The `ThemeProvider` uses `window.matchMedia` in a useEffect that runs on both server and client, causing hydration issues
2. No system theme change listener to detect when user changes their OS theme
3. The theme application logic has some bugs in the class toggling

## Fix Plan:
1. Fix ThemeProvider.tsx to:
   - Add SSR-safe checks using `typeof window !== 'undefined'`
   - Add a media query listener to react to system theme changes
   - Fix the theme application logic to properly toggle dark mode
   - Ensure localStorage persistence works correctly

## Status:
- [x] Fix ThemeProvider.tsx
- [x] Add inline script to layout.tsx for SSR theme application
- [x] Build verification passed

## Changes Made:
1. **ThemeProvider.tsx** - Refactored with:
   - SSR-safe checks using `typeof window !== 'undefined'`
   - Proper theme resolution helper functions
   - Media query listener for system theme changes
   - Fixed theme application logic

2. **app/layout.tsx** - Added inline script that:
   - Runs before React hydrates
   - Reads theme from localStorage
   - Resolves 'system' to actual theme based on OS preference
   - Applies dark mode class and CSS variables immediately
   - Prevents flash of wrong theme (FOUC)

