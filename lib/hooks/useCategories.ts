import useSWR from 'swr'
import { getAllCategories } from '@/lib/categories'

/**
 * Hook para obtener todas las categorías con SWR
 */
export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR(
    'categories',
    getAllCategories,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 60000,
    }
  )

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

