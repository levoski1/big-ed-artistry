import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { ThemeProvider } from '@/context/ThemeContext'

export const metadata: Metadata = {
  title: 'Big Ed Artistry – Custom Hand-Drawn Art',
  description: 'Turn your photos into beautiful hand-drawn masterpieces. Custom pencil and charcoal portraits by Nigerian artist Big Ed.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="theme-dark">
      <head>
        {/* Prevent flash of wrong theme on first paint */}
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var t = localStorage.getItem('biged_theme');
              if (t === 'light' || t === 'dark') {
                document.documentElement.classList.remove('theme-dark','theme-light');
                document.documentElement.classList.add('theme-' + t);
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
