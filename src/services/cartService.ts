import { CartItem, CartValidationResult, AddToCartResult, StoredCart, ShippingOption, ShippingCalculation, CartSummary } from '@/types/cartItem'
import { productService } from './productService'

const CART_KEY = "vivero_cart"
const PREV_URL_KEY = "prevCarritoUrl"
const EXPIRATION_MS = 60 * 60 * 1000 // 1 hora
const SHIPPING_KEY = "vivero_shipping"
const USER_CART_PREFIX = "vivero_user_cart_"
const TEMP_CART_KEY = "vivero_cart_temp_mp" // Carrito temporal para Mercado Pago
const TEMP_CART_EXPIRATION_MS = 60 * 60 * 1000 // 1 hora también

// Opciones de envío disponibles
const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Envío Estándar',
    description: 'Entrega en 3-5 días hábiles',
    price: 500,
    estimated_days: 5
  },
  {
    id: 'express',
    name: 'Envío Express',
    description: 'Entrega en 24-48 horas',
    price: 900,
    estimated_days: 2
  },
  {
    id: 'free',
    name: 'Envío Gratis',
    description: 'Entrega en 5-7 días hábiles (compras mayores a $10,000)',
    price: 0,
    estimated_days: 7
  }
]

// Función de ayuda para verificar si estamos en el navegador
const isBrowser = () => typeof window !== "undefined"

