'use client'
import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import Link from 'next/link'

// ─── Button ───────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  fullWidth?: boolean
  children: ReactNode
}

const btnStyles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: '"Libre Franklin", sans-serif', fontWeight: 500,
    letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
    border: 'none', transition: 'all 0.3s ease', textDecoration: 'none',
  },
  primary: { background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-accent))', color: 'var(--text-on-gold)' },
  outline: { background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' },
  ghost: { background: 'transparent', color: 'var(--text-secondary)' },
  danger: { background: 'var(--danger)', color: 'var(--text-primary)' },
  sm: { padding: '8px 18px', fontSize: 11 },
  md: { padding: '12px 28px', fontSize: 12 },
  lg: { padding: '16px 40px', fontSize: 13 },
}

export function Button({ variant = 'primary', size = 'md', href, fullWidth, children, style, ...props }: ButtonProps) {
  const s = { ...btnStyles.base, ...btnStyles[variant], ...btnStyles[size], ...(fullWidth ? { width: '100%' } : {}), ...style }
  if (href) return <Link href={href} style={s}>{children}</Link>
  return <button style={s} {...props}>{children}</button>
}

// ─── Badge ────────────────────────────────────────────────────────────────
export function Badge({ children, color = 'var(--gold-primary)' }: { children: ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '4px 12px', fontSize: 10,
      fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
      background: color, color: 'var(--text-on-gold)',
    }}>{children}</span>
  )
}

// ─── StatusBadge ──────────────────────────────────────────────────────────
import { getStatusColor, getStatusLabel } from '@/lib/tokens'

export function StatusBadge({ status }: { status: string }) {
  const color = getStatusColor(status)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', fontSize: 11,
      fontWeight: 500, letterSpacing: '0.08em',
      border: `1px solid ${color}22`,
      background: `${color}11`, color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {getStatusLabel(status)}
    </span>
  )
}

// ─── SectionTag ───────────────────────────────────────────────────────────
export function SectionTag({ children, center }: { children: ReactNode; center?: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 12,
      fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'var(--gold-primary)', marginBottom: 20,
      justifyContent: center ? 'center' : undefined,
    }}>
      <span style={{ width: 32, height: 1, background: 'var(--gold-primary)', display: 'block' }} />
      {children}
      {center && <span style={{ width: 32, height: 1, background: 'var(--gold-primary)', display: 'block' }} />}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div style={{ width: 20, height: 20, border: '2px solid var(--border-color)', borderTopColor: 'var(--gold-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ─── GoldLine ─────────────────────────────────────────────────────────────
export function GoldLine() {
  return <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-primary), transparent)', margin: '16px auto' }} />
}

// ─── PageHero ─────────────────────────────────────────────────────────────
export function PageHero({ tag, title, subtitle }: { tag: string; title: ReactNode; subtitle?: string }) {
  return (
    <section style={{ padding: '160px 0 80px', borderBottom: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 70% at 50% 50%, rgba(184,134,11,0.06) 0%, transparent 70%)' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative' }}>
        <SectionTag center>{tag}</SectionTag>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(48px, 6vw, 80px)', fontWeight: 500, marginBottom: 20 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>{subtitle}</p>}
      </div>
    </section>
  )
}

// ─── ArtPlaceholder ───────────────────────────────────────────────────────
export function ArtPlaceholder({ label, style }: { label?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-card)', transition: 'background 0.35s ease', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 12,
      color: 'var(--text-muted)', fontSize: 12, letterSpacing: '0.1em',
      textTransform: 'uppercase', width: '100%', height: '100%',
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.2 }}>
        <circle cx="24" cy="16" r="10" stroke="#D4A84B" strokeWidth="1" />
        <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#D4A84B" strokeWidth="1" />
      </svg>
      {label && <span>{label}</span>}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(184,134,11,0.03) 28px,rgba(184,134,11,0.03) 29px)' }} />
    </div>
  )
}

// ─── FormControl ──────────────────────────────────────────────────────────
export function FormGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-input)', border: '1px solid var(--border-color)',
  padding: '14px 18px', color: 'var(--text-primary)',
  fontFamily: '"Libre Franklin", sans-serif', fontSize: 14,
  outline: 'none', transition: 'border-color 0.3s, background 0.35s, color 0.35s', width: '100%',
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input style={inputStyle} {...props} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea style={{ ...inputStyle, resize: 'none', minHeight: 120 }} {...props} />
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }} {...props}>{children}</select>
}
