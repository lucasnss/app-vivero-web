import { Category } from '@/types/category'

// Funciones para interactuar con la API
const API_BASE = '/api/categories'

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(API_BASE)
    if (!response.ok) {
      throw new Error('Error al obtener categorías')
    }
    
    const result = await response.json()
    
    // Manejar el nuevo formato de respuesta
    if (result && typeof result === 'object') {
      // Si es el nuevo formato con success y data
      if ('success' in result && 'data' in result) {
        return Array.isArray(result.data) ? result.data : []
      }
      // Si es un array directo (formato antiguo)
      if (Array.isArray(result)) {
        return result
      }
    }
    
    console.error('Formato de respuesta inválido:', result)
    return []
  } catch (error) {
    console.error('Error en getAllCategories:', error)
    throw new Error('Error al obtener categorías')
  }
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  try {
    const response = await fetch(`${API_BASE}?id=${id}`)
    if (!response.ok) {
      return undefined
    }
    
    const result = await response.json()
    
    // Manejar el nuevo formato de respuesta
    if (result && typeof result === 'object') {
      // Si es el nuevo formato con success y data
      if ('success' in result && 'data' in result) {
        return result.data
      }
      // Si es un objeto directo (formato antiguo)
      if ('id' in result) {
        return result as Category
      }
    }
    
    return undefined
  } catch (error) {
    console.error('Error en getCategoryById:', error)
    return undefined
  }
} 