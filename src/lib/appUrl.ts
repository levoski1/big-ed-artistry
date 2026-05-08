let _cachedUrl: string | null = null

function resolveAppUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? 'http://localhost:3000'
      : undefined)
  )
}

export function getAppUrl(): string {
  if (_cachedUrl !== null) return _cachedUrl

  const url = resolveAppUrl()
  if (!url) {
    console.error('[appUrl] NEXT_PUBLIC_APP_URL is not set in production.')
    _cachedUrl = ''
    return ''
  }

  _cachedUrl = url.replace(/\/+$/, '')
  return _cachedUrl
}

export function url(path: string): string {
  const base = getAppUrl()
  if (!base) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath}`
}

export function resetAppUrlCache(): void {
  _cachedUrl = null
}
