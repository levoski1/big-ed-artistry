'use client'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastNotificationProps {
  message: string
  variant?: ToastVariant
  onDismiss: () => void
}

const variantStyles: Record<ToastVariant, { border: string; icon: string; iconColor: string }> = {
  success: { border: 'var(--gold-primary)', icon: '✦', iconColor: 'var(--gold-light)' },
  error:   { border: '#e53e3e',             icon: '✕', iconColor: '#fc8181'           },
  info:    { border: 'var(--border-color)', icon: '◆', iconColor: 'var(--text-muted)' },
}

export default function ToastNotification({ message, variant = 'success', onDismiss }: ToastNotificationProps) {
  const { border, icon, iconColor } = variantStyles[variant]
  return (
    <div
      data-testid="toast-notification"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', bottom: 32, right: 32, zIndex: 9000,
        background: 'var(--bg-card)', border: `1px solid ${border}`,
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        animation: 'toastIn 0.3s ease',
        maxWidth: 360,
        transition: 'background 0.35s ease, border-color 0.35s ease',
      }}
    >
      <span aria-hidden="true" style={{ color: iconColor, fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, marginLeft: 8, flexShrink: 0, padding: 0 }}
      >
        ✕
      </button>
      <style suppressHydrationWarning>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
