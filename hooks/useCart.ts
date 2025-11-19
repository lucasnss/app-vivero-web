"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { CartItem } from "@/types/cartItem"
import {
  getCart as getStoredCart,
  addToCart as addToCartLocal,
  addToCartWithStockValidation,
  removeFromCart,
  clearCart as clearCartLocal,
  incrementQuantity,
  decrementQuantity
} from "@/lib/cart"

type UseCartState = {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  loading: boolean
  error: string | null
}

export function useCart() {
  const [state, setState] = useState<UseCartState>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
    loading: false,
    error: null
  })

  const recalc = useCallback((items: CartItem[]) => {
    const totalItems = items.reduce((s, i) => s + i.quantity, 0)
    const totalAmount = items.reduce((s, i) => s + (Number(i.price || 0) * i.quantity), 0)
    setState(prev => ({ ...prev, items, totalItems, totalAmount }))
  }, [])

  const load = useCallback(() => {
    const items = getStoredCart()
    recalc(items)
  }, [recalc])

  useEffect(() => {
    load()
    const onUpdate = () => load()
    window.addEventListener("cart-updated", onUpdate)
    window.addEventListener("storage", onUpdate)
    return () => {
      window.removeEventListener("cart-updated", onUpdate)
      window.removeEventListener("storage", onUpdate)
    }
  }, [load])

  const addItem = useCallback(async (item: CartItem) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const result = await addToCartWithStockValidation(item)
    if (!result.success) {
      setState(prev => ({ ...prev, loading: false, error: result.message }))
      return { success: false, message: result.message }
    }
    // El evento cart-updated disparará load()
    setState(prev => ({ ...prev, loading: false }))
    return { success: true, message: result.message }
  }, [])

  const addItemUnsafe = useCallback((item: CartItem) => {
    addToCartLocal(item)
  }, [])

  const removeItem = useCallback((productId: string) => {
    removeFromCart(productId)
  }, [])

  const clearCart = useCallback(() => {
    clearCartLocal()
  }, [])

  const increase = useCallback((productId: string) => {
    incrementQuantity(productId)
  }, [])

  const decrease = useCallback((productId: string) => {
    decrementQuantity(productId)
  }, [])

  const hasItems = state.totalItems > 0

  return useMemo(() => ({
    ...state,
    hasItems,
    addItem,
    addItemUnsafe,
    removeItem,
    clearCart,
    increase,
    decrease,
  }), [state, hasItems, addItem, addItemUnsafe, removeItem, clearCart, increase, decrease])
}


