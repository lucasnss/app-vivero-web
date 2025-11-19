import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category'
import { logService } from './logService'
import { supabase } from '@/lib/supabaseClient'
import { 
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema
} from '@/lib/validations'

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      throw new Error('Error al obtener categorías')
    }

    // Mapear los datos de Supabase al formato de la aplicación
    return data?.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      slug: category.slug,
      parent_id: category.parent_id,
      image: category.image,
      featured: category.featured
    })) || []
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    // ✅ VALIDAR ID
    try {
      categoryIdSchema.parse(id)
    } catch (error) {
      console.error('Invalid category ID:', error)
      return undefined
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return undefined
    }

    // Mapear los datos
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      slug: data.slug,
      parent_id: data.parent_id,
      image: data.image,
      featured: data.featured
    }
  },

  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    // ✅ VALIDAR DATOS DE ENTRADA
    try {
      const validatedData = createCategorySchema.parse(categoryData)
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: validatedData.name,
          description: validatedData.description,
          icon: validatedData.icon,
          color: validatedData.color,
          slug: validatedData.slug,
          parent_id: validatedData.parent_id || null,
          image: validatedData.image || null,
          featured: validatedData.featured || false
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        throw new Error('Error al crear categoría: ' + error.message)
      }

      // Mapear respuesta
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        slug: data.slug,
        parent_id: data.parent_id,
        image: data.image,
        featured: data.featured
      }
      
      // Log de actividad
      await logService.recordActivity({
        action: 'category_created',
        entity_type: 'category',
        entity_id: newCategory.id,
        details: { category: newCategory }
      })
      
      return newCategory
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error de validación en los datos de la categoría')
    }
  },

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<Category | null> {
    // ✅ VALIDAR ID
    try {
      categoryIdSchema.parse(id)
    } catch (error) {
      console.error('Invalid category ID:', error)
      return null
    }

    // ✅ VALIDAR DATOS DE ACTUALIZACIÓN
    try {
      const validatedData = updateCategorySchema.parse(data)
      
      // Preparar datos para actualización
      const updateData: any = {}
      if (validatedData.name !== undefined) updateData.name = validatedData.name
      if (validatedData.description !== undefined) updateData.description = validatedData.description
      if (validatedData.icon !== undefined) updateData.icon = validatedData.icon
      if (validatedData.color !== undefined) updateData.color = validatedData.color
      if (validatedData.slug !== undefined) updateData.slug = validatedData.slug
      if (validatedData.parent_id !== undefined) updateData.parent_id = validatedData.parent_id
      if (validatedData.image !== undefined) updateData.image = validatedData.image
      if (validatedData.featured !== undefined) updateData.featured = validatedData.featured
      
      updateData.updated_at = new Date().toISOString()

      const { data: updatedData, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error || !updatedData) {
        console.error('Error updating category:', error)
        return null
      }
      
      // Mapear respuesta
      const updatedCategory: Category = {
        id: updatedData.id,
        name: updatedData.name,
        description: updatedData.description,
        icon: updatedData.icon,
        color: updatedData.color,
        slug: updatedData.slug,
        parent_id: updatedData.parent_id,
        image: updatedData.image,
        featured: updatedData.featured
      }
      
      // Log de actividad
      await logService.recordActivity({
        action: 'category_updated',
        entity_type: 'category',
        entity_id: id,
        details: { changes: data, category: updatedCategory }
      })
      
      return updatedCategory
    } catch (error) {
      console.error('Validation error:', error)
      return null
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    // ✅ VALIDAR ID
    try {
      categoryIdSchema.parse(id)
    } catch (error) {
      console.error('Invalid category ID:', error)
      return false
    }

    // Obtener la categoría antes de eliminarla para el log
    const category = await this.getCategoryById(id)
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return false
    }
    
    // Log de actividad
    if (category) {
      await logService.recordActivity({
        action: 'category_deleted',
        entity_type: 'category',
        entity_id: id,
        details: { category }
      })
    }
    
    return true
  },

  async getCategoriesByParent(parentId: string): Promise<Category[]> {
    // ✅ VALIDAR ID DEL PADRE
    try {
      categoryIdSchema.parse(parentId)
    } catch (error) {
      console.error('Invalid parent category ID:', error)
      return []
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories by parent:', error)
      return []
    }

    return data?.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      slug: category.slug,
      parent_id: category.parent_id,
      image: category.image,
      featured: category.featured
    })) || []
  },

  async getFeaturedCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('featured', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching featured categories:', error)
      return []
    }

    return data?.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      slug: category.slug,
      parent_id: category.parent_id,
      image: category.image,
      featured: category.featured
    })) || []
  },

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    // ✅ VALIDAR SLUG
    if (!slug || slug.trim().length === 0) {
      console.error('Invalid slug provided')
      return undefined
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug.toLowerCase())
      .single()

    if (error || !data) {
      return undefined
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      color: data.color,
      slug: data.slug,
      parent_id: data.parent_id,
      image: data.image,
      featured: data.featured
    }
  },

  async checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
    // ✅ VALIDAR SLUG
    if (!slug || slug.trim().length === 0) {
      return false
    }

    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug.toLowerCase())

    if (excludeId) {
      try {
        categoryIdSchema.parse(excludeId)
        query = query.neq('id', excludeId)
      } catch (error) {
        console.error('Invalid exclude ID:', error)
        return false
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error checking slug availability:', error)
      return false
    }

    return data.length === 0 // true si está disponible (no existe)
  }
} 