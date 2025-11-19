import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock de fetch global
global.fetch = vi.fn()

// Mock de URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')

// Mock de FileReader
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsDataURL: vi.fn(),
  result: 'mock-data-url',
  onload: null,
  onerror: null,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2
})) as any

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as any
global.localStorage = localStorageMock

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
} as any
global.sessionStorage = sessionStorageMock

// No es necesario mockear getContext ya que happy-dom proporciona una implementación completa
// Eliminamos el mock manual para evitar errores de tipos en CanvasRenderingContext2D

// Asegurarnos de que getContext('2d') devuelva un objeto que no sea nulo
// Esto es necesario porque happy-dom puede no implementar completamente el contexto 2D
global.HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      setTransform: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn()
    } as unknown as CanvasRenderingContext2D;
  }
  if (contextId === 'bitmaprenderer') {
    return {
      transferFromImageBitmap: vi.fn()
    } as unknown as ImageBitmapRenderingContext;
  }
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return {} as unknown as WebGLRenderingContext;
  }
  return null;
}) as any;

global.HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/jpeg;base64,mocked')
global.HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  const blob = new Blob(['mocked'], { type: 'image/jpeg' })
  callback(blob)
})

// Mock de Image para canvas
global.Image = vi.fn().mockImplementation(() => ({
  src: '',
  onload: null,
  onerror: null,
  width: 800,
  height: 600
}))



