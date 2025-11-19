"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import { getAllProducts, Product } from "@/lib/products"
import SearchBar from "@/components/search-bar"
import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { getAllCategories, getCategoryById } from "@/lib/categories"
import { Category } from "@/data/categories"

export default function CategoriasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const searchParams = useSearchParams()
  const selectedCategoryId = searchParams.get("categoria")
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({})
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const loadProductsAndCategories = async () => {
      try {
        const products = await getAllProducts(false) // No incluir productos sin stock
        const categoriesData = await getAllCategories()
        setCategories(categoriesData)
        
        const filtered = products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setFilteredProducts(filtered)
        
        // Agrupar por categoría usando el nombre de la categoría
        const grouped = filtered.reduce((acc, product) => {
          const category = categoriesData.find(cat => cat.id === product.category_id)
          const categoryName = category?.name || 'Sin categoría'
          if (!acc[categoryName]) acc[categoryName] = []
          acc[categoryName].push(product)
          return acc
        }, {} as Record<string, Product[]>)
        setGroupedProducts(grouped)
      } catch (error) {
        console.error("Error cargando productos:", error)
      }
    }
    
    loadProductsAndCategories()
  }, [searchQuery])

  // Reordenar categorías: la seleccionada primero
  let orderedEntries = Object.entries(groupedProducts)
  if (selectedCategoryId) {
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)
    if (selectedCategory) {
      orderedEntries = orderedEntries.sort(([catA], [catB]) => {
        if (catA === selectedCategory.name) return -1
        if (catB === selectedCategory.name) return 1
        return 0
      })
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Navbar />

      {/* Hero Section + Search Bar (unidos en un solo fondo degradado) */}
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

      {/* Categorías */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {orderedEntries.map(([category, products]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-green-800 mb-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
