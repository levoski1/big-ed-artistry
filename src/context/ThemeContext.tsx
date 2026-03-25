'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('biged_theme') as Theme | null
    if (saved === 'light' || saved === 'dark') setTheme(saved)
    setMounted(true)
  }, [])

  // Apply theme class to <html> whenever theme changes
  useEffect(() => {
    if (!mounted) return
    const html = document.documentElement
    html.classList.remove('theme-dark', 'theme-light')
    html.classList.add(`theme-${theme}`)
    localStorage.setItem('biged_theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
