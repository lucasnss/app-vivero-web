export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  slug: string
  parent_id?: string
  image?: string
  featured?: boolean
}

export interface CreateCategoryRequest extends Omit<Category, 'id'> {
  // Para crear categorías sin ID (se genera automáticamente)
}

export interface UpdateCategoryRequest extends Partial<Omit<Category, 'id'>> {
  // Para actualizar categorías (todos los campos opcionales excepto id)
} 