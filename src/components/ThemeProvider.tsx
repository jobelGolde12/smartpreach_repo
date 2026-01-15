'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { SessionProvider } from 'next-auth/react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme | undefined
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: undefined,
  setTheme: () => {},
})

// Helper to get the actual theme value (resolves 'system' to actual theme)
function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }
  return theme
}

// Helper to apply theme to document
function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return

  const resolvedTheme = getResolvedTheme(theme)
  const isDark = resolvedTheme === 'dark'

  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(isDark ? 'dark' : 'light')

  if (isDark) {
    document.documentElement.style.setProperty('--background', '#0a0a0a')
    document.documentElement.style.setProperty('--foreground', '#ededed')
  } else {
    document.documentElement.style.setProperty('--background', '#ffffff')
    document.documentElement.style.setProperty('--foreground', '#171717')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'system'
    try {
      const stored = localStorage.getItem('theme') as Theme | null
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        return stored
      }
    } catch {
      return 'system'
    }
    return 'system'
  }

  const [theme, setThemeState] = useState<Theme>(getInitialTheme())
  const [mounted, setMounted] = useState(false)

  // Apply theme and setup system theme listener
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('theme', theme)
    requestAnimationFrame(() => {
      setMounted(true)
    })

    // Listen for system theme changes when using 'system' mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(theme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <SessionProvider>
      <ThemeContext.Provider value={{ theme: mounted ? theme : undefined, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </SessionProvider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

