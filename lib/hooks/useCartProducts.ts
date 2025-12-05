import useSWR from 'swr'
import { Product } from '@/lib/products'
import { cartService } from '@/services/cartService'

/**
 * Fetcher para obtener múltiples productos por IDs
 */
async function fetchProductsByIds(productIds: string[]): Promise<Product[]> {
  if (productIds.length === 0) return []
  
  try {
    const response = await fetch('/api/products')
    if (!response.ok) {
      throw new Error('Error al obtener productos')
    }
    
    const result = await response.json()
    
    if (!result.success || !Array.isArray(result.data)) {
      console.error('Respuesta inválida:', result)
      return []
    }
    
    // Filtrar solo los productos que están en el carrito
    return result.data.filter((p: Product) => productIds.includes(p.id))
  } catch (error) {
    console.error('Error cargando productos del carrito:', error)
    throw error
  }
}

/**
 * Hook para obtener productos del carrito con SWR
 * Los cachea automáticamente y solo recarga cuando cambian los IDs
 */
export function useCartProducts(productIds: string[]) {
  const key = productIds.length > 0 
    ? ['cart-products', productIds.sort().join(',')] 
    : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => fetchProductsByIds(productIds),
    {
      revalidateOnFocus: false, // No revalidar al cambiar de pestaña
      revalidateOnReconnect: false, // No revalidar al reconectar
      dedupingInterval: 300000, // 5 minutos - productos no cambian tan seguido
      // Los productos del carrito son relativamente estáticos
      revalidateIfStale: false,
    }
  )

  return {
    products: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

/**
 * Hook para obtener productos enriquecidos con info del carrito
 * Combina datos de productos (SWR) con cantidades del carrito (localStorage)
 */
export function useEnrichedCartProducts() {
  const cartItems = cartService.getCart().items
  const productIds = cartItems.map(item => item.product_id)
  
  const { products, isLoading, isError, mutate } = useCartProducts(productIds)

  // Enriquecer productos con cantidad e info del carrito
  const enrichedProducts = products.map(product => {
    const cartItem = cartItems.find(item => item.product_id === product.id)
    return {
      ...product,
      quantity: cartItem?.quantity || 0,
    }
  }).filter(p => p.quantity > 0) // Solo productos con cantidad > 0

  return {
    products: enrichedProducts,
    isLoading,
    isError,
    mutate,
    cartItems, // Para acceso directo si se necesita
  }
}

