/**
 * Tests for uploadFile — validates server-side file validation,
 * including type checking, size limits, and error handling.
 */

import { uploadFile } from '@/app/actions/uploads'
import { ERR } from '@/lib/errorMessages'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

// ─── Mock Supabase ────────────────────────────────────────────────────────

const mockGetUser = jest.fn(() => Promise.resolve({ data: { user: { id: 'user-uuid-1' } } }))
const mockStorageUpload = jest.fn()
const mockCreateSignedUrl = jest.fn()
const mockUploadsInsert = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      storage: {
        from: jest.fn(() => ({
          upload: mockStorageUpload,
          createSignedUrl: mockCreateSignedUrl,
        })),
      },
      from: jest.fn((table: string) => {
        if (table === 'uploads') return { insert: mockUploadsInsert }
        return {}
      }),
    })
  ),
}))

// ─── Test data ────────────────────────────────────────────────────────────

const validFormData = (name: string, type: string, size: number) => {
  const fd = new FormData()
  fd.append('file', new File(['test'], name, { type }))
  // Override size since File constructor doesn't always respect it
  Object.defineProperty(fd.get('file'), 'size', { value: size })
  return fd
}

function createMockFile(name: string, type: string, size: number): File {
  const file = new File(['x'.repeat(Math.min(size, 1))], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function formDataFromFile(file: File): FormData {
  const fd = new FormData()
  fd.append('file', file)
  return fd
}

// ─── Setup ────────────────────────────────────────────────────────────────

const mockUploadRow = {
  id: 'upload-uuid-1',
  user_id: 'user-uuid-1',
  order_item_id: null,
  file_name: 'receipt.jpg',
  storage_path: 'user-uuid-1/1234567890.jpg',
  file_url: 'https://example.com/signed-url',
  file_type: 'payment_receipt',
  file_size: 1024,
  created_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockStorageUpload.mockResolvedValue({ error: null })
  mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://example.com/signed-url' }, error: null })
  mockUploadsInsert.mockReturnValue({
    select: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({ data: mockUploadRow, error: null })),
    })),
  })
})

// ─── Tests ────────────────────────────────────────────────────────────────

describe('uploadFile — server-side file validation', () => {
  it('rejects files with no extension', async () => {
    const file = createMockFile('receipt', 'image/jpeg', 1024)
    Object.defineProperty(file, 'name', { value: 'receipt' })
    const fd = formDataFromFile(file)

    await expect(uploadFile(fd, 'payment_receipt')).rejects.toThrow(ERR.UPLOAD_INVALID_TYPE)
  })

  it('rejects unsupported file extensions', async () => {
    const file = createMockFile('receipt.exe', 'application/x-msdownload', 1024)
    const fd = formDataFromFile(file)

    await expect(uploadFile(fd, 'payment_receipt')).rejects.toThrow(ERR.UPLOAD_INVALID_TYPE)
  })

  it('rejects files that are too large', async () => {
    const file = createMockFile('receipt.jpg', 'image/jpeg', 11 * 1024 * 1024)
    const fd = formDataFromFile(file)

    await expect(uploadFile(fd, 'payment_receipt')).rejects.toThrow(ERR.UPLOAD_TOO_LARGE)
  })

  it('accepts valid JPG files', async () => {
    const file = createMockFile('receipt.jpg', 'image/jpeg', 1024)
    const fd = formDataFromFile(file)

    const result = await uploadFile(fd, 'payment_receipt')
    expect(result.file_url).toBe('https://example.com/signed-url')
  })

  it('accepts valid PNG files', async () => {
    const file = createMockFile('receipt.png', 'image/png', 1024)
    const fd = formDataFromFile(file)

    const result = await uploadFile(fd, 'payment_receipt')
    expect(result.file_url).toBe('https://example.com/signed-url')
  })

  it('accepts valid PDF files', async () => {
    const file = createMockFile('receipt.pdf', 'application/pdf', 1024)
    const fd = formDataFromFile(file)

    const result = await uploadFile(fd, 'payment_receipt')
    expect(result.file_url).toBe('https://example.com/signed-url')
  })

  it('rejects files with .exe extension even with valid MIME type', async () => {
    const file = createMockFile('receipt.exe', 'image/jpeg', 1024)
    const fd = formDataFromFile(file)

    await expect(uploadFile(fd, 'payment_receipt')).rejects.toThrow(ERR.UPLOAD_INVALID_TYPE)
  })

  it('throws error when no file is provided', async () => {
    const emptyFd = new FormData()

    await expect(uploadFile(emptyFd, 'payment_receipt')).rejects.toThrow(ERR.UPLOAD_NO_FILE)
  })

  it('throws error when user is not authenticated', async () => {
    ;(mockGetUser as jest.Mock).mockResolvedValueOnce({ data: { user: null } })
    const file = createMockFile('receipt.jpg', 'image/jpeg', 1024)
    const fd = formDataFromFile(file)

    await expect(uploadFile(fd, 'payment_receipt')).rejects.toThrow('Not authenticated')
  })
})

describe('uploadFile — storage and DB recording', () => {
  it('uploads to correct bucket and creates DB record', async () => {
    const file = createMockFile('receipt.jpg', 'image/jpeg', 1024)
    const fd = formDataFromFile(file)

    const result = await uploadFile(fd, 'payment_receipt')

    expect(mockStorageUpload).toHaveBeenCalled()
    expect(mockCreateSignedUrl).toHaveBeenCalled()
    expect(mockUploadsInsert).toHaveBeenCalled()
    expect(result.id).toBe('upload-uuid-1')
  })

  it('throws UPLOAD_FAILED when storage upload fails', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: { message: 'Storage full' } })
    const file = createMockFile('receipt.jpg', 'image/jpeg', 1024)
    const fd = formDataFromFile(file)

    await expect(uploadFile(fd, 'payment_receipt')).rejects.toThrow(ERR.UPLOAD_FAILED)
  })

  it('throws when signed URL creation fails', async () => {
    mockCreateSignedUrl.mockResolvedValueOnce({ data: null, error: null })
    const file = createMockFile('receipt.jpg', 'image/jpeg', 1024)
    const fd = formDataFromFile(file)

    await expect(uploadFile(fd, 'payment_receipt')).rejects.toThrow(ERR.UPLOAD_URL_FAILED)
  })
})
