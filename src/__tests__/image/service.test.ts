import { describe, it, expect, beforeEach, vi } from 'vitest'
import ImageService, { ImageService as ImageServiceClass } from '@/services/imageService'

// Mock supabase client used inside ImageService
vi.mock('@/lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-test' } } })
      },
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: { path: 'products/mock-path.jpg' }, error: null }),
          remove: vi.fn().mockResolvedValue({ error: null }),
          list: vi.fn().mockResolvedValue({ data: [{ name: 'a.jpg' }], error: null }),
          getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/product-images/products/a.jpg' } }))
        }))
      }
    }
  }
})

// Mock log service to avoid TypeError
vi.mock('@/services/logService', () => ({
  logActivity: vi.fn()
}))

describe('ImageService (Supabase Storage)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploadImage: devuelve URL pública al subir con auth', async () => {
    const file = new File(['x'], 'test.jpg', { type: 'image/jpeg' })
    const res = await ImageService.uploadImage(file, 'products')

    expect(res.success).toBe(true)
    expect(res.data?.url).toContain('supabase.co')
    expect(res.data?.path).toContain('products/')
  })

  it('uploadImage: retorna error si no hay usuario autenticado', async () => {
    const { supabase } = await import('@/lib/supabaseClient') as any
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })

    const file = new File(['x'], 'noauth.jpg', { type: 'image/jpeg' })
    const res = await ImageService.uploadImage(file)

    expect(res.success).toBe(false)
    expect(res.error).toMatch(/Autenticación requerida/i)
  })

  it('uploadMultipleImages: mezcla éxitos y fallos', async () => {
    // Forzar que el segundo archivo falle por formato inválido en validate
    const bad = new File(['txt'], 'bad.txt', { type: 'text/plain' })
    const good = new File(['img'], 'good.jpg', { type: 'image/jpeg' })

    // Espiar validateImage para simular fallo de formato en el segundo
    const spyValidate = vi.spyOn(ImageServiceClass, 'validateImage')
    spyValidate.mockImplementation(async (file: File) => {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        return { isValid: false, error: 'Formato no es imagen' }
      }
      return { isValid: true }
    })

    const { successful, failed } = await ImageService.uploadMultipleImages([good, bad], 'products')

    expect(successful.length).toBe(1)
    expect(failed.length).toBe(1)
    expect(failed[0].fileName).toBe('bad.txt')
  })

  it('deleteImage: elimina por path directo', async () => {
    const res = await ImageService.deleteImage('products/to-delete.jpg')
    expect(res.success).toBe(true)
  })

  it('deleteImage: elimina parseando URL pública', async () => {
    const url = 'https://mock.supabase.co/storage/v1/object/public/product-images/products/a.jpg'
    const res = await ImageService.deleteImage(url)
    expect(res.success).toBe(true)
  })

  it('listImages: retorna lista de URLs públicas', async () => {
    const res = await ImageService.listImages('products')
    expect(res.success).toBe(true)
    expect(res.data?.images.length).toBeGreaterThanOrEqual(1)
  })
})


