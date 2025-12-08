import useSWR from 'swr'
import { getAllProducts } from '@/lib/products'

/**
 * Hook para obtener todos los productos con SWR
 * @param featured - Si es true, solo trae productos destacados. Si es false, trae todos.
 */
export function useProducts(featured: boolean = false) {
  const { data, error, isLoading, mutate } = useSWR(
    ['products', featured],
    () => getAllProducts(featured),
    {
      revalidateOnFocus: true, // Revalida cuando el usuario vuelve a la pestaña
      revalidateOnReconnect: true, // Revalida cuando recupera conexión
      dedupingInterval: 60000, // No hace requests duplicados en 60 segundos
    }
  )

  return {
    products: data || [],
    isLoading,
    isError: error,
    mutate, // Para recargar manualmente si es necesario
  }
}

/**
 * Hook para obtener solo productos con stock
 */
export function useProductsWithStock() {
  const { products, isLoading, isError, mutate } = useProducts(false)
  
  const productsWithStock = products.filter(p => p.stock > 0)
  
  return {
    products: productsWithStock,
    isLoading,
    isError,
    mutate,
  }
}

/**
 * Hook para obtener solo productos destacados
 */
export function useFeaturedProducts() {
  return useProducts(true)
}

