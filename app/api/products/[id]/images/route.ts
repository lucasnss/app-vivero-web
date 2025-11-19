import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/src/lib/supabaseClient'
import { auth } from '@/src/lib/auth'
import { ImagePreview } from '@/src/types/product'

// Bucket de Supabase Storage
const BUCKET_NAME = 'product-images'

/**
 * GET /api/products/[id]/images
 * Obtiene las imágenes de un producto específico
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'ID de producto requerido' },
        { status: 400 }
      )
    }

    // Obtener producto de la base de datos
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('image, images')
      .eq('id', productId)
      .single()

    if (productError) {
      console.error('Error al obtener producto:', productError)
      return NextResponse.json(
        { success: false, error: `Error al obtener producto: ${productError.message}` },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Formatear imágenes como ImagePreview[]
    const images: ImagePreview[] = []

    // Agregar imagen principal si existe
    if (product.image) {
      images.push({
        url: product.image,
        isMain: true,
        order: 0
      })
    }

    // Agregar imágenes adicionales si existen
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((url: string, index: number) => {
        images.push({
          url,
          isMain: false,
          order: index + 1
        })
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        productId,
        images,
        total: images.length
      }
    })
  } catch (error) {
    console.error('Error al obtener imágenes del producto:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Error al obtener imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products/[id]/images
 * Actualiza las imágenes de un producto específico
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación para actualización de imágenes
    const session = await auth.getSession()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const productId = params.id
    const body = await request.json()
    const { images, mainImageUrl } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'ID de producto requerido' },
        { status: 400 }
      )
    }

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { success: false, error: 'Array de imágenes requerido' },
        { status: 400 }
      )
    }

    // Obtener producto actual
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('image, images')
      .eq('id', productId)
      .single()

    if (productError) {
      console.error('Error al obtener producto:', productError)
      return NextResponse.json(
        { success: false, error: `Error al obtener producto: ${productError.message}` },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Determinar imagen principal y adicionales
    let mainImage: string | null = null
    const additionalImages: string[] = []

    for (const image of images) {
      if (typeof image === 'string') {
        if (image === mainImageUrl || (!mainImage && !mainImageUrl)) {
          mainImage = image
        } else {
          additionalImages.push(image)
        }
      } else if (typeof image === 'object' && image.url) {
        if (image.isMain || (!mainImage && !mainImageUrl)) {
          mainImage = image.url
        } else {
          additionalImages.push(image.url)
        }
      }
    }

    // Actualizar producto con nuevas imágenes
    const { error: updateError } = await supabase
      .from('products')
      .update({
        image: mainImage,
        images: additionalImages.length > 0 ? additionalImages : null
      })
      .eq('id', productId)

    if (updateError) {
      console.error('Error al actualizar imágenes del producto:', updateError)
      return NextResponse.json(
        { success: false, error: `Error al actualizar imágenes: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Formatear respuesta como ImagePreview[]
    const updatedImages: ImagePreview[] = []

    // Agregar imagen principal si existe
    if (mainImage) {
      updatedImages.push({
        url: mainImage,
        isMain: true,
        order: 0
      })
    }

    // Agregar imágenes adicionales
    additionalImages.forEach((url, index) => {
      updatedImages.push({
        url,
        isMain: false,
        order: index + 1
      })
    })

    // Registrar actividad de actualización (opcional)
    console.log(`✅ Imágenes actualizadas para producto ${productId} por ${session.user.email}`)

    return NextResponse.json({
      success: true,
      data: {
        productId,
        images: updatedImages,
        total: updatedImages.length
      }
    })
  } catch (error) {
    console.error('Error al actualizar imágenes del producto:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Error al actualizar imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]/images
 * Elimina una o más imágenes de un producto específico
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación para eliminación de imágenes
    const session = await auth.getSession()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const productId = params.id
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')
    const deleteAll = searchParams.get('all') === 'true'

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'ID de producto requerido' },
        { status: 400 }
      )
    }

    if (!imageUrl && !deleteAll) {
      return NextResponse.json(
        { success: false, error: 'URL de imagen o parámetro all=true requerido' },
        { status: 400 }
      )
    }

    // Obtener producto actual
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('image, images')
      .eq('id', productId)
      .single()

    if (productError) {
      console.error('Error al obtener producto:', productError)
      return NextResponse.json(
        { success: false, error: `Error al obtener producto: ${productError.message}` },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Determinar qué imágenes eliminar y cuáles mantener
    let updatedMainImage = product.image
    let updatedAdditionalImages = product.images || []

    if (deleteAll) {
      // Eliminar todas las imágenes
      updatedMainImage = null
      updatedAdditionalImages = []
    } else if (imageUrl) {
      // Eliminar una imagen específica
      if (product.image === imageUrl) {
        updatedMainImage = null
        
        // Si hay imágenes adicionales, promover la primera a principal
        if (updatedAdditionalImages.length > 0) {
          updatedMainImage = updatedAdditionalImages[0]
          updatedAdditionalImages = updatedAdditionalImages.slice(1)
        }
      } else {
        // Filtrar la imagen de las adicionales
        updatedAdditionalImages = updatedAdditionalImages.filter(url => url !== imageUrl)
      }
    }

    // Actualizar producto con nuevas imágenes
    const { error: updateError } = await supabase
      .from('products')
      .update({
        image: updatedMainImage,
        images: updatedAdditionalImages.length > 0 ? updatedAdditionalImages : null
      })
      .eq('id', productId)

    if (updateError) {
      console.error('Error al actualizar imágenes del producto:', updateError)
      return NextResponse.json(
        { success: false, error: `Error al actualizar imágenes: ${updateError.message}` },
        { status: 500 }
      )
    }

    // Intentar eliminar el archivo de Supabase Storage (opcional)
    if (imageUrl) {
      try {
        // Extraer el nombre del archivo de la URL
        if (imageUrl.includes('/storage/v1/object/public/' + BUCKET_NAME + '/')) {
          const urlParts = imageUrl.split('/storage/v1/object/public/' + BUCKET_NAME + '/')
          if (urlParts.length === 2) {
            const fileName = urlParts[1]
            await supabase.storage.from(BUCKET_NAME).remove([fileName])
          }
        }
      } catch (storageError) {
        // Solo registrar el error, no fallar la operación completa
        console.warn('Error al eliminar archivo de Storage:', storageError)
      }
    }

    // Formatear respuesta como ImagePreview[]
    const remainingImages: ImagePreview[] = []

    // Agregar imagen principal si existe
    if (updatedMainImage) {
      remainingImages.push({
        url: updatedMainImage,
        isMain: true,
        order: 0
      })
    }

    // Agregar imágenes adicionales
    if (updatedAdditionalImages && Array.isArray(updatedAdditionalImages)) {
      updatedAdditionalImages.forEach((url, index) => {
        remainingImages.push({
          url,
          isMain: false,
          order: index + 1
        })
      })
    }

    // Registrar actividad de eliminación (opcional)
    console.log(`✅ Imágenes actualizadas para producto ${productId} por ${session.user.email}`)

    return NextResponse.json({
      success: true,
      data: {
        productId,
        images: remainingImages,
        total: remainingImages.length,
        deleted: deleteAll ? 'all' : imageUrl
      }
    })
  } catch (error) {
    console.error('Error al eliminar imágenes del producto:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Error al eliminar imágenes: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      },
      { status: 500 }
    )
  }
}

