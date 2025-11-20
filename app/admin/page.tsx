"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getAllProducts, createProduct, updateProduct, deleteProduct, Product } from "@/lib/products"
import { ArrowLeft, Plus, Package, TrendingUp, AlertTriangle, CheckCircle, Upload, Image as ImageIcon, User, LogOut, X, Home, TreePine, Shield } from "lucide-react"
import { getAllCategories } from "@/lib/categories"
import { Category } from "@/data/categories"
import { useAuth } from "@/contexts/AuthContext"
import { useImageUpload } from "@/hooks/useImageUpload"
import { AdvancedImageUploader } from "@/components/ui/ImageUploader"
import { ImagePreview } from "@/components/ui/ImagePreview"
import { type ImagePreview as ImagePreviewType } from "@/types/product"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PLACEHOLDER_IMAGE = '/placeholder.jpg';

const emptyProduct: Omit<Product, 'id'> = {
  name: "",
  description: "",
  category_id: "",
  price: undefined as any,
  stock: undefined as any,
  images: [],
  scientificName: "",
  care: "",
  characteristics: "",
  origin: "",
  image: "",
  featured: false
}

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [page, setPage] = useState(1)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formChanged, setFormChanged] = useState(false)
  const [initialForm, setInitialForm] = useState<Omit<Product, 'id'>>(emptyProduct)
  const [isDeleting, setIsDeleting] = useState(false) // Estado para controlar si estamos eliminando una imagen
  const pageSize = 10

  // Redirigir a login si no hay autenticación después de cargar
  useEffect(() => {
    // ⏱️ Agregar delay para asegurar que authContext terminó de cargar
    if (!authLoading && !user) {
      // Dar 500ms extra para que termine de cargar el contexto
      const timeoutId = setTimeout(() => {
        console.log('🔄 Redirigiendo a login porque no hay usuario autenticado')
        console.log('📊 Estado actual:', { authLoading, user: !!user })
        // ✅ Usar window.location.href en lugar de router.push() para producción
        window.location.href = '/login?returnUrl=/admin'
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [authLoading, user])

  // Hook de gestión de imágenes
  const [imageState, imageActions] = useImageUpload({
    maxImages: 3,
    validateOnAdd: true,
    folder: 'products',
    onUploadStart: () => {
      console.log('🔄 Iniciando subida de imágenes...')
    },
    onUploadComplete: (urls) => {
      console.log('✅ Imágenes subidas exitosamente:', urls)
    },
    onUploadError: (error) => {
      console.error('❌ Error subiendo imágenes:', error)
      showNotification('error', `Error subiendo imágenes: ${error}`)
    }
  })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  // Callback memoizado para onImagesChange del AdvancedImageUploader
  const handleImagesChange = useCallback(async (files: File[]) => {
    try {
      await imageActions.addImages(files);
      if (files.length > 0) {
        showNotification('success', 'Imágenes agregadas correctamente');
      }
    } catch (error) {
      console.error('Error agregando imágenes:', error);
      showNotification('error', 'Error al agregar las imágenes');
    }
  }, [imageActions.addImages, showNotification]);

  // Callback memoizado para onDelete en ImagePreview
  const handleImageDelete = useCallback(async (url: string) => {
    try {
      setIsDeleting(true);
      console.log('Iniciando eliminación de imagen...');
      await imageActions.deleteExistingImage(url);
      showNotification('success', 'Imagen eliminada exitosamente');
      console.log('Imagen eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      showNotification('error', 'Error al eliminar la imagen');
    } finally {
      setIsDeleting(false);
      console.log('Proceso de eliminación finalizado');
    }
  }, [imageActions.deleteExistingImage, showNotification, setIsDeleting]);

  // Callback memoizado para onReorder en ImagePreview
  const handleImageReorder = useCallback((newOrder: ImagePreviewType[]) => {
    imageActions.reorderImages(newOrder);
  }, [imageActions.reorderImages]);

  // Callback memoizado para onSetMain en ImagePreview
  const handleSetMainImage = useCallback((url: string) => {
    const updated = imageState.existingImages.map(img => ({
      ...img,
      isMain: img.url === url
    }));
    imageActions.reorderImages(updated);
    showNotification('success', 'Imagen principal actualizada');
  }, [imageState.existingImages, imageActions.reorderImages, showNotification]);

  async function fetchData() {
    try {
      const [productsResponse, categoriesData] = await Promise.all([
        getAllProducts(true), // Incluir productos sin stock
        getAllCategories()
      ])
      
      // Ambas funciones ya retornan arrays directamente
      setProducts(Array.isArray(productsResponse) ? productsResponse : [])
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      
    } catch (error) {
      console.error('Error fetching data:', error)
      setProducts([])
      setCategories([])
      showNotification('error', 'Error al cargar los datos')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return // Prevenir doble envío
    
    try {
      setIsSubmitting(true)
      
      // Validar que haya al menos una imagen (nueva o existente)
      const totalImages = imageState.totalImages
      if (totalImages === 0) {
        showNotification('error', 'Debe agregar al menos una imagen al producto')
        return
      }
      
      // Validar imágenes nuevas si las hay
      if (imageState.images.length > 0) {
        const isValid = await imageActions.validateAll()
        if (!isValid) {
          showNotification('error', 'Hay errores en las imágenes seleccionadas')
          return
        }
      }
      
      // Subir imágenes nuevas si las hay
      let newImageUrls: string[] = []
      if (imageState.images.length > 0) {
        try {
          const productFolder = editing ? `products/${editing.id}` : `products/temp-${Date.now()}`
          newImageUrls = await imageActions.uploadImages(productFolder)
          console.log('✅ Nuevas imágenes subidas:', newImageUrls)
        } catch (uploadError) {
          console.error('❌ Error subiendo imágenes:', uploadError)
          showNotification('error', 'Error al subir las imágenes. Inténtalo de nuevo.')
          return
        }
      }
      
      // Combinar URLs existentes con nuevas
      const existingUrls = imageState.existingImages.map(img => img.url)
      const allImageUrls = [...existingUrls, ...newImageUrls]
      
      // Preparar datos del producto con imágenes
      const productData = {
        ...form,
        image: allImageUrls[0] || form.image, // Primera imagen como principal
        images: allImageUrls.length > 0 ? allImageUrls : (form.images || [])
      }
      
      // Guardar producto
      if (editing) {
        await updateProduct(editing.id, productData)
        showNotification('success', `Producto actualizado exitosamente con ${allImageUrls.length} imagen(es)`)
      } else {
        const newProduct = await createProduct(productData)
        showNotification('success', `Producto creado exitosamente con ${allImageUrls.length} imagen(es)`)
        
        // Si había un folder temporal, renombrarlo al ID real
        if (newImageUrls.length > 0 && newProduct && typeof newProduct === 'object' && 'id' in newProduct) {
          console.log('🔄 Producto creado con ID:', newProduct.id)
        }
      }
      
      // Limpiar estado
      handleCloseForm()
      fetchData()
      
      // Marcar el formulario como no cambiado después de guardar exitosamente
      setFormChanged(false)
      
    } catch (error) {
      console.error('Error saving product:', error)
      showNotification('error', `Error al ${editing ? 'actualizar' : 'crear'} el producto`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    try {
      await deleteProduct(id)
      showNotification('success', 'Producto eliminado exitosamente')
      fetchData()
    } catch (error) {
      console.error('Error deleting product:', error)
      showNotification('error', 'Error al eliminar el producto')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormChanged(true) // Marcar que el formulario ha cambiado
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(f => ({ ...f, [name]: checked }))
    } else {
      setForm(f => ({ ...f, [name]: name === 'price' || name === 'stock' ? Number(value) : value }))
    }
  }

  // Función para manejar cambios en imágenes (sin marcar formChanged)
  const handleImageChange = () => {
    // No marcar formChanged aquí, solo actualizar el estado de imágenes
    // El formulario se considerará "cambiado" cuando se intente guardar
  }

  // Función para marcar el formulario como cambiado cuando se modifiquen campos
  const markFormAsChanged = () => {
    setFormChanged(true)
  }

  const openAdd = () => {
    setEditing(null)
    setForm(emptyProduct)
    setInitialForm(emptyProduct)
    setFormChanged(false)
    // Limpiar estado de imágenes
    imageActions.resetState()
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    const { id, ...rest } = product
    setForm(rest)
    setInitialForm(rest)
    setFormChanged(false)
    
    // Configurar imágenes existentes
    const existingImages: ImagePreviewType[] = []
    
    // Agregar imagen principal si existe
    if (product.image && product.image !== '') {
      existingImages.push({
        url: product.image,
        isMain: true,
        order: 0
      })
    }
    
    // Agregar imágenes adicionales si existen
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imageUrl, index) => {
        // Evitar duplicar la imagen principal
        if (imageUrl && imageUrl !== product.image) {
          existingImages.push({
            url: imageUrl,
            isMain: false,
            order: existingImages.length
          })
        }
      })
    }
    
    // Configurar estado de imágenes
    imageActions.resetState()
    if (existingImages.length > 0) {
      imageActions.setExistingImages(existingImages)
    }
    
    setShowForm(true)
  }

  const closeForm = () => {
    handleCloseForm()
  }

  const confirmCloseForm = () => {
    // Si estamos en medio de una operación de eliminación de imagen, no cerrar el formulario
    if (isDeleting) {
      console.log('No se cerrará el formulario porque hay una operación de eliminación en curso');
      return;
    }
    
    // Verificar si hay cambios reales en el formulario o imágenes
    // Solo se considera "cambiado" si:
    // 1. Se modificaron campos del formulario (formChanged = true)
    // 2. Se agregaron nuevas imágenes (imageState.images.length > 0)
    // 3. Se modificó el número de imágenes existentes (comparando con el estado original)
    const hasFormChanges = formChanged
    const hasImageChanges = imageState.images.length > 0 || 
                           imageState.existingImages.length !== (editing ? 
                             (editing.image ? 1 : 0) + (editing.images?.length || 0) : 0)
    
    if (hasFormChanges || hasImageChanges) {
      const shouldClose = window.confirm('¿Salir sin guardar los cambios?')
      if (shouldClose) {
        handleCloseForm()
      }
    } else {
      handleCloseForm()
    }
  }
  
  const handleCloseForm = () => {
    // Si estamos en medio de una operación de eliminación de imagen, no cerrar el formulario
    if (isDeleting) {
      console.log('No se cerrará el formulario porque hay una operación de eliminación en curso');
      return;
    }
    
    console.log('Cerrando formulario...');
    setShowForm(false)
    setEditing(null)
    setForm(emptyProduct)
    setInitialForm(emptyProduct)
    setFormChanged(false)
    imageActions.resetState()
    setIsSubmitting(false)
    setNotification(null) // Limpiar notificaciones al cerrar
  }

  // Manejar logout
  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                         product.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || product.category_id === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize)

  // Estadísticas
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (el useEffect se encarga de redirigir)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
        {/* Notificación */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header con información del usuario */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = "/"} className="flex items-center text-green-900 font-semibold py-2 px-4 rounded hover:bg-green-100">
              <Home className="h-5 w-5 mr-2" /> Inicio
            </button>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
          
          <div className="flex items-center gap-4">
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

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
                <p className="text-xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Valor Total</h3>
                <p className="text-xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Stock Bajo</h3>
                <p className="text-xl font-bold text-gray-900">{lowStockProducts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Sin Stock</h3>
                <p className="text-xl font-bold text-gray-900">{outOfStockProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded-md"
              />
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={openAdd}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </button>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <img
                      src={product.image || PLACEHOLDER_IMAGE}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.scientificName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {categories.find(cat => cat.id === product.category_id)?.name || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">${product.price}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-gray-900">
                        {product.stock} unidades
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.stock === 0 ? 'bg-red-100 text-red-800' :
                        product.stock <= 5 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock === 0 ? 'Sin stock' :
                         product.stock <= 5 ? 'Stock bajo' : 'En stock'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => openEdit(product)} 
                        className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-1 px-3 rounded text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >Siguiente</button>
        </div>

        {/* Modal de formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editing ? 'Editar Producto' : 'Agregar Producto'}
                  </h2>
                  <button
                    onClick={confirmCloseForm}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Cerrar formulario"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Científico</label>
                      <input
                        type="text"
                        name="scientificName"
                        value={form.scientificName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                      <input
                        type="number"
                        name="price"
                        value={form.price || ''}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock || ''}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ImageIcon className="inline w-4 h-4 mr-2" />
                      Imágenes del Producto
                    </label>
                    <div className="space-y-4">
                      {/* Mostrar imágenes existentes */}
                      {imageState.existingImages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Imágenes actuales ({imageState.existingImages.length}/3)
                          </h4>
                          <ImagePreview
                            images={imageState.existingImages}
                            onDelete={handleImageDelete}
                            onReorder={handleImageReorder}
                            onSetMain={handleSetMainImage}
                          />
                        </div>
                      )}
                      
                      {/* Subidor de nuevas imágenes */}
                      {imageState.totalImages < 3 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">
                            {imageState.existingImages.length > 0 
                              ? `Agregar más imágenes (${3 - imageState.totalImages} restantes)`
                              : 'Agregar imágenes (máximo 3)'
                            }
                          </h4>
                          <AdvancedImageUploader
                            maxImages={3 - imageState.totalImages}
                            onImagesChange={handleImagesChange}
                            disabled={isSubmitting || imageState.uploading}
                          />
                        </div>
                      )}
                      
                      {/* Lista de imágenes pendientes de subir */}
                      {imageState.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Imágenes pendientes de subir ({imageState.images.length})
                          </h4>
                          <div className="space-y-2">
                            {imageState.images.map((image, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={image.preview} 
                                    alt={`Preview ${index + 1}`}
                                    className="w-12 h-12 object-cover rounded border"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{image.file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    {image.error && (
                                      <p className="text-xs text-red-600 mt-1">{image.error}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {image.uploading && (
                                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                      Subiendo...
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      try {
                                        // Marcar que estamos en proceso de modificación
                                        setIsDeleting(true);
                                        
                                        // Eliminar la imagen
                                        imageActions.removeImage(index)
                                      } finally {
                                        // Marcar que hemos terminado
                                        setIsDeleting(false);
                                      }
                                    }}
                                    disabled={image.uploading || isSubmitting}
                                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Estado e información */}
                      <div className="text-sm text-gray-600">
                        <p>Total de imágenes: {imageState.totalImages}/3</p>
                        {imageState.uploading && (
                          <p className="text-blue-600 font-medium mt-1">
                            <Upload className="inline w-4 h-4 mr-1" />
                            Subiendo imágenes... {imageState.uploadProgress}%
                          </p>
                        )}
                      </div>
                      
                      {/* Errores de imágenes */}
                      {imageState.errors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <h5 className="text-sm font-medium text-red-800 mb-1">Errores en imágenes:</h5>
                          <ul className="text-sm text-red-700 list-disc list-inside">
                            {imageState.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Advertencias */}
                      {imageState.warnings.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <h5 className="text-sm font-medium text-yellow-800 mb-1">Advertencias:</h5>
                          <ul className="text-sm text-yellow-700 list-disc list-inside">
                            {imageState.warnings.map((warning, index) => (
                              <li key={index}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuidados</label>
                    <textarea
                      name="care"
                      value={form.care}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Características</label>
                    <textarea
                      name="characteristics"
                      value={form.characteristics}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                    <input
                      type="text"
                      name="origin"
                      value={form.origin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={form.featured}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      Producto destacado
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <button type="button" onClick={confirmCloseForm} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded">Cancelar</button>
                    <button 
                  type="submit" 
                  disabled={isSubmitting || imageState.uploading || (imageState.totalImages === 0)}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded flex items-center gap-2"
                >
                  {isSubmitting || imageState.uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {imageState.uploading ? 'Subiendo imágenes...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editing ? 'Actualizar Producto' : 'Crear Producto'}
                    </>
                  )}
                </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
    </div>
  )
} 