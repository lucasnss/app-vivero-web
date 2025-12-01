"use client"

import { useState, useEffect } from "react"
import { Plus, Info, X, ChevronLeft, ChevronRight } from "lucide-react"
import { addToCartWithStockValidation, getAvailableStock, savePreviousUrl, getCart } from "@/lib/cart"
import { useToast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"
import { getCategoryById } from "@/lib/categories"
import { Category } from "@/data/categories"

interface Product {
  id: string
  name: string
  description: string
  category_id: string
  price: number
  stock: number
  image: string
  images?: string[]
  scientificName: string
  care: string
  characteristics: string
  origin: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product, showOutOfStock = false }: ProductCardProps & { showOutOfStock?: boolean }) {
  const [showCareInfo, setShowCareInfo] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [alert, setAlert] = useState("")
  const [availableStock, setAvailableStock] = useState<number | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { toast } = useToast()
  const pathname = usePathname()

  // Crear array con todas las imágenes del producto (máximo 3)
  // Evitar duplicados: si product.image está en product.images, no la incluimos dos veces
  const mainImage = product.image && typeof product.image === 'string' && product.image.trim() !== '' ? product.image : null
  const additionalImages = product.images && Array.isArray(product.images) ? product.images.filter(url => 
    url && typeof url === 'string' && url.trim() !== '' && url !== mainImage
  ) : []
  
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...additionalImages
  ].slice(0, 3)
  
  // Debug: Log para verificar el array de imágenes
  console.log('🔍 Debug ProductCard - Product ID:', product.id)
  console.log('🔍 Debug ProductCard - mainImage:', mainImage)
  console.log('🔍 Debug ProductCard - additionalImages:', additionalImages)
  console.log('🔍 Debug ProductCard - allImages construido:', allImages)
  console.log('🔍 Debug ProductCard - allImages.length:', allImages.length)
  
  const hasMultipleImages = allImages.length > 1

  // Funciones para navegación de imágenes
  const nextImage = () => {
    console.log('🔍 Debug nextImage - currentIndex:', currentImageIndex, 'allImages.length:', allImages.length)
    if (currentImageIndex < allImages.length - 1) {
      const newIndex = currentImageIndex + 1
      console.log('🔍 Debug nextImage - avanzando a índice:', newIndex)
      setCurrentImageIndex(newIndex)
    } else {
      console.log('🔍 Debug nextImage - ya en la última imagen')
    }
  }

  const prevImage = () => {
    console.log('🔍 Debug prevImage - currentIndex:', currentImageIndex, 'allImages.length:', allImages.length)
    if (currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1
      console.log('🔍 Debug prevImage - retrocediendo a índice:', newIndex)
      setCurrentImageIndex(newIndex)
    } else {
      console.log('🔍 Debug prevImage - ya en la primera imagen')
    }
  }

  // Resetear índice si está fuera del rango válido
  useEffect(() => {
    if (currentImageIndex >= allImages.length) {
      setCurrentImageIndex(0)
    }
  }, [currentImageIndex, allImages.length])

  const currentImage = allImages[currentImageIndex] || product.image || "/placeholder.svg"
  
  // Debug: Log para verificar qué imagen se está mostrando
  console.log('🔍 Debug ProductCard - currentImageIndex:', currentImageIndex)
  console.log('🔍 Debug ProductCard - currentImage URL:', currentImage)

  // Cargar stock disponible al montar el componente y cuando cambie el carrito
  useEffect(() => {
    const loadStock = async () => {
      try {
        const stock = await getAvailableStock(product.id)
        setAvailableStock(stock)
      } catch (error) {
        console.error("Error cargando stock:", error)
      }
    }
    
    loadStock()
    
    // Escuchar cambios en el carrito para actualizar stock en tiempo real
    const handleCartUpdate = () => {
      loadStock()
    }
    
    // Escuchar cambios en localStorage para detectar recargas de página
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vivero_cart") {
        loadStock()
      }
    }
    
    window.addEventListener("cart-updated", handleCartUpdate)
    window.addEventListener("storage", handleStorageChange)
    
    // También actualizar cuando la página vuelve a estar visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadStock()
      }
    }
    
    document.addEventListener("visibilitychange", handleVisibilityChange)
    
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate)
      window.removeEventListener("storage", handleStorageChange)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [product.id])

  // Ajustar cantidad automáticamente cuando cambie el stock disponible
  useEffect(() => {
    if (availableStock !== null && quantity > availableStock) {
      setQuantity(Math.min(quantity, availableStock))
    }
  }, [availableStock, quantity])

  // Forzar actualización del stock cuando el componente se monta
  useEffect(() => {
    const forceUpdateStock = async () => {
      try {
        const stock = await getAvailableStock(product.id)
        setAvailableStock(stock)
      } catch (error) {
        console.error("Error forzando actualización de stock:", error)
      }
    }
    
    // Pequeño delay para asegurar que el carrito esté cargado
    const timer = setTimeout(forceUpdateStock, 100)
    
    return () => clearTimeout(timer)
  }, [product.id])

  // Guardar la URL actual cuando el componente se monta
  useEffect(() => {
    if (pathname) {
      savePreviousUrl(pathname)
    }
  }, [pathname])

  // Cargar información de la categoría
  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categoryData = await getCategoryById(product.category_id)
        setCategory(categoryData || null)
      } catch (error) {
        console.error("Error cargando categoría:", error)
      }
    }
    
    loadCategory()
  }, [product.category_id])

  /** Manejador que envía el producto al carrito */
  const handleAddToCart = async () => {
    try {
      const result = await addToCartWithStockValidation({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity,
      })

      if (result.success) {
        setAlert("")
        // Actualizar el stock disponible en tiempo real
        const newStock = await getAvailableStock(product.id)
        setAvailableStock(newStock)
        
        // Ajustar la cantidad seleccionada si excede el nuevo stock
        if (quantity > newStock) {
          setQuantity(Math.min(quantity, newStock))
        }
        
        // Determinar el tipo de toast basado en el mensaje
        const isLimitReached = result.message.includes("Límite de 15 productos")
        const isPartialAdd = result.message.includes("máximo disponible")
        
        if (isLimitReached) {
          toast({
            title: "⚠️ Límite alcanzado",
            description: result.message,
            duration: 4000,
          })
        } else if (isPartialAdd) {
          toast({
            title: "⚠️ Stock limitado",
            description: result.message,
            duration: 4000,
          })
        } else {
          toast({
            title: "✅ Producto agregado al carrito",
            description: result.message,
            duration: 3000,
          })
        }
      } else {
        setAlert(result.message)
        
        // Determinar el tipo de toast para errores
        const isLimitReached = result.message.includes("15 unidades")
        const isNoStock = result.message.includes("stock disponible")
        
        if (isLimitReached) {
          toast({
            title: "🚫 Límite máximo alcanzado",
            description: result.message,
            duration: 4000,
          })
        } else if (isNoStock) {
          toast({
            title: "❌ Sin stock disponible",
            description: result.message,
            duration: 4000,
          })
        } else {
          toast({
            title: "⚠️ No se pudo agregar",
            description: result.message,
            duration: 4000,
          })
        }
      }
    } catch (error) {
      console.error("Error agregando al carrito:", error)
      setAlert("Error al agregar producto")
      toast({
        title: "❌ Error",
        description: "Error al agregar producto al carrito",
        duration: 4000,
      })
    }
  }
   
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: "Agotado", color: "bg-gray-500" }
    if (stock > 10) return { text: "Hay stock", color: "bg-green-500" }
    if (stock > 5) return { text: "Últimos 10 productos", color: "bg-yellow-500" }
    return { text: "Últimos 5 productos", color: "bg-red-500" }
  }

  // Usar availableStock para el badge de estado, con fallback a product.stock
  // Los badges solo cambian cuando se vende el producto, no aleatoriamente
  const stockStatus = getStockStatus(availableStock !== null ? availableStock : product.stock)

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative group">
          <img 
            src={currentImage} 
            alt={product.name} 
            className="w-full h-48 object-cover transition-all duration-300" 
          />
          
          {/* Badge de stock */}
          <div
            className={`absolute top-2 right-2 ${stockStatus.color} text-white text-xs px-2 py-1 rounded-full font-medium`}
          >
            {stockStatus.text}
          </div>

          {/* Botones de navegación de imágenes */}
          {hasMultipleImages && (
            <>
              {/* Botón anterior - solo mostrar si no estamos en la primera imagen */}
              {currentImageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              
              {/* Botón siguiente - solo mostrar si no estamos en la última imagen */}
              {currentImageIndex < allImages.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Indicadores de imagen */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentImageIndex 
                        ? 'bg-white' 
                        : 'bg-white bg-opacity-50'
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {category?.name || 'Cargando...'}
            </span>
          </div>

          {/* Información de stock */}
          <div className="text-xs text-gray-500 mb-1">
            {availableStock !== null ? (
              availableStock === 0 ? (
                <span className="text-red-500 font-medium">Sin stock disponible</span>
              ) : availableStock <= 5 ? (
                <span className="text-orange-500 font-medium">¡Solo quedan {availableStock} unidades!</span>
              ) : (
                <span className="text-green-600">Disponible: {availableStock} unidades</span>
              )
            ) : (
              "Cargando stock..."
            )}
          </div>

          <h3 className="font-bold text-lg text-green-800 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-green-700">${product.price}</span>
          </div>

          {/* Mensaje de alerta si no se puede agregar */}
          {alert && (
            <div className="text-xs text-red-500 mb-2">{alert}</div>
          )}

          <div className="flex gap-2">
            <select
              value={quantity}
              onChange={e => {
                const newQuantity = Number(e.target.value)
                // Solo permitir seleccionar hasta el stock disponible
                if (availableStock !== null && newQuantity <= availableStock) {
                  setQuantity(newQuantity)
                }
              }}
              className="border rounded-lg px-2 py-1 text-green-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={availableStock === 0}
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                <option 
                  key={num} 
                  value={num}
                  disabled={availableStock !== null && num > availableStock}
                  className={availableStock !== null && num > availableStock ? 'text-gray-400' : ''}
                >
                  {num}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 ${
                product.stock === 0 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>{product.stock === 0 ? 'Sin stock' : 'Agregar'}</span>
            </button>
            <button
              onClick={() => setShowCareInfo(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-green-800 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Panel deslizante de información */}
      {showCareInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-green-800">{product.name}</h3>
              <button onClick={() => setShowCareInfo(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Nombre científico</h4>
                <p className="text-gray-600 italic">{product.scientificName}</p>
              </div>

              <div>
                <h4 className="font-semibold text-green-700 mb-2">Cuidados</h4>
                <p className="text-gray-600">{product.care}</p>
              </div>

              <div>
                <h4 className="font-semibold text-green-700 mb-2">Características</h4>
                <p className="text-gray-600">{product.characteristics}</p>
              </div>

              <div>
                <h4 className="font-semibold text-green-700 mb-2">Origen</h4>
                <p className="text-gray-600">{product.origin}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
