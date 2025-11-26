import { z } from 'zod'

// Esquemas de validación para categorías
export const categoryIdSchema = z.string().uuid()

export const createCategorySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
  parent_id: z.string().uuid().nullable().optional(),
  image: z.string().url().optional(),
  featured: z.boolean().optional()
})

export const updateCategorySchema = createCategorySchema.partial()

// Esquemas de validación para productos
export const productIdSchema = z.string().uuid()

export const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  category_id: z.string().uuid(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  image: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional().nullable(),
  scientificName: z.string().min(3).max(100),
  care: z.string().min(10),
  characteristics: z.string().min(10),
  origin: z.string().min(3),
  featured: z.boolean().optional()
})

export const updateProductSchema = createProductSchema.partial()

// Esquemas de validación para administradores
export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(3).max(100),
  role: z.enum(['admin'])
})

export const updateAdminSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  password: z.string().min(8).optional(),
  is_active: z.boolean().optional()
})

// Esquemas de validación para pedidos
export const shippingAddressSchema = z.object({
  street: z.string().min(5).max(100),
  number: z.string().min(1).max(10),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  zip: z.string().min(4).max(10),
  additional_info: z.string().max(200).optional()
})

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  unit_price: z.number().positive()
})

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  shipping_address: shippingAddressSchema,
  payment_method: z.enum(['cash', 'transfer', 'card']),
  customer_email: z.string().email(),
  customer_name: z.string().min(3).max(100),
  customer_phone: z.string().min(8).max(15),
  notes: z.string().max(500).optional()
})

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  notes: z.string().max(500).optional()
})

// Esquemas de validación para búsqueda y paginación
export const searchQuerySchema = z.string().min(2).max(100)

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  // Aumentamos el máximo permitido para soportar listados grandes (ej. panel de administración de productos)
  // sin cortar los resultados en 20/100 elementos.
  limit: z.number().int().min(1).max(10000)
})

export const priceRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().positive()
}).refine(data => data.max > data.min, {
  message: "El precio máximo debe ser mayor que el mínimo"
}) 

// Schema para activity logs
export const activityLogSchema = z.object({
  user_id: z.string().uuid(),
  action: z.string().min(1),
  entity_type: z.string().min(1),
  entity_id: z.string().min(1),
  details: z.record(z.any()).optional()
})

export const validateActivityLogData = (data: unknown) => {
  return activityLogSchema.parse(data)
} 