import { Category } from '@/types/category'

// Producto parseado desde Excel con nombre de categoría (string)
export interface ParsedExcelProduct {
  name: string
  description?: string
  categoryName: string // Nombre de la categoría del Excel
  price: number
  stock?: number
  scientificName?: string
  care?: string
  characteristics?: string
  origin?: string
  image?: string
  images?: string[]
  featured?: boolean
  rowNumber: number // Número de fila en el Excel para referencia
}

// Resultado del fuzzy matching de categoría
export interface CategoryMatchResult {
  exactMatch: Category | null
  suggestions: CategorySuggestion[]
  hasMatch: boolean
}

// Sugerencia de categoría con porcentaje de similitud
export interface CategorySuggestion {
  category: Category
  similarity: number // Porcentaje de similitud (0-100)
}

// Producto con error de categoría
export interface ProductWithCategoryError {
  rowNumber: number
  productName: string
  categoryNameProvided: string
  suggestions: CategorySuggestion[]
  originalProduct: ParsedExcelProduct
}

// Producto válido listo para bulk insert
export interface ValidProductForBulk {
  name: string
  description: string
  category_id: string // UUID resuelto
  price: number
  stock: number
  scientificName: string
  care: string
  characteristics: string
  origin: string
  image: string
  images: string[]
  featured: boolean
}

// Resultado del procesamiento del Excel
export interface ExcelProcessingResult {
  validProducts: ValidProductForBulk[]
  productsWithErrors: ProductWithCategoryError[]
  totalRows: number
}

// Corrección de categoría realizada por el usuario
export interface CategoryCorrection {
  rowNumber: number
  selectedCategoryId: string
}

