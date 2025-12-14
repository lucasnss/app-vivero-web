"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import ProductFilters, { FilterState, defaultFilters } from "@/components/product-filters"
import { useSearchParams, useRouter } from "next/navigation"
import { useProducts } from "@/lib/hooks/useProducts"
import { useCategories } from "@/lib/hooks/useCategories"
import { SlidersHorizontal, X, Package } from "lucide-react"
import { Product } from "@/lib/products"
import { Category } from "@/data/categories"

export default function CategoriasPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Inicializar filtros desde URL
  const [filters, setFilters] = useState<FilterState>(() => ({
    search: searchParams.get("buscar") || "",
    categoryId: searchParams.get("categoria") || null,
    priceMin: searchParams.get("precioMin") ? parseFloat(searchParams.get("precioMin")!) : null,
    priceMax: searchParams.get("precioMax") ? parseFloat(searchParams.get("precioMax")!) : null,
    inStockOnly: searchParams.get("enStock") === "true",
  }))

  const { products, isLoading: loadingProducts, isError: errorProducts } = useProducts(false)
  const { categories, isLoading: loadingCategories, isError: errorCategories } = useCategories()

  // Calcular precio máximo para el slider
  const maxPrice = useMemo(() => {
    if (products.length === 0) return 50000
    return Math.ceil(Math.max(...products.map((p: Product) => p.price)) / 1000) * 1000
  }, [products])

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.search) params.set("buscar", filters.search)
    if (filters.categoryId) params.set("categoria", filters.categoryId)
    if (filters.priceMin !== null) params.set("precioMin", filters.priceMin.toString())
    if (filters.priceMax !== null) params.set("precioMax", filters.priceMax.toString())
    if (filters.inStockOnly) params.set("enStock", "true")

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : "/categorias"
    
    router.replace(newUrl, { scroll: false })
  }, [filters, router])

  // Filtrado combinado
  const filteredProducts = useMemo((): Product[] => {
    return products.filter((product: Product) => {
      // Búsqueda por nombre, descripción o nombre científico
      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.scientificName.toLowerCase().includes(filters.search.toLowerCase())

      // Categoría
      const matchesCategory =
        !filters.categoryId || product.category_id === filters.categoryId

      // Precio mínimo
      const matchesMinPrice =
        filters.priceMin === null || product.price >= filters.priceMin

      // Precio máximo
      const matchesMaxPrice =
        filters.priceMax === null || product.price <= filters.priceMax

      // Stock
      const matchesStock = !filters.inStockOnly || product.stock > 0

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesStock
      )
    })
  }, [products, filters])

  // Agrupar por categoría
  const groupedProducts = useMemo((): Record<string, Product[]> => {
    return filteredProducts.reduce(
      (acc: Record<string, Product[]>, product: Product) => {
        const category = categories.find((cat: Category) => cat.id === product.category_id)
        const categoryName = category?.name || "Sin categoría"
        if (!acc[categoryName]) acc[categoryName] = []
        acc[categoryName].push(product)
        return acc
      },
      {} as Record<string, Product[]>
    )
  }, [filteredProducts, categories])

  // Reordenar categorías: la seleccionada primero
  const orderedEntries = useMemo((): [string, Product[]][] => {
    let entries = Object.entries(groupedProducts) as [string, Product[]][]
    if (filters.categoryId) {
      const selectedCategory = categories.find(
        (cat: Category) => cat.id === filters.categoryId
      )
      if (selectedCategory) {
        entries = entries.sort(([catA], [catB]) => {
          if (catA === selectedCategory.name) return -1
          if (catB === selectedCategory.name) return 1
          return 0
        })
      }
    }
    return entries
  }, [groupedProducts, filters.categoryId, categories])

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  const isLoading = loadingProducts || loadingCategories
  const hasError = errorProducts || errorCategories

  // Contar filtros activos
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.categoryId) count++
    if (filters.priceMin !== null) count++
    if (filters.priceMax !== null) count++
    if (filters.inStockOnly) count++
    return count
  }, [filters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Nuestro Catálogo
          </h1>
          <p className="text-lg text-green-100 max-w-2xl mx-auto">
            Explora nuestra colección completa de plantas, macetas e insumos
            para tu jardín.
          </p>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Botón filtros mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2 bg-white shadow-md hover:shadow-lg py-3 px-4 rounded-xl font-medium text-green-700 transition-all"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar de filtros - Desktop */}
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-4">
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  maxPrice={maxPrice}
                />
              </div>
            </aside>

            {/* Grid de productos */}
            <main className="flex-1 min-w-0">
              {/* Resumen de resultados */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">
                    <span className="font-semibold text-green-700">
                      {filteredProducts.length}
                    </span>{" "}
                    productos encontrados
                  </span>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => handleFilterChange(defaultFilters)}
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Limpiar filtros ({activeFilterCount})
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4"></div>
                  <p className="text-gray-500">Cargando productos...</p>
                </div>
              ) : hasError ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                  <div className="text-red-500 text-5xl mb-4">⚠️</div>
                  <p className="text-red-600 text-lg font-medium">
                    Error al cargar datos
                  </p>
                  <p className="text-gray-500 mt-2">
                    Por favor, intenta de nuevo más tarde.
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                  <div className="text-gray-300 text-6xl mb-4">🌱</div>
                  <p className="text-gray-600 text-lg font-medium mb-2">
                    No se encontraron productos
                  </p>
                  <p className="text-gray-500">
                    Intenta ajustar los filtros para ver más resultados.
                  </p>
                  <button
                    onClick={() => handleFilterChange(defaultFilters)}
                    className="mt-4 text-green-600 hover:text-green-700 font-medium"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  {orderedEntries.map(([category, categoryProducts]) => (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-green-800">
                          {category}
                        </h2>
                        <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                          {categoryProducts.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {categoryProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Modal de filtros - Mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-gradient-to-br from-green-50 to-yellow-50 shadow-2xl overflow-y-auto animate-slide-in-right">
            <div className="p-4">
              <ProductFilters
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                maxPrice={maxPrice}
                onClose={() => setShowMobileFilters(false)}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Estilos para animación */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
