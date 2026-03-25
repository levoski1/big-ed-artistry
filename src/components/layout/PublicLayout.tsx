import Navbar from '@/components/navigation/Navbar'
import Footer from '@/components/navigation/Footer'
import { type ReactNode } from 'react'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
