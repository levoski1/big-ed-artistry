'use client'
import { useState } from 'react'

export type DeletionType = 'user_only' | 'full'

export interface ConfirmDeleteModalProps {
  title: string
  message: string
  detailLines: { label: string; value: string }[]
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: (type: DeletionType) => void
  onCancel: () => void
  loading?: boolean
  error?: string
  showDeletionType?: boolean
}

const DELETION_OPTIONS: { value: DeletionType; label: string; desc: string }[] = [
  { value: 'user_only', label: 'Delete User Only', desc: 'Removes the user account. Keeps all orders, payments, reviews, and uploads for historical records.' },
  { value: 'full', label: 'Delete User + All Activities', desc: 'Permanently removes the user account and all associated data including orders, payments, uploads, reviews, and notifications.' },
]

export default function ConfirmDeleteModal({
  title,
  message,
  detailLines,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  error,
  showDeletionType = false,
}: ConfirmDeleteModalProps) {
  const [deletionType, setDeletionType] = useState<DeletionType>('user_only')

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      data-testid="confirm-delete-modal"
      style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={loading ? undefined : onCancel}
        data-testid="confirm-delete-backdrop"
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', cursor: loading ? 'not-allowed' : 'pointer' }}
      />

      <div
        data-testid="confirm-delete-content"
        style={{
          position: 'relative',
          background: 'var(--bg-card)',
          border: '1px solid var(--danger)',
          maxWidth: 500,
          width: '100%',
          padding: 36,
          animation: 'confirmDeleteIn 0.25s ease',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12, textAlign: 'center' }}>⚠️</div>

        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 26, color: 'var(--text-primary)', textAlign: 'center', margin: '0 0 8px' }}>
          {title}
        </h2>

        <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.7, margin: '0 0 20px' }}>
          {message}
        </p>

        <div style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: 14, marginBottom: 20 }}>
          {detailLines.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, gap: 12 }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
              <span style={{ color: 'var(--text-primary)', textAlign: 'right', wordBreak: 'break-word' }}>{value}</span>
            </div>
          ))}
        </div>

        {showDeletionType && (
          <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DELETION_OPTIONS.map(opt => (
              <label
                key={opt.value}
                data-testid={`deletion-type-${opt.value}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  background: deletionType === opt.value ? 'rgba(184,134,11,0.08)' : 'var(--bg-dark)',
                  border: deletionType === opt.value ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="deletionType"
                  value={opt.value}
                  checked={deletionType === opt.value}
                  onChange={() => setDeletionType(opt.value)}
                  disabled={loading}
                  style={{ marginTop: 2, accentColor: 'var(--gold-primary)', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {opt.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {error && (
          <div data-testid="confirm-delete-error" style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', fontSize: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            data-testid="confirm-delete-cancel"
            style={{ padding: '12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onConfirm(deletionType)}
            disabled={loading}
            data-testid="confirm-delete-confirm"
            style={{ padding: '12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: loading ? 'var(--bg-dark)' : 'var(--danger)', color: loading ? 'var(--text-muted)' : '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: '"Libre Franklin",sans-serif' }}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>

      <style suppressHydrationWarning>{`
        @keyframes confirmDeleteIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 600px) {
          [data-testid="confirm-delete-modal"] > div:last-child { padding: 20px 14px !important; }
        }
      `}</style>
    </div>
  )
}
