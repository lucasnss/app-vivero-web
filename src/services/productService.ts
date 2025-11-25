import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product'
import { ActivityLog } from '@/types/activityLog'
import { logService } from './logService'
import { supabase } from '@/lib/supabaseClient'
import { ZodError } from 'zod'
import { 
  productIdSchema,
  createProductSchema,
  updateProductSchema
} from '@/src/lib/validations'

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      throw new Error('Error al obtener productos')
    }

    // Mapear los datos de Supabase al formato de la aplicación
    return data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      stock: product.stock,
      image: product.image,
      images: product.images || [],
      scientificName: product.scientific_name,
      care: product.care,
      characteristics: product.characteristics,
      origin: product.origin,
      featured: product.featured
    })) || []
  },

  async getProductById(id: string): Promise<Product | undefined> {
    // Validar ID
    try {
      productIdSchema.parse(id)
    } catch (error) {
      console.error('Invalid product ID:', error)
      return undefined
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return undefined
    }

    // Mapear datos
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category_id: data.category_id,
      price: data.price,
      stock: data.stock,
      image: data.image,
      images: data.images || [],
      scientificName: data.scientific_name,
      care: data.care,
      characteristics: data.characteristics,
      origin: data.origin,
      featured: data.featured
    }
  },

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    // ✅ VALIDAR DATOS DE ENTRADA
    try {
      const validatedData = createProductSchema.parse(productData)
      
      // Preparar datos para Supabase
      const supabaseData = {
        name: validatedData.name,
        description: validatedData.description,
        category_id: validatedData.category_id,
        price: validatedData.price,
        stock: validatedData.stock,
        image: validatedData.image || '/placeholder.svg',
        images: validatedData.images || [],
        scientific_name: validatedData.scientificName,
        care: validatedData.care,
        characteristics: validatedData.characteristics,
        origin: validatedData.origin,
        featured: validatedData.featured || false
      }

      const { data, error } = await supabase
        .from('products')
        .insert(supabaseData)
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        throw new Error('Error al crear producto: ' + error.message)
      }

      // Mapear respuesta
      const newProduct: Product = {
        id: data.id,
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        price: data.price,
        stock: data.stock,
        image: data.image,
        images: data.images || [],
        scientificName: data.scientific_name,
        care: data.care,
        characteristics: data.characteristics,
        origin: data.origin,
        featured: data.featured
      }
      
      // Log de actividad
      await logService.recordActivity({
        action: 'product_created',
        entity_type: 'product',
        entity_id: newProduct.id,
        details: { product: newProduct }
      })
      
      return newProduct
    } catch (error) {
      // Manejar errores de validación de Zod específicamente
      if (error instanceof ZodError) {
        console.error('Validation error:', error.message)
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new Error(`Error de validación: ${messages}`)
      }
      
      if (error instanceof Error) {
        console.error('Service error:', error.message)
        throw error
      }
      
      console.error('Unknown error:', error)
      throw new Error('Error de validación en los datos del producto')
    }
  },

  async updateProduct(id: string, data: UpdateProductRequest): Promise<Product | null> {
    // ✅ VALIDAR ID
    try {
      productIdSchema.parse(id)
    } catch (error) {
      console.error('Invalid product ID:', error)
      return null
    }

    // ✅ VALIDAR DATOS DE ACTUALIZACIÓN
    try {
      const validatedData = updateProductSchema.parse(data)
      
      // Preparar datos para Supabase (mapear campos)
      const updateData: any = {}
      if (validatedData.name !== undefined) updateData.name = validatedData.name
      if (validatedData.description !== undefined) updateData.description = validatedData.description
      if (validatedData.category_id !== undefined) updateData.category_id = validatedData.category_id
      if (validatedData.price !== undefined) updateData.price = validatedData.price
      if (validatedData.stock !== undefined) updateData.stock = validatedData.stock
      if (validatedData.image !== undefined) updateData.image = validatedData.image || '/placeholder.svg'
      if (validatedData.images !== undefined) updateData.images = validatedData.images || []
      if (validatedData.scientificName !== undefined) updateData.scientific_name = validatedData.scientificName
      if (validatedData.care !== undefined) updateData.care = validatedData.care
      if (validatedData.characteristics !== undefined) updateData.characteristics = validatedData.characteristics
      if (validatedData.origin !== undefined) updateData.origin = validatedData.origin
      if (validatedData.featured !== undefined) updateData.featured = validatedData.featured
      
      updateData.updated_at = new Date().toISOString()

      const { data: updatedData, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error || !updatedData) {
        console.error('Error updating product:', error)
        return null
      }
      
      // Mapear respuesta
      const updatedProduct: Product = {
        id: updatedData.id,
        name: updatedData.name,
        description: updatedData.description,
        category_id: updatedData.category_id,
        price: updatedData.price,
        stock: updatedData.stock,
        image: updatedData.image,
        images: updatedData.images || [],
        scientificName: updatedData.scientific_name,
        care: updatedData.care,
        characteristics: updatedData.characteristics,
        origin: updatedData.origin,
        featured: updatedData.featured
      }
      
      // Log de actividad
      await logService.recordActivity({
        action: 'product_updated',
        entity_type: 'product',
        entity_id: id,
        details: { changes: data, product: updatedProduct }
      })
      
      return updatedProduct
    } catch (error) {
      console.error('Validation error:', error)
      return null
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    // ✅ VALIDAR ID
    try {
      productIdSchema.parse(id)
    } catch (error) {
      console.error('Invalid product ID:', error)
      return false
    }

    // Obtener el producto antes de eliminarlo para el log
    const product = await this.getProductById(id)
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return false
    }
    
    // Log de actividad
    if (product) {
      await logService.recordActivity({
        action: 'product_deleted',
        entity_type: 'product',
        entity_id: id,
        details: { product }
      })
    }
    
    return true
  },

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    // ✅ VALIDAR ID DE CATEGORÍA
    try {
      productIdSchema.parse(categoryId) // Reutilizamos el schema UUID
    } catch (error) {
      console.error('Invalid category ID:', error)
      return []
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products by category:', error)
      return []
    }

    return data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      stock: product.stock,
      image: product.image,
      images: product.images || [],
      scientificName: product.scientific_name,
      care: product.care,
      characteristics: product.characteristics,
      origin: product.origin,
      featured: product.featured
    })) || []
  },

  async searchProducts(query: string): Promise<Product[]> {
    // ✅ VALIDAR QUERY DE BÚSQUEDA
    try {
      const { searchQuerySchema } = await import('@/lib/validations')
      searchQuerySchema.parse(query)
    } catch (error) {
      console.error('Invalid search query:', error)
      return []
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,scientific_name.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching products:', error)
      return []
    }

    return data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      stock: product.stock,
      image: product.image,
      images: product.images || [],
      scientificName: product.scientific_name,
      care: product.care,
      characteristics: product.characteristics,
      origin: product.origin,
      featured: product.featured
    })) || []
  },

  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching featured products:', error)
      return []
    }

    return data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      stock: product.stock,
      image: product.image,
      images: product.images || [],
      scientificName: product.scientific_name,
      care: product.care,
      characteristics: product.characteristics,
      origin: product.origin,
      featured: product.featured
    })) || []
  },

  async updateStock(id: string, quantity: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('products')
      .select('stock')
      .eq('id', id)
      .single()

    if (error || !data) {
      return false
    }

    const newStock = Math.max(0, data.stock - quantity)
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating stock:', updateError)
      return false
    }
    
    // Log de actividad
    await logService.recordActivity({
      action: 'product_updated',
      entity_type: 'product',
      entity_id: id,
      details: { stockChange: -quantity, newStock }
    })
    
    return true
  },

  /**
   * Crea múltiples productos en una sola operación (bulk insert)
   * @param products - Array de productos a crear (máximo 500)
   * @returns Array de productos creados
   */
  async bulkCreateProducts(products: CreateProductRequest[]): Promise<Product[]> {
    if (!products || products.length === 0) {
      throw new Error('No hay productos para crear')
    }

    if (products.length > 500) {
      throw new Error('El máximo de productos por operación bulk es 500')
    }

    // Validar todos los productos antes de insertar
    const validatedProducts = products.map((product, index) => {
      try {
        const validatedData = createProductSchema.parse(product)
        return validatedData
      } catch (error) {
        if (error instanceof ZodError) {
          const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
          throw new Error(`Error de validación en producto ${index + 1}: ${messages}`)
        }
        throw new Error(`Error de validación en producto ${index + 1}`)
      }
    })

    // Preparar datos para Supabase (mapear todos los productos)
    const supabaseData = validatedProducts.map(product => ({
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      price: product.price,
      stock: product.stock,
      image: product.image || '/placeholder.svg',
      images: product.images || [],
      scientific_name: product.scientificName,
      care: product.care,
      characteristics: product.characteristics,
      origin: product.origin,
      featured: product.featured || false
    }))

    // Insertar todos los productos en UNA SOLA consulta
    const { data, error } = await supabase
      .from('products')
      .insert(supabaseData)
      .select()

    if (error) {
      console.error('Error en bulk insert de productos:', error)
      throw new Error('Error al crear productos: ' + error.message)
    }

    if (!data || data.length === 0) {
      throw new Error('No se crearon productos')
    }

    // Mapear respuesta
    const createdProducts: Product[] = data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category_id: item.category_id,
      price: item.price,
      stock: item.stock,
      image: item.image,
      images: item.images || [],
      scientificName: item.scientific_name,
      care: item.care,
      characteristics: item.characteristics,
      origin: item.origin,
      featured: item.featured
    }))

    // Log de actividad para el bulk
    await logService.recordActivity({
      action: 'products_bulk_created',
      entity_type: 'product',
      entity_id: 'bulk_import',
      details: { 
        count: createdProducts.length,
        productIds: createdProducts.map(p => p.id)
      }
    })

    return createdProducts
  }
} 