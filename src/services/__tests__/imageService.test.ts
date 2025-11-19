import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ImageService } from '../imageService'

// Mock de fetch global
global.fetch = vi.fn()

describe('ImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadImage', () => {
    it('sube una imagen exitosamente', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // ✅ Mock de validateImage para evitar timeout
      const mockValidateImage = vi.spyOn(ImageService, 'validateImage')
      mockValidateImage.mockResolvedValue({
        isValid: true,
        size: 1024,
        type: 'image/jpeg',
        dimensions: { width: 800, height: 600 }
      })
      
      // ✅ Mock corregido - coincide con la respuesta real de la API
      const mockResponse = {
        success: true,
        data: {
          url: 'https://example.com/image.jpg',
          path: 'products/test.jpg',
          publicUrl: 'https://example.com/image.jpg'
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await ImageService.uploadImage(mockFile, 'products')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith('/api/images/upload', {
        method: 'POST',
        body: expect.any(FormData)
      })
      
      // Limpiar el spy
      mockValidateImage.mockRestore()
    }, 15000) // Aumentar timeout a 15 segundos

    it('valida archivo antes de subir', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      try {
        await ImageService.uploadImage(mockFile, 'products')
        // Si llegamos aquí, el test debería fallar
        expect(true).toBe(false) // Forzar fallo si no se lanzó excepción
      } catch (error: any) {
        expect(error.message).toContain('Tipo de archivo no permitido')
        expect(global.fetch).not.toHaveBeenCalled()
      }
    })

    it('valida tamaño máximo del archivo', async () => {
      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })

      try {
        await ImageService.uploadImage(mockFile, 'products')
        // Si llegamos aquí, el test debería fallar
        expect(true).toBe(false) // Forzar fallo si no se lanzó excepción
      } catch (error: any) {
        expect(error.message).toContain('El archivo es demasiado grande')
        expect(global.fetch).not.toHaveBeenCalled()
      }
    })

    it('maneja errores de red', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      // ✅ Mock de validateImage para evitar timeout
      const mockValidateImage = vi.spyOn(ImageService, 'validateImage')
      mockValidateImage.mockResolvedValue({
        isValid: true,
        size: 1024,
        type: 'image/jpeg',
        dimensions: { width: 800, height: 600 }
      })

      // ✅ Mock de fetch para simular error de red
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      // Ahora esperamos que el error de red burbujee
      await expect(ImageService.uploadImage(mockFile, 'products')).rejects.toThrow('Network error')
      
      // Limpiar el spy
      mockValidateImage.mockRestore()
    }, 15000) // Aumentar timeout a 15 segundos
  })

  describe('deleteImage', () => {
    it('elimina imagen exitosamente', async () => {
      // ✅ Mock corregido - coincide con la respuesta real de la API
      const mockResponse = {
        success: true,
        data: {
          path: 'products/test.jpg',
          publicUrl: 'https://example.com/image.jpg',
          url: 'https://example.com/image.jpg'
        }
      }

      // Mock de doFetch para que devuelva la respuesta esperada
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await ImageService.deleteImage('https://example.com/image.jpg')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith('/api/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: 'https://example.com/image.jpg'
        })
      })
    })

    it('elimina imagen por path', async () => {
      // ✅ Mock corregido para eliminación por path
      const mockResponse = {
        success: true,
        data: {
          path: 'products/test.jpg',
          publicUrl: 'https://example.com/image.jpg',
          url: 'https://example.com/image.jpg'
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await ImageService.deleteImage('products/test.jpg')

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith('/api/images/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          path: 'products/test.jpg'
        })
      })
    })
  })

  describe('deleteMultipleImages', () => {
    it('elimina múltiples imágenes exitosamente', async () => {
      // ✅ Mock corregido para eliminación múltiple
      const mockResponse = {
        success: true,
        data: {
          deletedCount: 2,
          deletedUrls: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg'
          ]
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const result = await ImageService.deleteMultipleImages([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ])

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith('/api/images/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: [
            'https://example.com/image1.jpg',
            'https://example.com/image2.jpg'
          ]
        })
      })
    })
  })

  describe('listImages', () => {
    it('lista imágenes exitosamente', async () => {
      // ✅ Mock corregido para listado de imágenes
      const mockResponse = {
        success: true,
        data: {
          folder: 'products',
          images: [
            {
              name: 'image1.jpg',
              path: 'products/image1.jpg',
              publicUrl: 'https://example.com/image1.jpg'
            }
          ],
          total: 1
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      })

      const result = await ImageService.listImages('products', 10, 0)

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith('/api/images?folder=products&limit=10&offset=0')
    })
  })

  describe('validateImage', () => {
    it('valida imagen correctamente', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // Mock de URL.createObjectURL
      global.URL.createObjectURL = vi.fn(() => 'mock-url')
      
      // Mock de Image con disparo automático de onload
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          src: '',
          width: 800,
          height: 600,
          onload: null as any,
          onerror: null as any
        }
        
        // Disparar onload automáticamente en el siguiente tick
        setTimeout(() => {
          if (img.onload) img.onload()
        }, 0)
        
        return img
      })

      const result = await ImageService.validateImage(mockFile)

      expect(result.isValid).toBe(true)
      expect(result.size).toBe(mockFile.size)
      expect(result.dimensions).toEqual({ width: 800, height: 600 })
    })

    it('rechaza tipo de archivo no permitido', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

      try {
        await ImageService.validateImage(mockFile)
        // Si llegamos aquí, el test debería fallar
        expect(true).toBe(false) // Forzar fallo si no se lanzó excepción
      } catch (error: any) {
        expect(error.message).toContain('Tipo de archivo no permitido')
      }
    })

    it('rechaza archivo demasiado grande', async () => {
      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })

      try {
        await ImageService.validateImage(mockFile)
        // Si llegamos aquí, el test debería fallar
        expect(true).toBe(false) // Forzar fallo si no se lanzó excepción
      } catch (error: any) {
        expect(error.message).toContain('El archivo es demasiado grande')
      }
    })
  })

  describe('compressImage', () => {
    it('comprime imagen exitosamente', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // El mock de canvas ya está configurado globalmente en setup.ts

      global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,compressed')
      global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
        const blob = new Blob(['compressed'], { type: 'image/jpeg' })
        callback(blob)
      })

      // Mock de Image con disparo automático de onload
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          src: '',
          width: 800,
          height: 600,
          onload: null as any,
          onerror: null as any
        }
        
        // Disparar onload automáticamente en el siguiente tick
        setTimeout(() => {
          if (img.onload) img.onload()
        }, 0)
        
        return img
      })

      const result = await ImageService.compressImage(mockFile, 0.8)

      expect(result).toBeDefined()
      expect(result instanceof Blob).toBe(true)
    })
  })

  describe('generateThumbnail', () => {
    it('genera thumbnail exitosamente', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      // El mock de canvas ya está configurado globalmente en setup.ts

      global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,thumbnail')
      global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
        const blob = new Blob(['thumbnail'], { type: 'image/jpeg' })
        callback(blob)
      })

      // Mock de Image con disparo automático de onload
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          src: '',
          width: 800,
          height: 600,
          onload: null as any,
          onerror: null as any
        }
        
        // Disparar onload automáticamente en el siguiente tick
        setTimeout(() => {
          if (img.onload) img.onload()
        }, 0)
        
        return img
      })

      const result = await ImageService.generateThumbnail(mockFile, 150)

      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.startsWith('data:image/jpeg;base64,')).toBe(true)
    })
  })
})