export const cartService = {
  getCart(): StoredCart {
    if (!isBrowser()) return { items: [], timestamp: Date.now() }
    try {
      const json = window.localStorage.getItem(CART_KEY)
      if (!json) return { items: [], timestamp: Date.now() }
      
      const cart = JSON.parse(json) as StoredCart
      if (Date.now() - cart.timestamp > EXPIRATION_MS) {
        window.localStorage.removeItem(CART_KEY)
        return { items: [], timestamp: Date.now() }
      }
      // Validar que items sea un array y tenga la estructura correcta
      if (!Array.isArray(cart.items)) {
        window.localStorage.removeItem(CART_KEY)
        return { items: [], timestamp: Date.now() }
      }
      // Filtrar items inválidos
      const validItems = cart.items.filter(item => 
        item && 
        typeof item.product_id === 'string' && 
        typeof item.quantity === 'number' && 
        item.quantity > 0
      )
      return { items: validItems, timestamp: cart.timestamp }
    } catch {
      if (isBrowser()) {
        window.localStorage.removeItem(CART_KEY)
      }
      return { items: [], timestamp: Date.now() }
    }
  },

  saveCart(items: CartItem[]) {
    if (!isBrowser()) return
    const payload: StoredCart = { items, timestamp: Date.now() }
    window.localStorage.setItem(CART_KEY, JSON.stringify(payload))
  },

  async addToCart(productId: string, quantity: number): Promise<AddToCartResult> {
    if (!isBrowser()) {
      return { success: false, message: "No disponible en servidor", addedQuantity: 0 }
    }

    try {
      // Validar stock disponible
      const validation = await this.validateStock(productId, quantity)
      
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
          addedQuantity: 0
        }
      }

      // Obtener carrito actual
      const cart = this.getCart()
      const idx = cart.items.findIndex((i) => i.product_id === productId)
      const currentInCart = idx > -1 ? cart.items[idx].quantity : 0
      
      // Verificar límite de 15 productos por compra
      if (currentInCart >= 15) {
        return {
          success: false,
          message: "Ya tienes 15 unidades de este producto en tu carrito (límite máximo)",
          addedQuantity: 0
        }
      }
      
      // Calcular cantidad máxima que se puede agregar
      const maxQuantity = Math.min(quantity, validation.availableStock, 15 - currentInCart)
      
      if (maxQuantity <= 0) {
        return {
          success: false,
          message: "No se puede agregar más de este producto",
          addedQuantity: 0
        }
      }

      // Obtener información del producto
      const product = await productService.getProductById(productId)
      if (!product) {
        return {
          success: false,
          message: "Producto no encontrado",
          addedQuantity: 0
        }
      }

      // Actualizar carrito
      if (idx > -1) {
        cart.items[idx].quantity = Math.min(cart.items[idx].quantity + maxQuantity, 15)
      } else {
        cart.items.push({ 
          product_id: productId, 
          product_name: product.name,
          price: product.price,
          image: product.image || undefined,
          quantity: maxQuantity 
        })
      }
      
      this.saveCart(cart.items)
      window.dispatchEvent(new Event("cart-updated"))

      return {
        success: true,
        message: maxQuantity === quantity 
          ? `Producto agregado al carrito (${maxQuantity} unidades)`
          : `Producto agregado al carrito (${maxQuantity} unidades - máximo disponible)`,
        addedQuantity: maxQuantity
      }
    } catch (error) {
      console.error("Error agregando al carrito:", error)
      return {
        success: false,
        message: "Error al agregar producto al carrito",
        addedQuantity: 0
      }
    }
  },

  async validateStock(productId: string, requestedQuantity: number): Promise<CartValidationResult> {
    try {
      const product = await productService.getProductById(productId)
      
      if (!product) {
        return {
          isValid: false,
          availableStock: 0,
          message: "Producto no encontrado"
        }
      }

      // Obtener cantidad actual en carrito
      const cart = this.getCart()
      const cartItem = cart.items.find(item => item.product_id === productId)
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
  },

  async getAvailableStock(productId: string): Promise<number> {
    try {
      const product = await productService.getProductById(productId)
      
      if (!product) return 0

      const cart = this.getCart()
      const cartItem = cart.items.find(item => item.product_id === productId)
      const currentInCart = cartItem ? cartItem.quantity : 0

      const availableStock = Math.max(0, product.stock - currentInCart)
      
      return availableStock
    } catch (error) {
      console.error("Error obteniendo stock:", error)
      return 0
    }
  },

  clearCart() {
    if (!isBrowser()) return
    window.localStorage.removeItem(CART_KEY)
    window.dispatchEvent(new Event("cart-updated"))
  },

  savePreviousUrl(url: string) {
    if (!isBrowser()) return
    window.localStorage.setItem(PREV_URL_KEY, url)
  },

  getPreviousUrl(): string | null {
    if (!isBrowser()) return null
    return window.localStorage.getItem(PREV_URL_KEY)
  },

  updateCartItemQuantity(productId: string, quantity: number) {
    if (!isBrowser()) return
    const cart = this.getCart()
    const idx = cart.items.findIndex((i) => i.product_id === productId)
    if (idx > -1) {
      const newQuantity = Math.max(1, Math.min(quantity, 15))
      cart.items[idx].quantity = newQuantity
      this.saveCart(cart.items)
      window.dispatchEvent(new Event("cart-updated"))
    }
  },

  removeFromCart(productId: string) {
    if (!isBrowser()) return
    const cart = this.getCart()
    const filteredItems = cart.items.filter((i) => i.product_id !== productId)
    this.saveCart(filteredItems)
    window.dispatchEvent(new Event("cart-updated"))
  },

  /**
   * Calcula las opciones de envío disponibles basado en el carrito actual
   */
  async calculateShipping(): Promise<ShippingCalculation> {
    if (!isBrowser()) return { available_options: [] }
    
    try {
      // Obtener carrito actual y calcular subtotal
      const cart = this.getCart()
      let subtotal = 0
      
      for (const item of cart.items) {
        const product = await productService.getProductById(item.product_id)
        if (product) {
          subtotal += product.price * item.quantity
        }
      }
      
      // Determinar opciones disponibles
      let availableOptions = [...SHIPPING_OPTIONS]
      
      // Envío gratis solo disponible para compras mayores a $10,000
      if (subtotal < 10000) {
        availableOptions = availableOptions.filter(option => option.id !== 'free')
      }
      
      // Obtener opción seleccionada previamente
      const selectedOption = window.localStorage.getItem(SHIPPING_KEY) || undefined
      
      return {
        available_options: availableOptions,
        selected_option: selectedOption
      }
    } catch (error) {
      console.error("Error calculando envío:", error)
      return { available_options: [] }
    }
  },

  /**
   * Selecciona una opción de envío
   */
  selectShippingOption(optionId: string): boolean {
    if (!isBrowser()) return false
    
    try {
      const option = SHIPPING_OPTIONS.find(opt => opt.id === optionId)
      if (!option) return false
      
      window.localStorage.setItem(SHIPPING_KEY, optionId)
      window.dispatchEvent(new Event("shipping-updated"))
      return true
    } catch {
      return false
    }
  },

  /**
   * Obtiene la opción de envío seleccionada
   */
  getSelectedShipping(): ShippingOption | null {
    if (!isBrowser()) return null
    
    try {
      const optionId = window.localStorage.getItem(SHIPPING_KEY)
      if (!optionId) return null
      
      return SHIPPING_OPTIONS.find(opt => opt.id === optionId) || null
    } catch {
      return null
    }
  },

  /**
   * Calcula el resumen del carrito con envío
   */
  async getCartSummary(): Promise<CartSummary> {
    if (!isBrowser()) {
      return { subtotal: 0, shipping_cost: 0, total: 0, item_count: 0, has_shipping: false }
    }
    
    try {
      // Obtener carrito y calcular subtotal
      const cart = this.getCart()
      let subtotal = 0
      let itemCount = 0
      
      for (const item of cart.items) {
        const product = await productService.getProductById(item.product_id)
        if (product) {
          subtotal += product.price * item.quantity
          itemCount += item.quantity
        }
      }
      
      // Obtener costo de envío
      const selectedShipping = this.getSelectedShipping()
      const shippingCost = selectedShipping ? selectedShipping.price : 0
      
      return {
        subtotal,
        shipping_cost: shippingCost,
        total: subtotal + shippingCost,
        item_count: itemCount,
        has_shipping: !!selectedShipping
      }
    } catch (error) {
      console.error("Error calculando resumen del carrito:", error)
      return { subtotal: 0, shipping_cost: 0, total: 0, item_count: 0, has_shipping: false }
    }
  },

  /**
   * Limpia el carrito después de completar una compra
   */
  clearCartAfterPurchase(orderId: string) {
    if (!isBrowser()) return
    
    // Guardar información de la última compra para referencia
    const lastPurchase = {
      orderId,
      date: new Date().toISOString(),
      itemCount: this.getCart().items.length
    }
    window.localStorage.setItem('vivero_last_purchase', JSON.stringify(lastPurchase))
    
    // Limpiar carrito y envío
    window.localStorage.removeItem(CART_KEY)
    window.localStorage.removeItem(SHIPPING_KEY)
    
    window.dispatchEvent(new Event("cart-updated"))
    window.dispatchEvent(new Event("purchase-completed"))
  },

  /**
   * Guarda el carrito para un usuario autenticado
   */
  saveCartForUser(userId: string) {
    if (!isBrowser() || !userId) return
    
    const currentCart = this.getCart()
    const userCartKey = `${USER_CART_PREFIX}${userId}`
    
    const userCart: StoredCart = {
      items: currentCart.items,
      timestamp: Date.now(),
      userId
    }
    
    window.localStorage.setItem(userCartKey, JSON.stringify(userCart))
  },

  /**
   * Carga el carrito de un usuario autenticado
   */
  loadCartForUser(userId: string): boolean {
    if (!isBrowser() || !userId) return false
    
    try {
      const userCartKey = `${USER_CART_PREFIX}${userId}`
      const json = window.localStorage.getItem(userCartKey)
      
      if (!json) return false
      
      const { items, timestamp } = JSON.parse(json) as StoredCart
      
      // Verificar expiración
      if (Date.now() - timestamp > EXPIRATION_MS) {
        window.localStorage.removeItem(userCartKey)
        return false
      }
      
      // Guardar en el carrito actual
      this.saveCart(items)
      window.dispatchEvent(new Event("cart-updated"))
      
      return true
    } catch {
      return false
    }
  },

  /**
   * Sincroniza el carrito actual con el carrito de usuario
   */
  syncCartWithUser(userId: string | null) {
    if (!isBrowser()) return
    
    if (userId) {
      // Usuario ha iniciado sesión, cargar su carrito
      const hasUserCart = this.loadCartForUser(userId)
      
      if (!hasUserCart) {
        // Si no tiene carrito guardado, guardar el actual
        this.saveCartForUser(userId)
      }
    }
  },

  /**
   * Calcular total del carrito
   */
  calculateCartTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      // Validar que price y quantity sean números válidos
      const price = typeof item.price === 'number' && !isNaN(item.price) ? item.price : 0
      const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 0
      return total + (price * quantity)
    }, 0)
  },

  /**
   * Limpiar carrito de items con datos inválidos
   */
  cleanCart(): void {
    if (!isBrowser()) return
    
    const cart = this.getCart()
    const validItems = cart.items.filter(item => {
      return item.product_id && 
             item.product_name && 
             typeof item.quantity === 'number' && 
             item.quantity > 0 &&
             typeof item.price === 'number' && 
             item.price > 0
    })
    
    if (validItems.length !== cart.items.length) {
      console.warn(`Eliminados ${cart.items.length - validItems.length} items inválidos del carrito`)
      window.localStorage.setItem(CART_KEY, JSON.stringify({
        items: validItems,
        timestamp: Date.now()
      }))
      window.dispatchEvent(new Event("cart-updated"))
    }
  },

  /**
   * Obtener resumen completo del carrito con totales (versión síncrona)
   */
  getCartSummarySync(): { items: CartItem[], subtotal: number, total: number, itemCount: number } {
    // Limpiar carrito antes de calcular
    this.cleanCart()
    
    const cart = this.getCart()
    const subtotal = this.calculateCartTotal(cart.items)
    const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0)
    
    return {
      items: cart.items,
      subtotal,
      total: subtotal, // Por ahora igual al subtotal, después se pueden agregar impuestos/descuentos
      itemCount
    }
  },

  /**
   * Guardar carrito temporal antes de redirigir a Mercado Pago
   * Permite recuperar el carrito si el usuario no completa el pago
   */
  saveTemporaryCart(): void {
    if (!isBrowser()) return
    
    const cart = this.getCart()
    const tempCart: StoredCart = {
      items: cart.items,
      timestamp: Date.now()
    }
    
    try {
      window.localStorage.setItem(TEMP_CART_KEY, JSON.stringify(tempCart))
      console.log('💾 Carrito temporal guardado antes de Mercado Pago')
    } catch (error) {
      console.error('Error guardando carrito temporal:', error)
    }
  },

  /**
   * Recuperar carrito temporal si existe y no ha expirado
   */
  getTemporaryCart(): StoredCart | null {
    if (!isBrowser()) return null
    
    try {
      const json = window.localStorage.getItem(TEMP_CART_KEY)
      if (!json) return null
      
      const cart = JSON.parse(json) as StoredCart
      
      // Verificar si ha expirado (1 hora)
      if (Date.now() - cart.timestamp > TEMP_CART_EXPIRATION_MS) {
        console.log('⏰ Carrito temporal expirado')
        window.localStorage.removeItem(TEMP_CART_KEY)
        return null
      }
      
      console.log('✅ Carrito temporal recuperado')
      return cart
    } catch (error) {
      console.error('Error recuperando carrito temporal:', error)
      return null
    }
  },

  /**
   * Restaurar carrito temporal al carrito actual
   */
  restoreTemporaryCart(): boolean {
    if (!isBrowser()) return false
    
    const tempCart = this.getTemporaryCart()
    if (!tempCart || tempCart.items.length === 0) {
      return false
    }
    
    try {
      this.saveCart(tempCart.items)
      window.dispatchEvent(new Event("cart-updated"))
      console.log('🔄 Carrito restaurado desde carrito temporal')
      return true
    } catch (error) {
      console.error('Error restaurando carrito temporal:', error)
      return false
    }
  },

  /**
   * Limpiar carrito temporal después de pago exitoso
   */
  clearTemporaryCart(): void {
    if (!isBrowser()) return
    
    try {
      window.localStorage.removeItem(TEMP_CART_KEY)
      console.log('🗑️ Carrito temporal eliminado después de pago exitoso')
    } catch (error) {
      console.error('Error limpiando carrito temporal:', error)
    }
  },

  /**
   * Verificar si existe un carrito temporal válido (para decidir si mostrar notificación de restauración)
   */
  hasValidTemporaryCart(): boolean {
    const tempCart = this.getTemporaryCart()
    return tempCart !== null && tempCart.items.length > 0
  }
} 