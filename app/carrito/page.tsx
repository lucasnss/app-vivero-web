"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react"
import { cartService } from "@/services/cartService"
import { productService } from "@/services/productService"
import { CartItem } from "@/types/cartItem"
import { Product } from "@/types/product"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"

export default function CarritoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<(Product & { quantity: number; availableStock: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, item: CartItem | null }>({ open: false, item: null })
  const [prevUrl, setPrevUrl] = useState<string | null>(null)
  const [envioDomicilio, setEnvioDomicilio] = useState(false)
  const router = useRouter();

  useEffect(() => {
    // Limpiar carrito de items inválidos
    cartService.cleanCart()
    setCartItems(cartService.getCart().items)
    // Suscribirse a cambios en el carrito
    const handler = () => {
      cartService.cleanCart()
      setCartItems(cartService.getCart().items)
    }
    window.addEventListener("cart-updated", handler)
    // Leer la URL anterior guardada usando la nueva función
    const url = cartService.getPreviousUrl()
    if (url) setPrevUrl(url)
    // Leer preferencia de envío guardada
    const savedEnvio = localStorage.getItem('envioDomicilio')
    if (savedEnvio) setEnvioDomicilio(savedEnvio === 'true')
    return () => window.removeEventListener("cart-updated", handler)
  }, [])

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      const items = cartService.getCart().items
      const prods: (Product & { quantity: number; availableStock: number })[] = []
      for (const item of items) {
        const prod = await productService.getProductById(item.product_id)
        if (prod) {
          const availableStock = await cartService.getAvailableStock(item.product_id)
          prods.push({ ...prod, quantity: item.quantity, availableStock })
        }
      }
      setProducts(prods)
      setLoading(false)
    }
    fetchProducts()
  }, [cartItems])

  useEffect(() => {
    // Guardar preferencia de envío cada vez que cambia
    localStorage.setItem('envioDomicilio', envioDomicilio.toString())
  }, [envioDomicilio])

  const total = products.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleIncrement = async (id: string) => {
    const item = cartItems.find(i => i.product_id === id)
    const product = products.find(p => p.id === id)
    
    if (item && product && item.quantity < Math.min(15, product.stock)) {
      cartService.updateCartItemQuantity(id, item.quantity + 1)
    }
  }

  const handleDecrement = (id: string) => {
    const item = cartItems.find(i => i.product_id === id)
    if (item && item.quantity > 1) {
      cartService.updateCartItemQuantity(id, item.quantity - 1)
    }
  }

  const handleRemove = (id: string) => {
    const item = cartItems.find(i => i.product_id === id)
    if (item) {
      setConfirmDelete({ open: true, item })
    }
  }

  const handleAcceptDelete = () => {
    if (confirmDelete.item) {
      cartService.removeFromCart(confirmDelete.item.product_id)
      setConfirmDelete({ open: false, item: null })
    }
  }
  const handleCancelDelete = () => {
    setConfirmDelete({ open: false, item: null })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      {/* Hero Section */}
      <section className="py-3 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-yellow-500">
        <div className="max-w-7xl mx-auto text-center">
          {/* Botón Llenar carrito encima del título */}
          <div className="flex justify-start mb-4 mt-2">
            <button
              className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              onClick={() => {
                if (prevUrl) {
                  router.push(prevUrl)
                } else {
                  router.push("/")
                }
              }}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Llenar carrito</span>
            </button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 flex items-center justify-center space-x-3">
            <ShoppingCart className="h-12 w-12" />
            <span>Mi Carrito</span>
          </h1>
          <p className="text-xl text-green-100">Revisa tus productos seleccionados antes de finalizar tu compra</p>
        </div>
      </section>

      {/* Carrito Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="text-center py-12 text-green-700">Cargando productos del carrito...</div>
          ) : products.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Items del carrito */}
              <div className="divide-y divide-gray-200">
                {products.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-800">{item.name}</h3>
                      <p className="text-green-600 font-bold">
                        ${item.price}
                        {item.quantity > 1 && (
                          <span className="ml-2 text-sm text-green-700 font-normal">x {item.quantity} = <span className="font-semibold">${item.price * item.quantity}</span></span>
                        )}
                      </p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-3 sm:space-x-0 sm:space-y-2 mt-2 sm:mt-0 w-full sm:w-auto">
                      <div className="flex items-center space-x-3">
                        <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200" onClick={() => handleDecrement(item.id)} disabled={item.quantity === 1}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-semibold">{item.quantity}</span>
                        <button 
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200" 
                          onClick={() => handleIncrement(item.id)} 
                          disabled={item.quantity >= Math.min(15, item.stock)}
                          title={item.quantity >= Math.min(15, item.stock) ? "No hay más stock disponible" : "Agregar una unidad"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleRemove(item.id)} disabled={false}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total y checkout */}
              <div className="bg-green-50 p-6">
                <div className="flex items-center mb-4 justify-between">
                  <div className="flex items-center">
                    <input
                      id="envioDomicilio"
                      type="checkbox"
                      checked={envioDomicilio}
                      onChange={() => setEnvioDomicilio(!envioDomicilio)}
                      className="mr-2"
                    />
                    <label htmlFor="envioDomicilio" className="text-green-800 font-medium cursor-pointer">
                      Envío a domicilio
                    </label>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-green-700"> (Costo variable)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-green-800">Total:</span>
                  <span className="text-2xl font-bold text-green-700">${total}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-1/2"
                    onClick={() => {
                      if (prevUrl) {
                        router.push(prevUrl)
                      } else {
                        router.push("/")
                      }
                    }}
                  >
                    Modificar carrito
                  </button>
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-1/2"
                    onClick={() => router.push("/carrito/pago")}
                  >
                    Continuar al pago
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-500 mb-6">Agrega algunos productos para comenzar</p>
              <button 
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                onClick={() => {
                  if (prevUrl) {
                    router.push(prevUrl)
                  } else {
                    router.push("/")
                  }
                }}
              >
                Explorar Productos
              </button>
            </div>
          )}
        </div>
      </section>

      <AlertDialog open={confirmDelete.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás a punto de eliminar {confirmDelete.item ? products.find(p => p.id === confirmDelete.item?.product_id)?.name : "este producto"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Si aceptas, el producto será eliminado del carrito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAcceptDelete}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
