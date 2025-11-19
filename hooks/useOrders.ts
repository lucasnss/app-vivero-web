"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

type OrderSummary = {
  id: string
  status: string
  total_amount: number
  created_at: string
  payment_status?: string | null
  customer_email?: string | null
}

type UseOrdersState = {
  orders: OrderSummary[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
}

type ListParams = {
  page?: number
  limit?: number
  status?: string
  email?: string
}

export function useOrders() {
  const [state, setState] = useState<UseOrdersState>({
    orders: [],
    loading: false,
    error: null,
    page: 1,
    totalPages: 1,
  })

  const list = useCallback(async (params: ListParams = {}) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const url = new URL("/api/orders", window.location.origin)
      if (params.page) url.searchParams.set("page", String(params.page))
      if (params.limit) url.searchParams.set("limit", String(params.limit))
      if (params.status) url.searchParams.set("status", params.status)
      if (params.email) url.searchParams.set("email", params.email)

      const res = await fetch(url.toString(), { credentials: "include" })
      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || json.error || "Error listando pedidos")
      }
      const { orders, pagination } = json.data || json
      setState(prev => ({
        ...prev,
        loading: false,
        orders: Array.isArray(orders) ? orders : [],
        page: pagination?.page || 1,
        totalPages: pagination?.totalPages || 1,
      }))
    } catch (e) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: e instanceof Error ? e.message : "Error desconocido",
      }))
    }
  }, [])

  const getById = useCallback(async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { credentials: "include" })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json?.error?.message || json.error || "Error obteniendo pedido")
    }
    return json.data
  }, [])

  const create = useCallback(async (payload: any) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json?.error?.message || json.error || "Error creando pedido")
    }
    return json.data
  }, [])

  const updateStatus = useCallback(async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json?.error?.message || json.error || "Error actualizando estado")
    }
    return json.data
  }, [])

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json?.error?.message || json.error || "Error eliminando pedido")
    }
    return json.data
  }, [])

  return useMemo(() => ({
    ...state,
    list,
    getById,
    create,
    updateStatus,
    remove,
  }), [state, list, getById, create, updateStatus, remove])
}


