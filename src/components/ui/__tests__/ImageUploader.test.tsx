import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import ImageUploader from '../../../../components/ui/ImageUploader'

// Mock del hook useImageUpload
const mockUseImageUpload = vi.fn()
vi.mock('@/hooks/useImageUpload', () => ({
  useImageUpload: () => mockUseImageUpload()
}))

describe('ImageUploader', () => {
  const defaultProps = {
    onImagesSelected: vi.fn(),
    maxImages: 3,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024 // 5MB
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

  it('renderiza correctamente con estado inicial', () => {
    render(<ImageUploader {...defaultProps} />)
    
    expect(screen.getByText(/Arrastra imágenes aquí/i)).toBeInTheDocument()
    expect(screen.getByText(/o haz clic para seleccionar/i)).toBeInTheDocument()
    expect(screen.getByText(/Máximo 3 imágenes/i)).toBeInTheDocument()
  })

  it('muestra mensaje de arrastrar y soltar', () => {
    render(<ImageUploader {...defaultProps} />)
    
    const dropZone = screen.getByTestId('image-drop-zone')
    expect(dropZone).toHaveAttribute('data-testid', 'image-drop-zone')
  })

  it('permite seleccionar archivos al hacer clic', () => {
    const mockAddImages = vi.fn()
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
        uploadImages: vi.fn()
      }
    ])

    render(<ImageUploader {...defaultProps} />)
    
    const fileInput = screen.getByTestId('file-input')
    expect(fileInput).toBeInTheDocument()
  })

  it('muestra estado de carga cuando se están subiendo imágenes', () => {
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
  })

  it('muestra errores cuando hay problemas de validación', () => {
    const mockErrors = ['Archivo demasiado grande', 'Formato no soportado']
    mockUseImageUpload.mockReturnValue([
      {
        images: [],
        existingImages: [],
        uploading: false,
        errors: mockErrors,
        totalImages: 0,
        canUpload: false,
        isValid: false
      },
      {
        addImages: vi.fn(),
        removeImage: vi.fn(),
        clearImages: vi.fn(),
        uploadImages: vi.fn()
      }
    ])

    render(<ImageUploader {...defaultProps} />)
    
    expect(screen.getByText('Archivo demasiado grande')).toBeInTheDocument()
    expect(screen.getByText('Formato no soportado')).toBeInTheDocument()
  })

  it('muestra contador de imágenes correctamente', () => {
    mockUseImageUpload.mockReturnValue([
      {
        images: [],
        existingImages: [],
        uploading: false,
        errors: [],
        totalImages: 2,
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

    render(<ImageUploader {...defaultProps} />)
    
    expect(screen.getByText(/2 de 3 imágenes/i)).toBeInTheDocument()
  })

  it('deshabilita la zona de drop cuando no se pueden subir más imágenes', () => {
    mockUseImageUpload.mockReturnValue([
      {
        images: [],
        existingImages: [],
        uploading: false,
        errors: [],
        totalImages: 3,
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
    
    const dropZone = screen.getByTestId('image-drop-zone')
    expect(dropZone).toHaveClass('opacity-50')
  })
})

