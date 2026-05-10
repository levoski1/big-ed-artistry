import { uploadFile, linkUploadToOrderItem, getUploadsByOrder, getAdminUploadsForOrder } from '@/app/actions/uploads'
import { ERR } from '@/lib/errorMessages'

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

// --- jest.fn() mocks for createClient paths (captured by closure in mock factory) ---
const mockGetUser = jest.fn()
const mockStorageUpload = jest.fn()
const mockCreateSignedUrl = jest.fn()
const mockUploadsInsert = jest.fn()
const mockUploadUpdate = jest.fn()

// --- Query result holders (re-assigned per test) ---
type QueryResult = { data: any[]; error: null }

let orderItemsResult: QueryResult = { data: [], error: null }
let uploadsResult: QueryResult = { data: [], error: null }
let paymentsResult: QueryResult = { data: [], error: null }

// --- Query-builder helpers (capture the let variables by closure) ---
function buildOrderItemsQuery() {
  return {
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve(orderItemsResult),
      }),
    }),
  }
}

function buildUploadsQuery() {
  return {
    select: () => ({
      in: () => ({
        order: () => Promise.resolve(uploadsResult),
      }),
    }),
  }
}

function buildPaymentsQuery() {
  return {
    select: () => ({
      eq: () => ({
        order: () => Promise.resolve(paymentsResult),
      }),
    }),
  }
}

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
        if (table === 'uploads') return { insert: mockUploadsInsert, update: () => ({ eq: mockUploadUpdate }) }
        if (table === 'order_items') return { select: () => buildOrderItemsQuery().select() }
        return {}
      }),
    })
  ),
  createAdminClient: jest.fn(() => ({
    from: jest.fn((table: string) => {
      if (table === 'order_items') return buildOrderItemsQuery()
      if (table === 'uploads') return buildUploadsQuery()
      if (table === 'payments') return buildPaymentsQuery()
      return { select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }) }
    }),
  })),
}))

const validFormData = (name: string, type: string, size: number) => {
  const fd = new FormData()
  fd.append('file', new File(['test'], name, { type }))
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
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-uuid-1' } } })
  mockStorageUpload.mockResolvedValue({ error: null })
  mockCreateSignedUrl.mockResolvedValue({ data: { signedUrl: 'https://example.com/signed-url' }, error: null })
  mockUploadsInsert.mockReturnValue({
    select: jest.fn(() => ({
      single: jest.fn(() => Promise.resolve({ data: mockUploadRow, error: null })),
    })),
  })
  mockUploadUpdate.mockResolvedValue({ error: null })
  orderItemsResult = { data: [{ id: 'item-1' }], error: null }
  uploadsResult = { data: [], error: null }
  paymentsResult = { data: [], error: null }
})

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

describe('linkUploadToOrderItem', () => {
  it('links a single upload to an order item', async () => {
    await expect(linkUploadToOrderItem('upload-id-1', 'item-id-1')).resolves.toBeUndefined()
  })

  it('supports linking multiple uploads to their respective items', async () => {
    await linkUploadToOrderItem('upload-id-1', 'item-id-1')
    await linkUploadToOrderItem('upload-id-2', 'item-id-2')
    await linkUploadToOrderItem('upload-id-3', 'item-id-3')
    expect(mockUploadUpdate).toHaveBeenCalledTimes(3)
  })

  it('throws when update fails', async () => {
    mockUploadUpdate.mockResolvedValueOnce({ error: { message: 'DB error' } })
    await expect(linkUploadToOrderItem('upload-id-1', 'item-id-1')).rejects.toThrow('Failed to link upload to order item')
  })
})

describe('getUploadsByOrder', () => {
  it('returns empty array when no items found', async () => {
    orderItemsResult = { data: [], error: null }
    const result = await getUploadsByOrder('order-1')
    expect(result).toEqual([])
  })

  it('returns empty array when user not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } } as any)
    const result = await getUploadsByOrder('order-1')
    expect(result).toEqual([])
  })
})

