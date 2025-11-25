import { compareTwoStrings } from 'string-similarity'
import { Category } from '@/types/category'
import { CategoryMatchResult, CategorySuggestion } from '@/types/import-types'

/**
 * Normaliza un string removiendo acentos, convirtiendo a minúsculas
 * y eliminando espacios extras
 */
export function normalizeString(str: string): string {
  if (!str) return ''
  
  return str
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno
    .trim()
}

/**
 * Encuentra una categoría por nombre usando fuzzy matching
 * 
 * Umbrales:
 * - ≥85%: Match exacto (auto-importar)
 * - 60-84%: Sugerencias (requiere confirmación del usuario)
 * - <60%: Sin match (error)
 * 
 * @param categoryName - Nombre de la categoría del Excel
 * @param allCategories - Array de todas las categorías disponibles
 * @returns Resultado del matching con categoría exacta o sugerencias
 */
export function findCategoryByName(
  categoryName: string,
  allCategories: Category[]
): CategoryMatchResult {
  if (!categoryName || !allCategories || allCategories.length === 0) {
    return {
      exactMatch: null,
      suggestions: [],
      hasMatch: false
    }
  }

  const normalizedInput = normalizeString(categoryName)
  
  // Calcular similitud con cada categoría
  const similarities: Array<{ category: Category; similarity: number }> = []
  
  for (const category of allCategories) {
    const normalizedCategoryName = normalizeString(category.name)
    const similarity = compareTwoStrings(normalizedInput, normalizedCategoryName)
    
    // Convertir a porcentaje (0-100)
    const similarityPercent = similarity * 100
    
    similarities.push({
      category,
      similarity: similarityPercent
    })
  }
  
  // Ordenar por similitud descendente
  similarities.sort((a, b) => b.similarity - a.similarity)
  
  const bestMatch = similarities[0]
  
  // Match exacto (≥85%)
  if (bestMatch && bestMatch.similarity >= 85) {
    return {
      exactMatch: bestMatch.category,
      suggestions: [],
      hasMatch: true
    }
  }
  
  // Sugerencias (60-84%)
  if (bestMatch && bestMatch.similarity >= 60) {
    // Incluir todas las categorías con similitud ≥60% como sugerencias
    const suggestions: CategorySuggestion[] = similarities
      .filter(s => s.similarity >= 60)
      .slice(0, 5) // Máximo 5 sugerencias
      .map(s => ({
        category: s.category,
        similarity: Math.round(s.similarity) // Redondear para UI
      }))
    
    return {
      exactMatch: null,
      suggestions,
      hasMatch: true
    }
  }
  
  // Sin match (<60%)
  return {
    exactMatch: null,
    suggestions: [],
    hasMatch: false
  }
}

