"use client"

import { useState, useMemo } from "react"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import SearchBar from "@/components/search-bar"
import { Search } from "lucide-react"
import { useProductsWithStock } from "@/lib/hooks/useProducts"
import { useCategories } from "@/lib/hooks/useCategories"

export default function PlantasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { products, isLoading: loadingProducts, isError: errorProducts } = useProductsWithStock()
  const { categories, isLoading: loadingCategories, isError: errorCategories } = useCategories()

  // Filtrar productos de plantas
  const plantProducts = useMemo(() => {
    const plantCategoryIds = categories
      .filter(cat => 
        cat.name.includes("Plantas") || 
        cat.name.includes("Árboles") || 
        cat.name.includes("Palmeras") || 
        cat.name.includes("Coníferas") || 
        cat.name.includes("Arbustos") || 
        cat.name.includes("Frutales")
      )
      .map(cat => cat.id)
    
    return products.filter(product => 
      plantCategoryIds.includes(product.category_id)
    )
  }, [products, categories])

  // Filtrar por búsqueda
  const filteredProducts = useMemo(() => {
    return plantProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [plantProducts, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const isLoading = loadingProducts || loadingCategories
  const hasError = errorProducts || errorCategories

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Navbar />

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-yellow-500">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Nuestras Plantas</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Descubre nuestra amplia selección de plantas para interior, exterior y jardín. Cada planta viene con
            instrucciones detalladas de cuidado.
          </p>
        </div>
      </section>

      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100 to-yellow-100">
        <div className="max-w-7xl mx-auto">
          <SearchBar onSearch={handleSearch} placeholder="Buscar plantas..." />
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100 to-yellow-100">
        <div className="max-w-7xl mx-auto">
          {searchQuery && (
            <div className="mb-6 text-center">
              <p className="text-green-700">
                {filteredProducts.length} resultado{filteredProducts.length !== 1 ? "s" : ""} encontrado
                {filteredProducts.length !== 1 ? "s" : ""}
                {searchQuery && ` para "${searchQuery}"`}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
            </div>
          ) : hasError ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Error al cargar datos. Por favor, intenta de nuevo.</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <div className="text-green-600 mb-4">
                <Search className="h-16 w-16 mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">No se encontraron resultados</h3>
              <p className="text-green-600">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No hay plantas disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
