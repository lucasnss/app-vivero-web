import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ImageGallery from '../../../../components/ui/ImageGallery'

describe('ImageGallery', () => {
  const mockImages = [
    { url: 'https://example.com/image1.jpg', isMain: true, order: 0 },
    { url: 'https://example.com/image2.jpg', isMain: false, order: 1 },
    { url: 'https://example.com/image3.jpg', isMain: false, order: 2 }
  ]

  const defaultProps = {
    images: mockImages,
    currentIndex: 0,
    onNavigate: vi.fn(),
    onClose: vi.fn(),
    showNavigation: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente con imágenes', () => {
    render(<ImageGallery {...defaultProps} />)
    
    const currentImage = screen.getByAltText('Imagen de la galería')
    expect(currentImage).toBeInTheDocument()
    expect(currentImage).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })

  it('muestra contador de imágenes correctamente', () => {
    render(<ImageGallery {...defaultProps} />)
    
    expect(screen.getByText(/1 de 3/i)).toBeInTheDocument()
  })

  it('muestra botones de navegación cuando showNavigation es true', () => {
    render(<ImageGallery {...defaultProps} />)
    
    expect(screen.getByTestId('prev-button')).toBeInTheDocument()
    expect(screen.getByTestId('next-button')).toBeInTheDocument()
  })

  it('oculta botones de navegación cuando showNavigation es false', () => {
    const propsWithoutNavigation = {
      ...defaultProps,
      showNavigation: false
    }
    
    render(<ImageGallery {...propsWithoutNavigation} />)
    
    expect(screen.queryByTestId('prev-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('next-button')).not.toBeInTheDocument()
  })

  it('deshabilita botón anterior en la primera imagen', () => {
    render(<ImageGallery {...defaultProps} />)
    
    const prevButton = screen.getByTestId('prev-button')
    expect(prevButton).toBeDisabled()
  })

  it('deshabilita botón siguiente en la última imagen', () => {
    const propsWithLastImage = {
      ...defaultProps,
      currentIndex: 2
    }
    
    render(<ImageGallery {...propsWithLastImage} />)
    
    const nextButton = screen.getByTestId('next-button')
    expect(nextButton).toBeDisabled()
  })

  it('llama a onNavigate con índice anterior cuando se hace clic en prev', () => {
    const propsWithSecondImage = {
      ...defaultProps,
      currentIndex: 1
    }
    
    render(<ImageGallery {...propsWithSecondImage} />)
    
    const prevButton = screen.getByTestId('prev-button')
    fireEvent.click(prevButton)
    
    expect(defaultProps.onNavigate).toHaveBeenCalledWith(0)
  })

  it('llama a onNavigate con índice siguiente cuando se hace clic en next', () => {
    render(<ImageGallery {...defaultProps} />)
    
    const nextButton = screen.getByTestId('next-button')
    fireEvent.click(nextButton)
    
    expect(defaultProps.onNavigate).toHaveBeenCalledWith(1)
  })

  it('llama a onClose cuando se hace clic en el botón de cerrar', () => {
    render(<ImageGallery {...defaultProps} />)
    
    const closeButton = screen.getByTestId('close-gallery-button')
    fireEvent.click(closeButton)
    
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('muestra imagen correcta según el índice actual', () => {
    const propsWithSecondImage = {
      ...defaultProps,
      currentIndex: 1
    }
    
    render(<ImageGallery {...propsWithSecondImage} />)
    
    const currentImage = screen.getByAltText('Imagen de la galería')
    expect(currentImage).toHaveAttribute('src', 'https://example.com/image2.jpg')
    expect(screen.getByText(/2 de 3/i)).toBeInTheDocument()
  })

  it('aplica estilos correctos para botones habilitados/deshabilitados', () => {
    render(<ImageGallery {...defaultProps} />)
    
    const prevButton = screen.getByTestId('prev-button')
    const nextButton = screen.getByTestId('next-button')
    
    expect(prevButton).toHaveClass('opacity-50')
    expect(nextButton).not.toHaveClass('opacity-50')
  })

  it('maneja navegación con teclado', () => {
    render(<ImageGallery {...defaultProps} />)
    
    // Simular tecla Arrow Right
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(defaultProps.onNavigate).toHaveBeenCalledWith(1)
    
    // Simular tecla Arrow Left
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    expect(defaultProps.onNavigate).toHaveBeenCalledWith(-1)
    
    // Simular tecla Escape
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('muestra mensaje cuando no hay imágenes', () => {
    const propsWithoutImages = {
      ...defaultProps,
      images: []
    }
    
    render(<ImageGallery {...propsWithoutImages} />)
    
    expect(screen.getByText(/No hay imágenes para mostrar/i)).toBeInTheDocument()
  })

  it('aplica zoom al hacer clic en la imagen', () => {
    render(<ImageGallery {...defaultProps} />)
    
    const currentImage = screen.getByAltText('Imagen de la galería')
    fireEvent.click(currentImage)
    
    expect(currentImage).toHaveClass('cursor-zoom-out')
  })
})



