// lib/cart.ts
import type { CartItem } from '@/types/cartItem'

const CART_KEY = "vivero_cart"
const PREV_URL_KEY = "prevCarritoUrl"
const EXPIRATION_MS = 60 * 60 * 1000 // 1 hora

interface StoredCart {
  items: CartItem[]
  timestamp: number
}

// Función de ayuda para verificar si estamos en el navegador
const isBrowser = () => typeof window !== "undefined"

// Función para validar stock disponible (compatible con BD futura)
export async function validateStock(productId: string, requestedQuantity: number): Promise<{
  isValid: boolean
  availableStock: number
  message: string
}> {
  try {
    // Importar dinámicamente para evitar problemas de SSR
    const { getProductById } = await import('./products')
    const product = await getProductById(productId)
    
    if (!product) {
      return {
        isValid: false,
        availableStock: 0,
        message: "Producto no encontrado"
      }
    }

    // Obtener cantidad actual en carrito
    const cart = getCart()
    const cartItem = cart.find(item => item.product_id === productId)
    const currentInCart = cartItem ? cartItem.quantity : 0

    // Calcular stock disponible (stock total - ya en carrito)
    const availableStock = Math.max(0, product.stock - currentInCart)
    
    if (requestedQuantity > availableStock) {
      return {
        isValid: false,
        availableStock,
        message: availableStock === 0 
          ? "No hay stock disponible" 
          : `Solo quedan ${availableStock} unidades disponibles`
      }
    }

    return {
      isValid: true,
      availableStock,
      message: ""
    }
  } catch (error) {
    console.error("Error validando stock:", error)
    return {
      isValid: false,
      availableStock: 0,
      message: "Error al verificar stock"
    }
  }
}

// Función para obtener stock disponible sin validar
export async function getAvailableStock(productId: string): Promise<number> {
  try {
    const { getProductById } = await import('./products')
    const product = await getProductById(productId)
    
    if (!product) return 0

    const cart = getCart()
    const cartItem = cart.find(item => item.product_id === productId)
    const currentInCart = cartItem ? cartItem.quantity : 0

    const availableStock = Math.max(0, product.stock - currentInCart)
    
    return availableStock
  } catch (error) {
    console.error("Error obteniendo stock:", error)
    return 0
  }
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return []
  try {
    const json = window.localStorage.getItem(CART_KEY)
    if (!json) return []
    
    const { items, timestamp } = JSON.parse(json) as StoredCart
    if (Date.now() - timestamp > EXPIRATION_MS) {
      window.localStorage.removeItem(CART_KEY)
      return []
    }
    // Validar que items sea un array y tenga la estructura correcta
    if (!Array.isArray(items)) {
      window.localStorage.removeItem(CART_KEY)
      return []
    }
    // Filtrar items inválidos
    const validItems = items.filter(item => 
      item && 
      typeof item.product_id === 'string' && 
      typeof item.quantity === 'number' && 
      item.quantity > 0
    )
    return validItems
  } catch {
    if (isBrowser()) {
      window.localStorage.removeItem(CART_KEY)
    }
    return []
  }
}

function saveCart(items: CartItem[]) {
  if (!isBrowser()) return
  const payload: StoredCart = { items, timestamp: Date.now() }
  window.localStorage.setItem(CART_KEY, JSON.stringify(payload))
}

export function addToCart(item: CartItem) {
  if (!isBrowser()) return
  const items = getCart()
  const idx = items.findIndex((i) => i.product_id === item.product_id)
    if (idx > -1) {
      items[idx].quantity = Math.min(items[idx].quantity + item.quantity, 15)
    } else {
      items.push({ 
        product_id: item.product_id, 
        product_name: item.product_name,
        price: item.price,
        image: item.image,
        quantity: Math.min(item.quantity, 15) 
      })
    }
  saveCart(items)
  window.dispatchEvent(new Event("cart-updated"))
}

