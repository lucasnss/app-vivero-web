"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { getAllCategories } from "@/lib/categories"
import { getAllProducts } from "@/lib/products"
import { Category } from "@/data/categories"

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const loadCategoriesAndCounts = async () => {
      try {
        const categoriesData = await getAllCategories()
        const products = await getAllProducts()
        
        // Contar productos por categoría
        const counts: Record<string, number> = {}
        products.forEach(product => {
          counts[product.category_id] = (counts[product.category_id] || 0) + 1
        })
        
        setCategories(categoriesData)
        setProductCounts(counts)
      } catch (error) {
        console.error("Error cargando categorías:", error)
      }
    }
    
    loadCategoriesAndCounts()
  }, [])

  // Función para obtener el icono basado en el emoji de la categoría
  const getCategoryIcon = (icon: string) => {
    return <span className="text-3xl">{icon}</span>
  }

  return (
    <section id="categorias-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-green-800 mb-12">Explora por Categorías</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category.id}
              href={`/categorias?categoria=${category.id}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center border border-green-100 hover:border-green-300 hover:scale-105"
            >
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {getCategoryIcon(category.icon)}
              </div>

              <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base group-hover:text-green-900 transition-colors duration-300">
                {category.name}
              </h3>

              <p className="text-green-600 text-xs sm:text-sm font-medium">
                {productCounts[category.id] || 0} productos
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/categorias"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Ver Todas las Categorías
          </Link>
        </div>
      </div>
    </section>
  )
}
