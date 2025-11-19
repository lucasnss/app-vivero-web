"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { orderService } from '@/services/orderService'
import { calculateOrderStats, toUiState, PaymentStatus, FulfillmentStatus, ShippingMethod } from '@/src/lib/orderStatus'
import { StatusBadge } from '@/components/StatusBadge'
import { OrderDetailModal, OrderDetail } from '@/components/OrderDetailModal'
import { OrderCompletionToggle } from '@/components/OrderCompletionToggle'
import { 
  Filter,
  Search,
  Calendar,
  Download,
  RefreshCw,
  Shield,
  Home,
  User,
  LogOut,
  TreePine
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// =============================================================================
// 📊 TIPOS Y INTERFACES
// =============================================================================

// Tipo para las órdenes que vienen del servicio y el estado local
interface ServiceOrder {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total_amount: number
  created_at: string
  payment_id?: string
  metodo_pago?: string
  admin_notes?: string
  status?: string
  shipping_address?: any
  payment_method?: string
  items?: any[]
  external_reference?: string
  shipping_method: ShippingMethod
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus
  payment_source?: 'real' | 'test'
}

// No usamos la interfaz Order importada

interface OrderStats {
  state: string
  count: number
  totalAmount: number
  percentage: number
}

interface FilterOptions {
  uiState: string
  paymentStatus: string
  fulfillmentStatus: string
  shippingMethod: string
  dateFrom: string
  dateTo: string
  searchTerm: string
}

// =============================================================================
// 🚀 PÁGINA PRINCIPAL
// =============================================================================

export default function SalesHistoryPage() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const { toast } = useToast()
  
  console.log('🔍 Component rendered with:', { user: !!user, authLoading, isLoading: undefined })
  
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([])
  const [stats, setStats] = useState<OrderStats[]>([])
  const [isLoading, setOrdersLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [filters, setFilters] = useState<FilterOptions>({
    uiState: '',
    paymentStatus: '',
    fulfillmentStatus: '',
    shippingMethod: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  })
  
  console.log('🔍 States initialized:', { 
    ordersLength: orders.length, 
    filteredOrdersLength: filteredOrders.length,
    statsLength: stats.length,
    isLoading,
    currentPage,
    totalPages
  })

  // =============================================================================
  // 🔄 EFECTOS Y CARGA DE DATOS
  // =============================================================================

  useEffect(() => {
    console.log('useEffect 1 - Auth state changed:', { authLoading, user: !!user, isLoading })
    if (!authLoading && user) {
      console.log('✅ Condition met - Loading orders...')
      loadOrders()
    } else {
      console.log('❌ Condition not met:', { 
        notLoading: !authLoading, 
        hasUser: !!user,
        reason: authLoading ? 'authLoading is true' : !user ? 'no user' : 'unknown'
      })
    }
  }, [authLoading, user, currentPage])

  useEffect(() => {
    console.log('🔄 useEffect 2 - Orders or filters changed:', { ordersLength: orders.length, filters })
    if (orders.length > 0) {
      console.log('🔍 Applying filters to', orders.length, 'orders')
      applyFilters()
    }
  }, [filters, orders])

  const loadOrders = async () => {
    try {
      console.log('🚀 Starting to load orders...')
      setOrdersLoading(true)
      const response = await orderService.getAllOrders({
        page: currentPage,
        limit: 20, // Cambiado a 20 órdenes por página
        status: undefined,
        email: undefined
      })
      
      console.log('📦 Orders loaded:', response)
      // Asegurarnos de que las órdenes tengan los tipos correctos
      const typedOrders: ServiceOrder[] = response.orders.map(order => {
        // Convertir explícitamente los campos para evitar errores de tipo
        const typedOrder: ServiceOrder = {
          id: order.id,
          customer_name: order.customer_name || '',
          customer_email: order.customer_email || '',
          customer_phone: order.customer_phone || '',
          total_amount: order.total_amount,
          created_at: order.created_at,
          payment_id: order.payment_id,
          metodo_pago: order.metodo_pago,
          admin_notes: order.admin_notes || '',
          status: order.status,
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          items: order.items || [],
          external_reference: order.external_reference,
          shipping_method: (order.shipping_method || 'delivery') as ShippingMethod,
          payment_status: (order.payment_status || 'pending') as PaymentStatus,
          fulfillment_status: (order.fulfillment_status || 'awaiting_shipment') as FulfillmentStatus,
          payment_source: (order as any).payment_source || 'real'
        };
        return typedOrder;
      });
      
      setOrders(typedOrders)
      setTotalPages(response.pagination.totalPages)
      
      // Calcular estadísticas
      const ordersForStats = typedOrders.map(order => ({
        payment_status: order.payment_status,
        fulfillment_status: order.fulfillment_status,
        total_amount: order.total_amount
      }))
      const orderStats = calculateOrderStats(ordersForStats)
      console.log('📊 Order stats calculated:', orderStats)
      setStats(orderStats)
      
    } catch (error) {
      console.error('❌ Error loading orders:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes",
        variant: "destructive"
      })
    } finally {
      console.log('✅ Setting isLoading to false')
      setOrdersLoading(false)
    }
  }

  // =============================================================================
  // 🔍 FILTRADO Y BÚSQUEDA
  // =============================================================================

  const applyFilters = () => {
    console.log('🔍 Starting to apply filters...')
    let filtered = [...orders]

    // Filtro por estado UI
    if (filters.uiState) {
      filtered = filtered.filter(order => {
        const uiState = toUiState(order.payment_status, order.fulfillment_status)
        return uiState === filters.uiState
      })
    }

    // Filtro por estado de pago
    if (filters.paymentStatus) {
      filtered = filtered.filter(order => order.payment_status === filters.paymentStatus)
    }

    // Filtro por estado logístico
    if (filters.fulfillmentStatus) {
      filtered = filtered.filter(order => order.fulfillment_status === filters.fulfillmentStatus)
    }

    // Filtro por método de envío
    if (filters.shippingMethod) {
      filtered = filtered.filter(order => order.shipping_method === filters.shippingMethod)
    }

    // Filtro por rango de fechas
    if (filters.dateFrom) {
      filtered = filtered.filter(order => new Date(order.created_at) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(order => new Date(order.created_at) <= new Date(filters.dateTo))
    }

    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(order => 
        (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
        (order.customer_email && order.customer_email.toLowerCase().includes(searchLower)) ||
        order.id.toLowerCase().includes(searchLower) ||
        (order.payment_id && order.payment_id.toLowerCase().includes(searchLower))
      )
    }

    console.log('✅ Filters applied, filtered orders:', filtered.length)
    setFilteredOrders(filtered)
  }

  const clearFilters = () => {
    setFilters({
      uiState: '',
      paymentStatus: '',
      fulfillmentStatus: '',
      shippingMethod: '',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    })
  }

  // =============================================================================
  // 📋 VER DETALLE DE ORDEN
  // =============================================================================
  
  const handleViewDetail = async (orderId: string) => {
    try {
      console.log('🖱️ [handleViewDetail] Click en "Ver Detalle" para orden:', orderId)
      setOrdersLoading(true)
      
      // Resetear estado anterior
      setSelectedOrder(null)
      setIsModalOpen(false)
      
      console.log('⏳ [handleViewDetail] Cargando detalle...')
      const orderDetail = await orderService.getOrderDetailForModal(orderId)
      
      console.log('📦 [handleViewDetail] Detalle recibido:', {
        id: orderDetail?.id,
        customer: orderDetail?.customer_name,
        items: orderDetail?.items?.length
      })
      
      if (!orderDetail) {
        console.error('❌ [handleViewDetail] Detalle es null')
        toast({
          title: "Error",
          description: "No se pudo cargar el detalle de la orden",
          variant: "destructive"
        })
        return
      }
      
      console.log('✅ [handleViewDetail] Seteando estado y abriendo modal')
      setSelectedOrder(orderDetail)
      setIsModalOpen(true)
      
      console.log('✅ [handleViewDetail] Modal abierto con datos:', {
        id: orderDetail.id,
        customer: orderDetail.customer_name
      })
    } catch (error) {
      console.error('❌ [handleViewDetail] Error cargando detalle de orden:', error)
      toast({
        title: "Error",
        description: "No se pudo cargar el detalle de la orden",
        variant: "destructive"
      })
    } finally {
      setOrdersLoading(false)
    }
  }

  // =============================================================================
  // 📊 FUNCIONES DE EXPORTACIÓN
  // =============================================================================

  const exportToCSV = () => {
    const headers = [
      'ID', 'Cliente', 'Email', 'Teléfono', 'Monto Total', 
      'Estado Pago', 'Estado Logístico', 'Método Envío', 'Fecha Creación'
    ]
    
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        order.id,
        `"${order.customer_name || 'Sin nombre'}"`,
        order.customer_email || 'Sin email',
        order.customer_phone || 'Sin teléfono',
        order.total_amount,
        order.payment_status,
        order.fulfillment_status,
        order.shipping_method,
        new Date(order.created_at).toLocaleDateString('es-ES')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historial-ventas-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Manejar logout
  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  // =============================================================================
  // 🚫 PROTECCIÓN DE RUTA
  // =============================================================================

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">Debes iniciar sesión como administrador para acceder a esta página.</p>
        </div>
      </div>
    )
  }

  // =============================================================================
  // 🎨 RENDERIZADO
  // =============================================================================

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Ventas</h1>
            <p className="text-gray-600">Gestiona y visualiza todas las órdenes del sistema</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = "/"} className="flex items-center text-green-900 font-semibold py-2 px-4 rounded hover:bg-green-100">
              <Home className="h-5 w-5 mr-2" /> Inicio
            </button>
            
            {/* Botón de menú de usuario */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Panel de Administrador
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Administrador
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/admin/sales-history'}>
                  <TreePine className="h-4 w-4 mr-2" />
                  Historial
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.location.href = '/admin'}>
                  <Shield className="h-4 w-4 mr-2" />
                  Panel de Administrador
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.state} className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-black">{stat.count}</div>
              <div className="text-sm text-black">{stat.state}</div>
              <div className="text-xs text-black">
                ${stat.totalAmount.toLocaleString()} ({stat.percentage.toFixed(1)}%)
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Estado UI */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Estado General
              </label>
              <Select value={filters.uiState} onValueChange={(value) => setFilters(prev => ({ ...prev, uiState: value }))}>
                <SelectTrigger className="text-black">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-black">Todos los estados</SelectItem>
                  <SelectItem value="Completado" className="text-black">Completado</SelectItem>
                  <SelectItem value="Pago OK · Envío pendiente" className="text-black">Pago OK · Envío pendiente</SelectItem>
                  <SelectItem value="Pago OK · Listo para retirar" className="text-black">Pago OK · Listo para retirar</SelectItem>
                  <SelectItem value="Pendiente" className="text-black">Pendiente</SelectItem>
                  <SelectItem value="Rechazado" className="text-black">Rechazado</SelectItem>
                  <SelectItem value="Cancelado" className="text-black">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado de Pago */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Estado de Pago
              </label>
              <Select value={filters.paymentStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value }))}>
                <SelectTrigger className="text-black">
                  <SelectValue placeholder="Todos los pagos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-black">Todos los pagos</SelectItem>
                  <SelectItem value="pending" className="text-black">Pendiente</SelectItem>
                  <SelectItem value="approved" className="text-black">Aprobado</SelectItem>
                  <SelectItem value="rejected" className="text-black">Rechazado</SelectItem>
                  <SelectItem value="cancelled" className="text-black">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Método de Envío */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Forma de entrega
              </label>
              <Select value={filters.shippingMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, shippingMethod: value }))}>
                <SelectTrigger className="text-black">
                  <SelectValue placeholder="Todos los métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-black">Todos los métodos</SelectItem>
                  <SelectItem value="delivery" className="text-black">Domicilio</SelectItem>
                  <SelectItem value="pickup" className="text-black">Retiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Búsqueda
              </label>
              <Input
                placeholder="Cliente, email, ID..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="text-black"
              />
            </div>
          </div>

          {/* Filtros de fecha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Desde
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Hasta
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="text-black"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline" className="text-black">
              Limpiar Filtros
            </Button>
            <Button onClick={loadOrders} variant="outline" className="text-black">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="text-black">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Órdenes */}
      <Card>
        <CardHeader>
          <CardTitle>
            Órdenes ({filteredOrders.length} de {orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">Estado</TableHead>
                    <TableHead className="text-black">Completado</TableHead>
                    <TableHead className="text-black">Cliente</TableHead>
                    <TableHead className="text-black">Tipo</TableHead>
                    <TableHead className="text-black">Monto</TableHead>
                    <TableHead className="text-black">Forma de entrega</TableHead>
                    <TableHead className="text-black hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="text-black hidden md:table-cell">ID Pago</TableHead>
                    <TableHead className="text-black">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <StatusBadge 
                          paymentStatus={order.payment_status} 
                          fulfillmentStatus={order.fulfillment_status} 
                        />
                      </TableCell>
                      <TableCell>
                        <OrderCompletionToggle
                          orderId={order.id}
                          paymentStatus={order.payment_status}
                          fulfillmentStatus={order.fulfillment_status}
                          shippingMethod={order.shipping_method}
                          onStatusChange={loadOrders}
                          variant="checkbox"
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-black">{order.customer_name || 'Sin nombre'}</div>
                          <div className="text-sm text-black">{order.customer_email || 'Sin email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.payment_source === 'test' ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            🧪 TEST
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                            ✅ REAL
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-black">
                        ${order.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.shipping_method === 'delivery' ? 'default' : 'secondary'} className="text-black">
                          {order.shipping_method === 'delivery' ? 'Domicilio' : 'Retiro'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-black">
                        {new Date(order.created_at).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {order.payment_id ? (
                          <span className="text-sm font-mono text-black">
                            {order.payment_id.slice(-8)}...
                          </span>
                        ) : (
                          <span className="text-black">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetail(order.id)}
                          className="text-black"
                        >
                          Ver Detalle
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginación Mejorada */}
      {totalPages > 1 && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Información de páginas */}
              <div className="text-sm text-black">
                Mostrando página {currentPage} de {totalPages} 
                ({orders.length} órdenes de {orders.length * totalPages} total)
              </div>
              
              {/* Navegación */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {/* Botón Primera Página */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="text-black"
                >
                  Primera
                </Button>
                
                {/* Botón Anterior */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="text-black"
                >
                  Anterior
                </Button>
                
                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${currentPage === pageNum ? "" : "text-black"}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                {/* Botón Siguiente */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="text-black"
                >
                  Siguiente
                </Button>
                
                {/* Botón Última Página */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="text-black"
                >
                  Última
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Modal de detalle de orden */}
      <OrderDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        order={selectedOrder}
        onOrderUpdate={() => {
          // Refrescar la lista de órdenes al actualizar el estado
          loadOrders()
        }}
      />
    </div>
  )
}