// Nueva función async para agregar al carrito con validación de stock
export async function addToCartWithStockValidation(item: CartItem): Promise<{
  success: boolean
  message: string
  addedQuantity: number
}> {
  if (!isBrowser()) {
    return { success: false, message: "No disponible en servidor", addedQuantity: 0 }
  }

  try {
    // Validar stock disponible
    const validation = await validateStock(item.product_id, item.quantity)
    
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.message,
        addedQuantity: 0
      }
    }

    // Obtener carrito actual
    const items = getCart()
    const idx = items.findIndex((i) => i.product_id === item.product_id)
    const currentInCart = idx > -1 ? items[idx].quantity : 0
    
    // Verificar límite de 15 productos por compra
    if (currentInCart >= 15) {
      return {
        success: false,
        message: "Ya tienes 15 unidades de este producto en tu carrito (límite máximo)",
        addedQuantity: 0
      }
    }
    
    // Calcular cantidad máxima que se puede agregar
    const maxQuantity = Math.min(item.quantity, validation.availableStock, 15 - currentInCart)
    
    if (maxQuantity <= 0) {
      return {
        success: false,
        message: "No se puede agregar más de este producto",
        addedQuantity: 0
      }
    }

    // Actualizar carrito
    if (idx > -1) {
      items[idx].quantity = Math.min(items[idx].quantity + maxQuantity, 15)
    } else {
      // Asegurar que todos los campos requeridos estén presentes
      items.push({ 
        product_id: item.product_id, 
        product_name: item.product_name,
        price: item.price,
        image: item.image,
        quantity: maxQuantity 
      })
    }
    
    saveCart(items)
    window.dispatchEvent(new Event("cart-updated"))

    // Determinar el mensaje apropiado
    let message = ""
    if (maxQuantity === item.quantity) {
      message = "Producto agregado correctamente"
    } else if (maxQuantity < item.quantity && currentInCart + maxQuantity >= 15) {
      message = `Se agregaron ${maxQuantity} unidades. Límite de 15 productos por compra alcanzado`
    } else if (maxQuantity < item.quantity) {
      message = `Se agregaron ${maxQuantity} unidades (máximo disponible)`
    }

    return {
      success: true,
      message,
      addedQuantity: maxQuantity
    }
  } catch (error) {
    console.error("Error agregando al carrito:", error)
    return {
      success: false,
      message: "Error al agregar producto",
      addedQuantity: 0
    }
  }
}

export function clearCart() {
  if (!isBrowser()) return
  window.localStorage.removeItem(CART_KEY)
  window.dispatchEvent(new Event("cart-updated"))
}

export function savePreviousUrl(url: string) {
  if (!isBrowser() || url === "/carrito" || url.includes("/carrito/")) return
  window.localStorage.setItem(PREV_URL_KEY, url)
}

export function getPreviousUrl(): string | null {
  if (!isBrowser()) return null
  return window.localStorage.getItem(PREV_URL_KEY)
}

export function updateCartItemQuantity(id: string, delta: number) {
  if (!isBrowser()) return
  const items = getCart();
  const idx = items.findIndex(i => i.product_id === id);
  if (idx > -1) {
    const newQuantity = Math.max(Math.min(items[idx].quantity + delta, 15), 0);
    items[idx].quantity = newQuantity;
    let newItems = items;
    if (newQuantity === 0) {
      newItems = items.filter(i => i.product_id !== id);
    }
    saveCart(newItems);
    window.dispatchEvent(new Event("cart-updated"));
  }
}

export function incrementQuantity(id: string) {
  updateCartItemQuantity(id, 1);
}

export function decrementQuantity(id: string) {
  updateCartItemQuantity(id, -1);
}

export function removeFromCart(id: string) {
  if (!isBrowser()) return
  const items = getCart();
  const idx = items.findIndex(i => i.product_id === id);
  if (idx > -1) {
    updateCartItemQuantity(id, -items[idx].quantity);
  }
}
