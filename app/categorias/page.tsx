"use client"

import { useState, useMemo } from "react"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import SearchBar from "@/components/search-bar"
import { useSearchParams } from "next/navigation"
import { useProductsWithStock } from "@/lib/hooks/useProducts"
import { useCategories } from "@/lib/hooks/useCategories"

export default function CategoriasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const searchParams = useSearchParams()
  const selectedCategoryId = searchParams.get("categoria")
  
  const { products, isLoading: loadingProducts, isError: errorProducts } = useProductsWithStock()
  const { categories, isLoading: loadingCategories, isError: errorCategories } = useCategories()

  // Filtrar por búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [products, searchQuery])

  // Agrupar por categoría
  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const category = categories.find(cat => cat.id === product.category_id)
      const categoryName = category?.name || 'Sin categoría'
      if (!acc[categoryName]) acc[categoryName] = []
      acc[categoryName].push(product)
      return acc
    }, {} as Record<string, typeof filteredProducts>)
  }, [filteredProducts, categories])

  // Reordenar categorías: la seleccionada primero
  const orderedEntries = useMemo(() => {
    let entries = Object.entries(groupedProducts)
    if (selectedCategoryId) {
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)
      if (selectedCategory) {
        entries = entries.sort(([catA], [catB]) => {
          if (catA === selectedCategory.name) return -1
          if (catB === selectedCategory.name) return 1
          return 0
        })
      }
    }
    return entries
  }, [groupedProducts, selectedCategoryId, categories])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const isLoading = loadingProducts || loadingCategories
  const hasError = errorProducts || errorCategories

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Navbar />

      <section className="pt-12 pb-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-yellow-500">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Todas las Categorías</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto mb-8">
            Explora nuestro catálogo completo organizado por categorías. Encuentra exactamente lo que necesitas para tu
            jardín y hogar.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} placeholder="Buscar en todas las categorías..." />
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
            </div>
          ) : hasError ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Error al cargar datos. Por favor, intenta de nuevo.</p>
            </div>
          ) : orderedEntries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchQuery ? 'No se encontraron productos con esa búsqueda.' : 'No hay productos disponibles.'}
              </p>
            </div>
          ) : (
            orderedEntries.map(([category, products]) => (
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-bold text-green-800 mb-4">
                  {category} ({products.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
