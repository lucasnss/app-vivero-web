// Tipos para el estado de subida de imágenes
export interface ImageUploadState {
  file: File
  preview: string
  uploading: boolean
  error?: string
  progress?: number
}

// Tipos para preview de imágenes existentes
export interface ImagePreview {
  url: string
  isMain: boolean
  order: number
  id?: string
}

// Tipos para validación de imágenes
export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

// Tipos para configuración de imágenes
export interface ImageConfig {
  maxImages: number
  maxSize: number // en bytes
  allowedFormats: string[]
  minDimensions: {
    width: number
    height: number
  }
  recommendedDimensions: {
    width: number
    height: number
  }
}

// Configuración por defecto para imágenes de productos
export const DEFAULT_IMAGE_CONFIG: ImageConfig = {
  maxImages: 3,
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  minDimensions: {
    width: 200,
    height: 200
  },
  recommendedDimensions: {
    width: 800,
    height: 800
  }
}

// Interfaz principal de Product actualizada
export interface Product {
  id: string
  name: string
  description: string
  category_id: string
  price: number
  stock: number
  image: string | null // Imagen principal (URL) - puede ser null
  images: string[] | null // Array de URLs de imágenes adicionales - puede ser null
  scientificName: string
  care: string
  characteristics: string
  origin: string
  featured?: boolean
  created_at?: string
  updated_at?: string
}

// Interfaz para crear productos con manejo de imágenes
export interface CreateProductRequest extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {
  // Campos opcionales para manejo de imágenes durante la creación
  tempImages?: ImageUploadState[]
  existingImages?: ImagePreview[]
}

// Interfaz para actualizar productos con manejo de imágenes
export interface UpdateProductRequest extends Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>> {
  // Campos opcionales para manejo de imágenes durante la actualización
  tempImages?: ImageUploadState[]
  existingImages?: ImagePreview[]
  imagesToDelete?: string[] // URLs de imágenes a eliminar
}

// Interfaz para productos con cantidad (carrito)
export interface ProductWithQuantity extends Product {
  quantity: number
  availableStock: number
}

// Interfaz para respuesta de productos con información completa de imágenes
export interface ProductWithImageDetails extends Product {
  imageDetails: {
    main: ImagePreview
    additional: ImagePreview[]
    total: number
  }
}

// Interfaz para formulario de productos con estado de imágenes
export interface ProductFormState {
  // Campos básicos del producto
  name: string
  description: string
  category_id: string
  price: number
  stock: number
  scientificName: string
  care: string
  characteristics: string
  origin: string
  featured: boolean
  
  // Estado de imágenes
  tempImages: ImageUploadState[]
  existingImages: ImagePreview[]
  imagesToDelete: string[]
  
  // Estado de validación
  imageErrors: string[]
  isUploading: boolean
  
  // Estado del formulario
  isSubmitting: boolean
  errors: Record<string, string>
}

// Interfaz para resultado de subida de imagen individual
export interface ImageUploadResult {
  success: boolean
  data?: {
    url: string
    path: string
  }
  error?: string
}

// Interfaz para respuesta de subida de imágenes múltiples
export interface ImageUploadResponse {
  success: boolean
  urls: string[]
  errors: string[]
  uploadedCount: number
  totalCount: number
}

// Interfaz para operaciones de imágenes
export interface ImageOperation {
  type: 'upload' | 'delete' | 'reorder' | 'setMain'
  productId: string
  imageUrl?: string
  newOrder?: string[]
  files?: File[]
} 