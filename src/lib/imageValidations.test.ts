import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  validateImageFormat,
  validateImageSize,
  validateImageDimensions,
  generateImagePreview,
  isImageFile,
  formatFileSize,
  getFileExtension
} from './imageValidations'

// Mock de File para testing
const createMockFile = (name: string, type: string, size: number): File => {
  const file = new File([''], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

// Mock de Image para testing
const mockImage = {
  width: 800,
  height: 600,
  onload: null as any,
  onerror: null as any,
  src: ''
}

// Mock de URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')

// Mock de FileReader
// Crear un mock completo de FileReader
const mockFileReaderPrototype = {
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
  
  // Métodos
  readAsDataURL: vi.fn(function(this: any, _file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,mock-data';
      if (this.onload) this.onload({ target: this });
    }, 0);
  }),
  readAsArrayBuffer: vi.fn(),
  readAsBinaryString: vi.fn(),
  readAsText: vi.fn(),
  abort: vi.fn(),
  
  // Propiedades
  result: null as string | ArrayBuffer | null,
  error: null,
  readyState: 0,
  
  // Eventos
  onabort: null,
  onerror: null,
  onload: null,
  onloadstart: null,
  onloadend: null,
  onprogress: null,
}

// Crear un constructor mock
function MockFileReader(this: any) {
  Object.assign(this, mockFileReaderPrototype);
}
MockFileReader.prototype = mockFileReaderPrototype;

// Definir propiedades estáticas
MockFileReader.EMPTY = 0;
MockFileReader.LOADING = 1;
MockFileReader.DONE = 2;

// Reemplazar el constructor global
global.FileReader = MockFileReader as any;

describe('imageValidations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateImageFormat', () => {
    it('should validate correct image formats', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg', 1024)
      const pngFile = createMockFile('test.png', 'image/png', 1024)
      const webpFile = createMockFile('test.webp', 'image/webp', 1024)

      expect(validateImageFormat(jpegFile).isValid).toBe(true)
      expect(validateImageFormat(pngFile).isValid).toBe(true)
      expect(validateImageFormat(webpFile).isValid).toBe(true)
    })

    it('should reject invalid formats', () => {
      const textFile = createMockFile('test.txt', 'text/plain', 1024)
      const pdfFile = createMockFile('test.pdf', 'application/pdf', 1024)

      expect(validateImageFormat(textFile).isValid).toBe(false)
      expect(validateImageFormat(pdfFile).isValid).toBe(false)
    })

    it('should handle null file', () => {
      const result = validateImageFormat(null as any)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('No se proporcionó ningún archivo')
    })
  })

  describe('validateImageSize', () => {
    it('should validate files within size limit', () => {
      const smallFile = createMockFile('small.jpg', 'image/jpeg', 1024 * 1024) // 1MB
      const result = validateImageSize(smallFile, 5 * 1024 * 1024) // 5MB limit
      expect(result.isValid).toBe(true)
    })

    it('should reject files exceeding size limit', () => {
      const largeFile = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024) // 10MB
      const result = validateImageSize(largeFile, 5 * 1024 * 1024) // 5MB limit
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('demasiado grande')
    })

    it('should show warning for large files near limit', () => {
      const nearLimitFile = createMockFile('near.jpg', 'image/jpeg', 4.5 * 1024 * 1024) // 4.5MB
      const result = validateImageSize(nearLimitFile, 5 * 1024 * 1024) // 5MB limit
      expect(result.isValid).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
      expect(result.warnings?.length).toBeGreaterThan(0)
      expect(result.warnings?.[0]).toMatch(/grande/i)
    })
  })

  describe('validateImageDimensions', () => {
    it('should validate images with sufficient dimensions', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024)
      
      // Mock Image constructor
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          ...mockImage,
          src: '',
          width: 800,
          height: 600,
          onload: null as any,
          onerror: null as any
        };
        
        // Disparar onload inmediatamente en lugar de usar setTimeout
        queueMicrotask(() => {
          if (img.onload) img.onload();
        });
        
        return img;
      })

      const result = await validateImageDimensions(mockFile, 200, 200)
      expect(result.isValid).toBe(true)
    })

    it('should reject images with insufficient dimensions', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024)
      
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          ...mockImage,
          src: '',
          width: 100,
          height: 100,
          onload: null as any,
          onerror: null as any
        };
        
        // Disparar onload inmediatamente en lugar de usar setTimeout
        queueMicrotask(() => {
          if (img.onload) img.onload();
        });
        
        return img;
      })

      const result = await validateImageDimensions(mockFile, 200, 200)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('insuficientes')
    })
  })

  describe('generateImagePreview', () => {
    it('should generate preview URL for valid image', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024)
      
      // Mock para canvas y su contexto
      const mockContext = {
        drawImage: vi.fn()
      }
      
      const mockCanvas = {
        getContext: vi.fn(() => mockContext),
        width: 0,
        height: 0,
        toDataURL: vi.fn(() => 'data:image/jpeg;base64,mocked')
      }
      
      // Mock de document.createElement para devolver nuestro canvas
      global.document.createElement = vi.fn((tag: string) => {
        if (tag === 'canvas') return mockCanvas as any
        return document.createElement(tag)
      })
      
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          ...mockImage,
          src: '',
          width: 800,
          height: 600,
          onload: null as any,
          onerror: null as any
        };
        
        // Disparar onload inmediatamente en lugar de usar setTimeout
        queueMicrotask(() => {
          if (img.onload) img.onload();
        });
        
        return img;
      })

      const preview = await generateImagePreview(mockFile)
      expect(preview).toBe('data:image/jpeg;base64,mocked')
    })

    it('should handle image load error', async () => {
      const mockFile = createMockFile('test.jpg', 'image/jpeg', 1024)
      
      // Mockear Image para simular error
      global.Image = vi.fn().mockImplementation(() => {
        const img = {
          ...mockImage,
          src: '',
          width: 0,
          height: 0,
          onload: null as any,
          onerror: null as any
        };
        
        // Disparar onerror inmediatamente en lugar de usar setTimeout
        queueMicrotask(() => {
          if (img.onerror) img.onerror(new Event('error'));
        });
        
        return img;
      });

      await expect(generateImagePreview(mockFile)).rejects.toThrow()
    })
  })

  describe('isImageFile', () => {
    it('should identify image files correctly', () => {
      const jpegFile = createMockFile('test.jpg', 'image/jpeg', 1024)
      const pngFile = createMockFile('test.png', 'image/png', 1024)
      const textFile = createMockFile('test.txt', 'text/plain', 1024)

      expect(isImageFile(jpegFile)).toBe(true)
      expect(isImageFile(pngFile)).toBe(true)
      expect(isImageFile(textFile)).toBe(false)
    })
  })

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should handle zero size', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })
  })

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('test.jpg')).toBe('.jpg')
      expect(getFileExtension('test.png')).toBe('.png')
      expect(getFileExtension('test.webp')).toBe('.webp')
      expect(getFileExtension('test')).toBe('')
      expect(getFileExtension('.hidden')).toBe('')
    })
  })
}) 