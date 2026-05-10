import { createGalleryItem, getGalleryItems, updateGalleryItem, deleteGalleryItem } from '@/app/actions/gallery'

const mockGetUser = jest.fn()
const mockStorageUpload = jest.fn()
const mockStorageRemove = jest.fn()
const mockGetPublicUrl = jest.fn()

function makeGalleryQuery(result: any) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve(result)),
        single: jest.fn(() => Promise.resolve(result)),
      })),
      single: jest.fn(() => Promise.resolve(result)),
      order: jest.fn(() => Promise.resolve(result)),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve(result)),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve(result)),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    })),
  }
}

let galleryQueryResult: any = { data: [], error: null }

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: jest.fn(() => makeGalleryQuery(galleryQueryResult)),
    })
  ),
  createAdminClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: mockStorageUpload,
        remove: mockStorageRemove,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
    from: jest.fn(() => makeGalleryQuery(galleryQueryResult)),
  })),
}))

const validFile = new File(['fake-image-content'], 'test-artwork.jpg', { type: 'image/jpeg' })

function buildFormData(file: File | null, overrides: Record<string, any> = {}) {
  const fd = new FormData()
  if (file) fd.append('file', file)
  fd.append('meta', JSON.stringify({
    title: 'Test Artwork',
    medium: 'Oil on Canvas',
    size: '16x20 in',
    year: 2024,
    category: 'portrait',
    description: 'A beautiful painting',
    featured: false,
    ...overrides,
  }))
  return fd
}

const mockCreatedRow = {
  id: 'gallery-uuid-1',
  title: 'Test Artwork',
  medium: 'Oil on Canvas',
  size: '16x20 in',
  year: 2024,
  category: 'portrait',
  image_url: 'https://example.supabase.co/storage/v1/object/public/gallery-images/gallery/test.jpg',
  storage_path: 'gallery/test.jpg',
  description: 'A beautiful painting',
  featured: false,
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'admin-uuid' } } })
  mockStorageUpload.mockResolvedValue({ error: null })
  mockStorageRemove.mockResolvedValue({ error: null })
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: mockCreatedRow.image_url } })
  galleryQueryResult = { data: mockCreatedRow, error: null }
})

describe('createGalleryItem', () => {
  it('uploads a valid artwork successfully', async () => {
    const result = await createGalleryItem(buildFormData(validFile))
    expect(result.title).toBe('Test Artwork')
    expect(result.image_url).toBe(mockCreatedRow.image_url)
    expect(mockStorageUpload).toHaveBeenCalledTimes(1)
  })

  it('rejects when no file is provided', async () => {
    await expect(createGalleryItem(buildFormData(null))).rejects.toThrow('No image provided')
  })

  it('rejects unsupported file extensions', async () => {
    const badFile = new File(['x'], 'malware.exe', { type: 'application/x-msdownload' })
    await expect(createGalleryItem(buildFormData(badFile))).rejects.toThrow('Unsupported file type')
  })

  it('rejects files that are too large', async () => {
    const bigFile = new File(['x'.repeat(11 * 1024 * 1024)], 'huge.jpg', { type: 'image/jpeg' })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
    await expect(createGalleryItem(buildFormData(bigFile))).rejects.toThrow('File is too large')
  })

  it('rejects when title is missing', async () => {
    await expect(createGalleryItem(buildFormData(validFile, { title: '' }))).rejects.toThrow('Title is required.')
  })

  it('rejects when category is missing', async () => {
    await expect(createGalleryItem(buildFormData(validFile, { category: '' }))).rejects.toThrow('Category is required.')
  })

  it('handles storage upload failure', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: { message: 'Bucket not found' } })
    await expect(createGalleryItem(buildFormData(validFile))).rejects.toThrow('File upload failed')
  })

  it('handles DB insert failure and cleans up storage', async () => {
    galleryQueryResult = { data: null, error: { message: 'insert error' } }
    await expect(createGalleryItem(buildFormData(validFile))).rejects.toThrow('Failed to save gallery item')
    expect(mockStorageRemove).toHaveBeenCalled()
  })

  it('throws when user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(createGalleryItem(buildFormData(validFile))).rejects.toThrow('Not authenticated')
  })
})

describe('getGalleryItems', () => {
  it('returns gallery items', async () => {
    galleryQueryResult = { data: [mockCreatedRow], error: null }
    const items = await getGalleryItems()
    expect(items).toHaveLength(1)
    expect(items[0].title).toBe('Test Artwork')
  })
})

describe('updateGalleryItem', () => {
  it('updates item metadata', async () => {
    const updated = { ...mockCreatedRow, title: 'Updated Title' }
    galleryQueryResult = { data: updated, error: null }
    const result = await updateGalleryItem('gallery-uuid-1', { title: 'Updated Title' })
    expect(result.title).toBe('Updated Title')
  })
})

describe('deleteGalleryItem', () => {
  it('deletes item and cleans up storage', async () => {
    galleryQueryResult = { data: mockCreatedRow, error: null }
    await expect(deleteGalleryItem('gallery-uuid-1')).resolves.toBeUndefined()
    expect(mockStorageRemove).toHaveBeenCalledWith([mockCreatedRow.storage_path])
  })
})
