import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ImageUploader } from '../../../components/ui/ImageUploader'
import { ImageService } from '@/services/imageService'

// Mock del hook useImageUpload
const mockUseImageUpload = vi.fn()
vi.mock('@/hooks/useImageUpload', () => ({
  useImageUpload: () => mockUseImageUpload()
}))

// Mock del ImageService
vi.mock('@/services/imageService')

describe('Integración de Subida de Imágenes', () => {
  const defaultProps = {
    onImagesSelected: vi.fn(),
    maxImages: 3,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseImageUpload.mockReturnValue([
      {
        images: [],
        existingImages: [],
        uploading: false,
        errors: [],
        totalImages: 0,
        canUpload: true,
        isValid: true
      },
      {
        addImages: vi.fn(),
        removeImage: vi.fn(),
        clearImages: vi.fn(),
        uploadImages: vi.fn()
      }
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Flujo completo de subida', () => {
    it('permite seleccionar y subir imágenes correctamente', async () => {
      const mockAddImages = vi.fn()
      const mockUploadImages = vi.fn().mockResolvedValue(['https://example.com/image1.jpg'])
      
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: false,
          errors: [],
          totalImages: 0,
          canUpload: true,
          isValid: true
        },
        {
          addImages: mockAddImages,
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: mockUploadImages
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      // Simular selección de archivo
      const fileInput = screen.getByTestId('file-input')
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      fireEvent.change(fileInput, { target: { files: [testFile] } })

      await waitFor(() => {
        expect(mockAddImages).toHaveBeenCalledWith([testFile])
      })
    })

    it('valida formato de archivo antes de subir', async () => {
      const mockAddImages = vi.fn()
      
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: false,
          errors: ['Formato no soportado'],
          totalImages: 0,
          canUpload: false,
          isValid: false
        },
        {
          addImages: mockAddImages,
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: vi.fn()
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      // Simular archivo con formato inválido
      const fileInput = screen.getByTestId('file-input')
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      
      fireEvent.change(fileInput, { target: { files: [invalidFile] } })

      await waitFor(() => {
        expect(screen.getByText('Formato no soportado')).toBeInTheDocument()
      })
    })

    it('maneja límite de imágenes correctamente', async () => {
      const mockAddImages = vi.fn()
      
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: false,
          errors: ['Demasiadas imágenes. Máximo permitido: 3'],
          totalImages: 3,
          canUpload: false,
          isValid: false
        },
        {
          addImages: mockAddImages,
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: vi.fn()
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/Demasiadas imágenes. Máximo permitido: 3/i)).toBeInTheDocument()
      expect(screen.getByTestId('image-drop-zone')).toHaveClass('opacity-50')
    })
  })

  describe('Integración con ImageService', () => {
    it('usa ImageService para validaciones', async () => {
      const mockValidateImage = vi.fn().mockResolvedValue({
        isValid: true,
        size: 1024,
        type: 'image/jpeg',
        dimensions: { width: 800, height: 600 }
      })

      ;(ImageService as any).validateImage = mockValidateImage

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      
      const result = await ImageService.validateImage(mockFile)

      expect(mockValidateImage).toHaveBeenCalledWith(mockFile)
      expect(result.isValid).toBe(true)
    })

    it('maneja errores de validación del ImageService', async () => {
      const mockValidateImage = vi.fn().mockResolvedValue({
        isValid: false,
        error: 'Archivo demasiado grande'
      })

      ;(ImageService as any).validateImage = mockValidateImage

      const mockFile = new File(['x'.repeat(6 * 1024 * 1024)], 'test.jpg', { type: 'image/jpeg' })
      
      const result = await ImageService.validateImage(mockFile)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Archivo demasiado grande')
    })
  })

  describe('Manejo de errores de red', () => {
    it('maneja fallos de conexión durante la subida', async () => {
      const mockUploadImages = vi.fn().mockRejectedValue(new Error('Network error'))
      
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: false,
          errors: ['Error de conexión al subir la imagen'],
          totalImages: 0,
          canUpload: false,
          isValid: false
        },
        {
          addImages: vi.fn(),
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: mockUploadImages
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/Error de conexión al subir la imagen/i)).toBeInTheDocument()
    })
  })

  describe('Validaciones de tamaño y formato', () => {
    it('rechaza archivos que exceden el tamaño máximo', async () => {
      const mockAddImages = vi.fn()
      
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: false,
          errors: ['El archivo es demasiado grande. Máximo permitido: 5MB'],
          totalImages: 0,
          canUpload: false,
          isValid: false
        },
        {
          addImages: mockAddImages,
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: vi.fn()
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/El archivo es demasiado grande. Máximo permitido: 5MB/i)).toBeInTheDocument()
    })

    it('rechaza formatos de archivo no soportados', async () => {
      const mockAddImages = vi.fn()
      
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: false,
          errors: ['Formato no soportado: text/plain. Formatos permitidos: image/jpeg, image/png, image/webp'],
          totalImages: 0,
          canUpload: false,
          isValid: false
        },
        {
          addImages: mockAddImages,
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: vi.fn()
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/Formato no soportado: text\/plain/i)).toBeInTheDocument()
    })
  })

  describe('Estados de carga y progreso', () => {
    it('muestra indicador de carga durante la subida', async () => {
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: true,
          errors: [],
          totalImages: 0,
          canUpload: false,
          isValid: true
        },
        {
          addImages: vi.fn(),
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: vi.fn()
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/Subiendo imágenes/i)).toBeInTheDocument()
      expect(screen.getByTestId('image-drop-zone')).toHaveClass('opacity-50')
    })

    it('actualiza progreso de subida', async () => {
      const mockUploadImages = vi.fn().mockImplementation((callback) => {
        if (callback) {
          callback(50, 1, 2) // 50% progreso, imagen 1 de 2
        }
        return Promise.resolve(['https://example.com/image1.jpg'])
      })
      
      mockUseImageUpload.mockReturnValue([
        {
          images: [],
          existingImages: [],
          uploading: true,
          uploadProgress: 50,
          errors: [],
          totalImages: 0,
          canUpload: false,
          isValid: true
        },
        {
          addImages: vi.fn(),
          removeImage: vi.fn(),
          clearImages: vi.fn(),
          uploadImages: mockUploadImages
        }
      ])

      render(<ImageUploader {...defaultProps} />)

      expect(screen.getByText(/Subiendo imágenes/i)).toBeInTheDocument()
    })
  })
})



