"use client"

import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import CategoriesSection from "@/components/categories-section"
import { useFeaturedProducts } from "@/lib/hooks/useProducts"

export default function HomePage() {
  const { products: featuredProducts, isLoading, isError } = useFeaturedProducts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 via-green-600 to-yellow-500">
      <Navbar />
      <Hero />

      {/* Sección de productos destacados */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-8">Productos Destacados</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Error al cargar productos. Por favor, intenta de nuevo.</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No hay productos destacados disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nueva sección de categorías */}
      <CategoriesSection />

      <Footer />
    </div>
  )
}
