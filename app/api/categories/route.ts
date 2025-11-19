import { NextRequest, NextResponse } from 'next/server'
import { categoryService } from '@/services/categoryService'
import { logService } from '@/services/logService'
import { 
  createCategorySchema, 
  updateCategorySchema, 
  categoryIdSchema 
} from '@/lib/validations'
import { Category } from '@/types/category'
import { supabase } from '@/lib/supabaseClient'
import { withAuth, withAdmin } from '@/lib/authMiddleware'
import { AdminUser } from '@/types/admin'

// Helper para construir jerarquía de categorías
function buildCategoryHierarchy(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category & { children: Category[] }>()
  const rootCategories: (Category & { children: Category[] })[] = []

  // Primero, crear un mapa de todas las categorías
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Luego, construir la jerarquía
  categories.forEach(category => {
    const categoryWithChildren = categoryMap.get(category.id)
    if (categoryWithChildren && category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.children.push(categoryWithChildren)
      }
    } else if (categoryWithChildren) {
      rootCategories.push(categoryWithChildren)
    }
  })

  return rootCategories
}

// Helper para verificar si una categoría tiene subcategorías
async function hasChildCategories(categoryId: string): Promise<boolean> {
  const children = await categoryService.getCategoriesByParent(categoryId)
  return children.length > 0
}

// Helper para verificar si una categoría tiene productos asociados
async function hasProducts(categoryId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', categoryId)
    .limit(1)

  if (error) {
    console.error('Error checking for products:', error)
    return false
  }

  return data.length > 0
}

// GET - Obtener categorías con soporte para jerarquía (acceso público)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const hierarchical = searchParams.get('hierarchical') === 'true'

    if (id) {
      // Validar ID
      const idValidation = categoryIdSchema.safeParse(id)
      if (!idValidation.success) {
        return NextResponse.json({
          success: false,
          error: 'ID de categoría inválido',
          code: 'INVALID_CATEGORY_ID'
        }, { status: 400 })
      }

      const category = await categoryService.getCategoryById(id)
      if (!category) {
        return NextResponse.json({
          success: false,
          error: 'Categoría no encontrada',
          code: 'CATEGORY_NOT_FOUND'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        data: category
      })
    }

    // Obtener todas las categorías
    const categories = await categoryService.getAllCategories()

    // Si se solicita vista jerárquica, organizar categorías
    if (hierarchical) {
      const hierarchicalCategories = buildCategoryHierarchy(categories)
      return NextResponse.json({
        success: true,
        data: hierarchicalCategories
      })
    }

    return NextResponse.json({
      success: true,
      data: categories
    })

  } catch (error) {
    console.error('Error en GET /api/categories:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 })
  }
}

// POST - Crear nueva categoría (requiere permiso create_categories)
export const POST = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const body = await request.json()

    // Validar datos de entrada
    const validationResult = createCategorySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos de categoría inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    const categoryData = validationResult.data

    // Verificar que el slug no exista
    const isSlugAvailable = await categoryService.checkSlugAvailability(categoryData.slug)
    if (!isSlugAvailable) {
      return NextResponse.json({
        success: false,
        error: 'El slug ya está en uso',
        code: 'SLUG_TAKEN'
      }, { status: 400 })
    }

    // Crear categoría
    const newCategory = await categoryService.createCategory({
      ...categoryData,
      parent_id: categoryData.parent_id || undefined,
      image: categoryData.image || undefined
    })

    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'create_category',
      entity_type: 'category',
      entity_id: newCategory.id,
      details: {
        category_name: newCategory.name,
        parent_id: newCategory.parent_id
      }
    })

    return NextResponse.json({
      success: true,
      data: newCategory
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/categories:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 })
  }
}, ['create_categories']);

// PUT - Actualizar categoría (requiere permiso update_categories)
export const PUT = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({
        success: false,
        error: 'ID de categoría requerido',
        code: 'MISSING_CATEGORY_ID'
      }, { status: 400 })
    }

    // Validar ID
    const idValidation = categoryIdSchema.safeParse(body.id)
    if (!idValidation.success) {
      return NextResponse.json({
        success: false,
        error: 'ID de categoría inválido',
        code: 'INVALID_CATEGORY_ID'
      }, { status: 400 })
    }

    const { id, ...updateData } = body

    // Validar datos de actualización
    const validationResult = updateCategorySchema.safeParse(updateData)
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Datos de actualización inválidos',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })),
        code: 'VALIDATION_ERROR'
      }, { status: 400 })
    }

    // Si se actualiza el slug, verificar disponibilidad
    if (updateData.slug) {
      const isSlugAvailable = await categoryService.checkSlugAvailability(updateData.slug, id)
      if (!isSlugAvailable) {
        return NextResponse.json({
          success: false,
          error: 'El slug ya está en uso',
          code: 'SLUG_TAKEN'
        }, { status: 400 })
      }
    }

    // Actualizar categoría
    const updatedCategory = await categoryService.updateCategory(id, {
      ...updateData,
      parent_id: updateData.parent_id || undefined,
      image: updateData.image || undefined
    })

    if (!updatedCategory) {
      return NextResponse.json({
        success: false,
        error: 'Categoría no encontrada',
        code: 'CATEGORY_NOT_FOUND'
      }, { status: 404 })
    }

    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'update_category',
      entity_type: 'category',
      entity_id: id,
      details: {
        category_name: updatedCategory.name,
        updated_fields: Object.keys(updateData)
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCategory
    })

  } catch (error) {
    console.error('Error en PUT /api/categories:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 })
  }
}, ['update_categories']);

// DELETE - Eliminar categoría (requiere permiso delete_categories)
export const DELETE = withAuth(async (request: NextRequest, admin: AdminUser) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID de categoría requerido',
        code: 'MISSING_CATEGORY_ID'
      }, { status: 400 })
    }

    // Validar ID
    const idValidation = categoryIdSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json({
        success: false,
        error: 'ID de categoría inválido',
        code: 'INVALID_CATEGORY_ID'
      }, { status: 400 })
    }

    // Verificar si tiene subcategorías
    const hasChildren = await hasChildCategories(id)
    if (hasChildren) {
      return NextResponse.json({
        success: false,
        error: 'No se puede eliminar una categoría con subcategorías',
        code: 'HAS_CHILD_CATEGORIES'
      }, { status: 400 })
    }

    // Verificar si tiene productos asociados
    const hasProductsAssociated = await hasProducts(id)
    if (hasProductsAssociated) {
      return NextResponse.json({
        success: false,
        error: 'No se puede eliminar una categoría con productos asociados',
        code: 'HAS_PRODUCTS'
      }, { status: 400 })
    }

    // Obtener categoría antes de eliminar para el log
    const category = await categoryService.getCategoryById(id)
    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Categoría no encontrada',
        code: 'CATEGORY_NOT_FOUND'
      }, { status: 404 })
    }

    // Eliminar categoría
    const success = await categoryService.deleteCategory(id)

    // Registrar actividad
    await logService.recordActivity({
      user_id: admin.id,
      action: 'delete_category',
      entity_type: 'category',
      entity_id: id,
      details: {
        category_name: category.name,
        parent_id: category.parent_id
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        message: 'Categoría eliminada exitosamente',
        deletedId: id
      }
    })

  } catch (error) {
    console.error('Error en DELETE /api/categories:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 })
  }
}, ['delete_categories']);