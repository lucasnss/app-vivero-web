"use client"
import Navbar from "@/components/navbar"
import ProductCard from "@/components/product-card"
import Footer from "@/components/footer"
import { useEffect, useState } from "react"
import { getAllProducts, Product } from "@/lib/products"
import { getAllCategories } from "@/lib/categories"

export default function MacetasPage() {
  const [macetaProducts, setMacetaProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getAllProducts(false) // No incluir productos sin stock
        const categories = await getAllCategories()
        
        // IDs de categorías de macetas
        const macetaCategoryIds = categories
          .filter(cat => cat.name.includes("Macetas"))
          .map(cat => cat.id)
        
        setMacetaProducts(products.filter(product => 
          macetaCategoryIds.includes(product.category_id)
        ))
      } catch (error) {
        console.error("Error cargando productos:", error)
      }
    }
    
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-yellow-500">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Macetas y Contenedores</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Encuentra la maceta perfecta para tus plantas. Tenemos opciones en diferentes materiales, tamaños y estilos
            para complementar tu decoración.
          </p>
        </div>
      </section>

      {/* Productos */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100 to-yellow-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {macetaProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
