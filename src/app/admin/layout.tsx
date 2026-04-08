import { type ReactNode } from 'react'

// Root admin layout — no auth check here.
// Auth is handled by src/app/admin/(protected)/layout.tsx
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
