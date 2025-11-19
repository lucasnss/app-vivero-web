import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ImagePreview from '../../../../components/ui/ImagePreview'

describe('ImagePreview', () => {
  const defaultProps = {
    image: {
      url: 'https://example.com/test-image.jpg',
      isMain: false,
      order: 1
    },
    onRemove: vi.fn(),
    onSetMain: vi.fn(),
    onReorder: vi.fn(),
    isDeleting: false,
    canDelete: true,
    canSetMain: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente con imagen', () => {
    render(<ImagePreview {...defaultProps} />)
    
    const image = screen.getByAltText('Preview de imagen')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg')
  })

  it('muestra indicador de imagen principal cuando isMain es true', () => {
    const propsWithMain = {
      ...defaultProps,
      image: { ...defaultProps.image, isMain: true }
    }
    
    render(<ImagePreview {...propsWithMain} />)
    
    expect(screen.getByText(/Imagen principal/i)).toBeInTheDocument()
  })

  it('muestra botón de eliminar cuando canDelete es true', () => {
    render(<ImagePreview {...defaultProps} />)
    
    const deleteButton = screen.getByTestId('delete-image-button')
    expect(deleteButton).toBeInTheDocument()
  })

  it('oculta botón de eliminar cuando canDelete es false', () => {
    const propsWithoutDelete = {
      ...defaultProps,
      canDelete: false
    }
    
    render(<ImagePreview {...propsWithoutDelete} />)
    
    expect(screen.queryByTestId('delete-image-button')).not.toBeInTheDocument()
  })

  it('muestra botón de establecer como principal cuando canSetMain es true y no es principal', () => {
    render(<ImagePreview {...defaultProps} />)
    
    const setMainButton = screen.getByTestId('set-main-button')
    expect(setMainButton).toBeInTheDocument()
    expect(setMainButton).toHaveTextContent(/Establecer como principal/i)
  })

  it('oculta botón de establecer como principal cuando ya es la imagen principal', () => {
    const propsWithMain = {
      ...defaultProps,
      image: { ...defaultProps.image, isMain: true }
    }
    
    render(<ImagePreview {...propsWithMain} />)
    
    expect(screen.queryByTestId('set-main-button')).not.toBeInTheDocument()
  })

  it('llama a onRemove cuando se hace clic en eliminar', () => {
    render(<ImagePreview {...defaultProps} />)
    
    const deleteButton = screen.getByTestId('delete-image-button')
    fireEvent.click(deleteButton)
    
    expect(defaultProps.onRemove).toHaveBeenCalledWith('https://example.com/test-image.jpg')
  })

  it('llama a onSetMain cuando se hace clic en establecer como principal', () => {
    render(<ImagePreview {...defaultProps} />)
    
    const setMainButton = screen.getByTestId('set-main-button')
    fireEvent.click(setMainButton)
    
    expect(defaultProps.onSetMain).toHaveBeenCalledWith('https://example.com/test-image.jpg')
  })

  it('muestra estado de carga cuando isDeleting es true', () => {
    const propsWithDeleting = {
      ...defaultProps,
      isDeleting: true
    }
    
    render(<ImagePreview {...propsWithDeleting} />)
    
    expect(screen.getByText(/Eliminando/i)).toBeInTheDocument()
  })

  it('deshabilita botones cuando isDeleting es true', () => {
    const propsWithDeleting = {
      ...defaultProps,
      isDeleting: true
    }
    
    render(<ImagePreview {...propsWithDeleting} />)
    
    const deleteButton = screen.getByTestId('delete-image-button')
    const setMainButton = screen.getByTestId('set-main-button')
    
    expect(deleteButton).toBeDisabled()
    expect(setMainButton).toBeDisabled()
  })

  it('muestra orden de la imagen correctamente', () => {
    render(<ImagePreview {...defaultProps} />)
    
    expect(screen.getByText(/Orden: 1/i)).toBeInTheDocument()
  })

  it('aplica estilos correctos para imagen principal', () => {
    const propsWithMain = {
      ...defaultProps,
      image: { ...defaultProps.image, isMain: true }
    }
    
    render(<ImagePreview {...propsWithMain} />)
    
    const container = screen.getByTestId('image-preview-container')
    expect(container).toHaveClass('border-primary')
  })

  it('aplica estilos correctos para imagen no principal', () => {
    render(<ImagePreview {...defaultProps} />)
    
    const container = screen.getByTestId('image-preview-container')
    expect(container).toHaveClass('border-gray-200')
  })
})

