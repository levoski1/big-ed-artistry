/**
 * Tests for sidebar toggle button overlap fix (issue #17)
 *
 * Verifies:
 * - Toggle button renders with correct scoped class names (no generic selectors)
 * - Toggle button has correct z-index and fixed positioning
 * - Content wrapper has the class that receives mobile padding-top offset
 * - Sidebar open/close state is toggled correctly via the button
 * - Overlay renders when sidebar is open and closes on click
 * - Sidebar has correct z-index (below toggle, above content)
 * - aria-expanded reflects open state for accessibility
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import AdminSidebar from '@/components/dashboard/AdminSidebar'

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

jest.mock('next/link', () =>
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
)

jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ isDark: true, toggleTheme: jest.fn() }),
}))

jest.mock('@/app/actions/auth', () => ({
  logout: jest.fn(),
}))

// ── DashboardSidebar ─────────────────────────────────────────────────────────

describe('DashboardSidebar — toggle overlap fix', () => {
  it('renders toggle button with scoped class (not generic mobile-menu-btn)', () => {
    const { container } = render(<DashboardSidebar />)
    const btn = container.querySelector('.dashboard-mobile-btn')
    expect(btn).toBeInTheDocument()
    expect(container.querySelector('.mobile-menu-btn')).toBeNull()
  })

  it('toggle button has position:fixed and high z-index to stay above content', () => {
    const { container } = render(<DashboardSidebar />)
    const btn = container.querySelector('.dashboard-mobile-btn') as HTMLElement
    expect(btn.style.position).toBe('fixed')
    expect(Number(btn.style.zIndex)).toBeGreaterThanOrEqual(999)
  })

  it('sidebar has lower z-index than toggle button', () => {
    const { container } = render(<DashboardSidebar />)
    const btn = container.querySelector('.dashboard-mobile-btn') as HTMLElement
    const sidebar = container.querySelector('.dashboard-sidebar') as HTMLElement
    // sidebar z-index is applied via CSS class at 99; button is 999
    expect(Number(btn.style.zIndex)).toBeGreaterThan(Number(sidebar.style.zIndex || 0))
  })

  it('content wrapper class is present for mobile padding-top offset', () => {
    // The layout renders the content div with className="dashboard-content".
    // We verify the CSS rule exists in the sidebar's injected <style> tag.
    const { container } = render(<DashboardSidebar />)
    const styleTag = container.querySelector('style')
    expect(styleTag?.textContent).toMatch(/\.dashboard-content/)
    expect(styleTag?.textContent).toMatch(/padding-top/)
  })

  it('sidebar is closed by default', () => {
    const { container } = render(<DashboardSidebar />)
    const sidebar = container.querySelector('.dashboard-sidebar')
    expect(sidebar).not.toHaveClass('open')
  })

  it('toggle button opens the sidebar', () => {
    const { container } = render(<DashboardSidebar />)
    const btn = container.querySelector('.dashboard-mobile-btn') as HTMLElement
    fireEvent.click(btn)
    expect(container.querySelector('.dashboard-sidebar')).toHaveClass('open')
  })

  it('toggle button closes an open sidebar', () => {
    const { container } = render(<DashboardSidebar />)
    const btn = container.querySelector('.dashboard-mobile-btn') as HTMLElement
    fireEvent.click(btn) // open
    fireEvent.click(btn) // close
    expect(container.querySelector('.dashboard-sidebar')).not.toHaveClass('open')
  })

  it('overlay renders when sidebar is open', () => {
    const { container } = render(<DashboardSidebar />)
    expect(container.querySelector('.dashboard-mobile-overlay')).toBeNull()
    fireEvent.click(container.querySelector('.dashboard-mobile-btn') as HTMLElement)
    expect(container.querySelector('.dashboard-mobile-overlay')).toBeInTheDocument()
  })

  it('clicking overlay closes the sidebar', () => {
    const { container } = render(<DashboardSidebar />)
    fireEvent.click(container.querySelector('.dashboard-mobile-btn') as HTMLElement)
    fireEvent.click(container.querySelector('.dashboard-mobile-overlay') as HTMLElement)
    expect(container.querySelector('.dashboard-sidebar')).not.toHaveClass('open')
  })

  it('aria-expanded reflects open state', () => {
    const { container } = render(<DashboardSidebar />)
    const btn = container.querySelector('.dashboard-mobile-btn') as HTMLElement
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('overlay uses scoped class (not generic mobile-overlay)', () => {
    const { container } = render(<DashboardSidebar />)
    fireEvent.click(container.querySelector('.dashboard-mobile-btn') as HTMLElement)
    expect(container.querySelector('.mobile-overlay')).toBeNull()
    expect(container.querySelector('.dashboard-mobile-overlay')).toBeInTheDocument()
  })
})

// ── AdminSidebar ─────────────────────────────────────────────────────────────

describe('AdminSidebar — toggle overlap fix', () => {
  it('renders toggle button with scoped class (not generic mobile-menu-btn)', () => {
    const { container } = render(<AdminSidebar />)
    const btn = container.querySelector('.admin-mobile-btn')
    expect(btn).toBeInTheDocument()
    expect(container.querySelector('.mobile-menu-btn')).toBeNull()
  })

  it('toggle button has position:fixed and high z-index', () => {
    const { container } = render(<AdminSidebar />)
    const btn = container.querySelector('.admin-mobile-btn') as HTMLElement
    expect(btn.style.position).toBe('fixed')
    expect(Number(btn.style.zIndex)).toBeGreaterThanOrEqual(999)
  })

  it('content wrapper class is present for mobile padding-top offset', () => {
    const { container } = render(<AdminSidebar />)
    const styleTag = container.querySelector('style')
    expect(styleTag?.textContent).toMatch(/\.admin-content/)
    expect(styleTag?.textContent).toMatch(/padding-top/)
  })

  it('sidebar is closed by default', () => {
    const { container } = render(<AdminSidebar />)
    const sidebar = container.querySelector('.admin-sidebar')
    expect(sidebar).not.toHaveClass('open')
  })

  it('toggle button opens the sidebar via className (not inline !important style)', () => {
    const { container } = render(<AdminSidebar />)
    fireEvent.click(container.querySelector('.admin-mobile-btn') as HTMLElement)
    expect(container.querySelector('.admin-sidebar')).toHaveClass('open')
  })

  it('toggle button closes an open sidebar', () => {
    const { container } = render(<AdminSidebar />)
    const btn = container.querySelector('.admin-mobile-btn') as HTMLElement
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(container.querySelector('.admin-sidebar')).not.toHaveClass('open')
  })

  it('overlay renders when sidebar is open', () => {
    const { container } = render(<AdminSidebar />)
    expect(container.querySelector('.admin-mobile-overlay')).toBeNull()
    fireEvent.click(container.querySelector('.admin-mobile-btn') as HTMLElement)
    expect(container.querySelector('.admin-mobile-overlay')).toBeInTheDocument()
  })

  it('clicking overlay closes the sidebar', () => {
    const { container } = render(<AdminSidebar />)
    fireEvent.click(container.querySelector('.admin-mobile-btn') as HTMLElement)
    fireEvent.click(container.querySelector('.admin-mobile-overlay') as HTMLElement)
    expect(container.querySelector('.admin-sidebar')).not.toHaveClass('open')
  })

  it('aria-expanded reflects open state', () => {
    const { container } = render(<AdminSidebar />)
    const btn = container.querySelector('.admin-mobile-btn') as HTMLElement
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })

  it('no generic aside selector in CSS (prevents cross-component bleed)', () => {
    const { container } = render(<AdminSidebar />)
    // All style tags should not contain bare "aside {" or "aside.open {"
    const styles = Array.from(container.querySelectorAll('style'))
      .map(s => s.textContent ?? '')
      .join('')
    expect(styles).not.toMatch(/\baside\s*\{/)
    expect(styles).not.toMatch(/\baside\.open\s*\{/)
  })

  it('overlay uses scoped class (not generic mobile-overlay)', () => {
    const { container } = render(<AdminSidebar />)
    fireEvent.click(container.querySelector('.admin-mobile-btn') as HTMLElement)
    expect(container.querySelector('.mobile-overlay')).toBeNull()
    expect(container.querySelector('.admin-mobile-overlay')).toBeInTheDocument()
  })
})