describe('getAdminUploadsForOrder', () => {
  const mockOrderItems = [
    { id: 'item-1', item_type: 'artwork' as const, artwork_type: 'custom_artwork' as const, item_subtotal: 25000, size_label: '12x16', canvas_option: 'Normal', frame_option: null, glass_option: null, base_price: 20000, canvas_price: 5000, frame_price: 0, glass_price: 0, quantity: 1, created_at: '2024-01-15', order_id: 'order-1', product_id: null, width_inches: null, height_inches: null, area_sqin: null, write_up_type: null, write_up_content: null },
    { id: 'item-2', item_type: 'artwork' as const, artwork_type: 'photo_enlargement' as const, item_subtotal: 15000, size_label: '8x10', canvas_option: null, frame_option: null, glass_option: null, base_price: 15000, canvas_price: 0, frame_price: 0, glass_price: 0, quantity: 1, created_at: '2024-01-15', order_id: 'order-1', product_id: null, width_inches: null, height_inches: null, area_sqin: null, write_up_type: null, write_up_content: null },
  ]
  const mockUploadsItem1 = [
    { id: 'up-1', user_id: 'u1', order_item_id: 'item-1', file_name: 'ref1.jpg', storage_path: 'u1/ref1.jpg', file_url: 'https://example.com/ref1', file_type: 'artwork_reference', file_size: 1024, created_at: '2024-01-15' },
    { id: 'up-2', user_id: 'u1', order_item_id: 'item-1', file_name: 'ref2.jpg', storage_path: 'u1/ref2.jpg', file_url: 'https://example.com/ref2', file_type: 'artwork_reference', file_size: 2048, created_at: '2024-01-15' },
  ]
  const mockUploadsItem2 = [
    { id: 'up-3', user_id: 'u1', order_item_id: 'item-2', file_name: 'enlarge.jpg', storage_path: 'u1/enlarge.jpg', file_url: 'https://example.com/enlarge', file_type: 'artwork_reference', file_size: 1024, created_at: '2024-01-15' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-uuid-1' } } })
    orderItemsResult = { data: mockOrderItems, error: null }
    uploadsResult = { data: [...mockUploadsItem1, ...mockUploadsItem2], error: null }
    paymentsResult = { data: [], error: null }
  })

  it('groups uploads by order item', async () => {
    const result = await getAdminUploadsForOrder('order-1')
    expect(result.items).toHaveLength(2)
    expect(result.items[0].uploads).toHaveLength(2)
    expect(result.items[1].uploads).toHaveLength(1)
  })

  it('maps each upload to the correct order item', async () => {
    const result = await getAdminUploadsForOrder('order-1')
    expect(result.items[0].uploads[0].id).toBe('up-1')
    expect(result.items[0].uploads[1].id).toBe('up-2')
    expect(result.items[1].uploads[0].id).toBe('up-3')
  })

  it('returns empty uploads array for items without uploads', async () => {
    uploadsResult = { data: [], error: null }
    const result = await getAdminUploadsForOrder('order-1')
    expect(result.items[0].uploads).toEqual([])
    expect(result.items[1].uploads).toEqual([])
  })

  it('returns empty items for empty orders', async () => {
    orderItemsResult = { data: [], error: null }
    const result = await getAdminUploadsForOrder('order-1')
    expect(result.items).toEqual([])
    expect(result.paymentReceipts).toEqual([])
  })

  it('includes payment receipts when available', async () => {
    const mockPayments = [
      { id: 'pay-1', order_id: 'order-1', user_id: 'u1', amount: 25000, payment_type: 'partial', receipt_url: 'https://example.com/receipt1', status: 'verified', verified_by: null, verified_at: null, rejection_reason: null, created_at: '2024-01-15' },
    ]
    paymentsResult = { data: mockPayments, error: null }
    const result = await getAdminUploadsForOrder('order-1')
    expect(result.paymentReceipts).toHaveLength(1)
    expect(result.paymentReceipts[0].receipt_url).toBe('https://example.com/receipt1')
  })
})
