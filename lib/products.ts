// Tipo de producto
export type Product = {
  id: string
  name: string
  description: string
  category_id: string
  price: number
  stock: number
  image: string
  images: string[]
  scientificName: string
  care: string
  characteristics: string
  origin: string
  featured?: boolean
}

// Tipos para respuestas de la API
type ApiResponse<T> = {
  success: boolean
  data: T
  error?: {
    type: string
    message: string
    details?: any
  }
}

type ProductsListResponse = ApiResponse<Product[]> & {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters?: any
  sorting?: any
}

// Funciones para interactuar con la API
const API_BASE = '/api/products'

export async function getAllProducts(includeOutOfStock = false): Promise<Product[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error('Error al obtener productos')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Error al obtener productos')
  }
  
  // Asegurar que result.data sea un array
  if (!Array.isArray(result.data)) {
    console.error('La respuesta de la API no contiene un array de productos:', result)
    return []
  }
  
  // Retornar todos los productos sin filtrar por stock
  return result.data
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const response = await fetch(`${API_BASE}?id=${id}`)
  if (!response.ok) {
    return undefined
  }
  
  const result = await response.json()
  
  if (!result.success || !result.data) {
    return undefined
  }
  
  return result.data
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  // Siempre enviar images como array de strings (nunca undefined)
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const response = await fetch(API_BASE, {
    method: 'POST',
    credentials: 'include', // CRÍTICO: Incluir cookies de autenticación
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...product,
      images
    }),
  });

  if (!response.ok) {
    let errorMessage = `Error al crear producto (${response.status})`;
    try {
      const errorResult = await response.json();
      errorMessage = errorResult.error?.message || errorMessage;
    } catch (jsonError) {
      // Si no podemos parsear JSON, usar mensaje por defecto
      console.warn('No se pudo parsear respuesta de error:', jsonError);
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Error al crear producto');
  }

  return result.data;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  // Siempre enviar images como array de strings (nunca undefined)
  let images: string[] | undefined = undefined;
  if (Array.isArray(data.images) && data.images.length > 0) {
    images = data.images;
  } else if (data.image) {
    images = [data.image];
  }

  const response = await fetch(API_BASE, {
    method: 'PUT',
    credentials: 'include', // CRÍTICO: Incluir cookies de autenticación
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      id, 
      ...data,
      images
    }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    let errorMessage = `Error al actualizar producto (${response.status})`;
    try {
      const errorResult = await response.json();
      errorMessage = errorResult.error?.message || errorMessage;
    } catch (jsonError) {
      console.warn('No se pudo parsear respuesta de error:', jsonError);
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    return null;
  }

  return result.data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}?id=${id}`, {
    method: 'DELETE',
    credentials: 'include', // CRÍTICO: Incluir cookies de autenticación
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      return false
    }
    let errorMessage = `Error al eliminar producto (${response.status})`;
    try {
      const errorResult = await response.json();
      errorMessage = errorResult.error?.message || errorMessage;
    } catch (jsonError) {
      console.warn('No se pudo parsear respuesta de error:', jsonError);
    }
    throw new Error(errorMessage);
  }
  
  try {
    const result = await response.json()
    return result.success
  } catch (jsonError) {
    // Si no hay contenido JSON, pero el status es ok, considerar exitoso
    console.warn('Respuesta sin JSON pero exitosa:', jsonError);
    return true;
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE}?category_id=${encodeURIComponent(categoryId)}`)
  if (!response.ok) {
    throw new Error('Error al obtener productos por categoría')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Error al obtener productos por categoría')
  }
  
  // Asegurar que result.data sea un array
  if (!Array.isArray(result.data)) {
    console.error('La respuesta de la API no contiene un array de productos:', result)
    return []
  }
  
  return result.data
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`${API_BASE}?search=${encodeURIComponent(query)}`)
  if (!response.ok) {
    throw new Error('Error al buscar productos')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Error al buscar productos')
  }
  
  // Asegurar que result.data sea un array
  if (!Array.isArray(result.data)) {
    console.error('La respuesta de la API no contiene un array de productos:', result)
    return []
  }
  
  return result.data
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE}?featured=true`, {
    cache: 'no-store', // Desactivar caché para obtener datos frescos
    headers: {
      'Content-Type': 'application/json',
    }
  })
  if (!response.ok) {
    throw new Error('Error al obtener productos destacados')
  }
  
  const result = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Error al obtener productos destacados')
  }
  
  // Asegurar que result.data sea un array
  if (!Array.isArray(result.data)) {
    console.error('La respuesta de la API no contiene un array de productos:', result)
    return []
  }
  
  return result.data
}

// Nueva función para obtener productos con paginación
export async function getProductsPaginated(params?: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  featured?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<ProductsListResponse> {
  const searchParams = new URLSearchParams()
  
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.search) searchParams.set('search', params.search)
  if (params?.categoryId) searchParams.set('category_id', params.categoryId)
  if (params?.featured) searchParams.set('featured', 'true')
  if (params?.minPrice) searchParams.set('min_price', params.minPrice.toString())
  if (params?.maxPrice) searchParams.set('max_price', params.maxPrice.toString())
  if (params?.sortBy) searchParams.set('sort_by', params.sortBy)
  if (params?.sortOrder) searchParams.set('sort_order', params.sortOrder)
  
  const url = searchParams.toString() ? `${API_BASE}?${searchParams}` : API_BASE
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error('Error al obtener productos')
  }
  
  const result: ProductsListResponse = await response.json()
  
  if (!result.success) {
    throw new Error(result.error?.message || 'Error al obtener productos')
  }
  
  return result
}

 