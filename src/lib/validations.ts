import { z } from 'zod'

// 🔵 PRODUCT VALIDATION SCHEMAS
export const createProductSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no debe exceder 100 caracteres'),
  
  description: z.string()
    .min(1, 'La descripción es requerida')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no debe exceder 1000 caracteres'),
  
  category_id: z.string()
    .uuid('ID de categoría inválido'),
  
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(999999, 'El precio no debe exceder $999,999'),
  
  stock: z.number()
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .max(9999, 'El stock no debe exceder 9999 unidades'),
  
  image: z.string().optional().nullable(),
  
  images: z.array(z.string()).optional().nullable(),
  
  scientificName: z.string()
    .min(1, 'El nombre científico es requerido')
    .max(100, 'El nombre científico no debe exceder 100 caracteres'),
  
  care: z.string()
    .min(1, 'Los cuidados son requeridos')
    .max(1000, 'Los cuidados no deben exceder 1000 caracteres'),
  
  characteristics: z.string()
    .min(1, 'Las características son requeridas')
    .max(1000, 'Las características no deben exceder 1000 caracteres'),
  
  origin: z.string()
    .min(1, 'El origen es requerido')
    .max(100, 'El origen no debe exceder 100 caracteres'),
  
  featured: z.boolean().default(false)
})

export const updateProductSchema = createProductSchema.partial()

export const productIdSchema = z.string().uuid('ID de producto inválido')

// 🟢 CATEGORY VALIDATION SCHEMAS
export const createCategorySchema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no debe exceder 50 caracteres'),
  
  description: z.string()
    .min(1, 'La descripción es requerida')
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(500, 'La descripción no debe exceder 500 caracteres'),
  
  icon: z.string()
    .min(1, 'El icono es requerido')
    .max(50, 'El icono no debe exceder 50 caracteres'),
  
  color: z.string()
    .min(1, 'El color es requerido')
    .refine((val) => 
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val) || val.includes('bg-') || val.includes('text-'),
      'El color debe ser un código hexadecimal válido o clase de Tailwind'
    ),
  
  slug: z.string()
    .min(1, 'El slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .max(50, 'El slug no debe exceder 50 caracteres'),
  
  parent_id: z.string().uuid().optional().nullable(),
  
  image: z.string()
    .refine((val) => 
      !val || val.startsWith('http') || val.startsWith('/') || val.startsWith('./'),
      'La imagen debe ser una URL válida o ruta de archivo'
    )
    .optional()
    .nullable(),
  
  featured: z.boolean().default(false)
})

export const updateCategorySchema = createCategorySchema.partial()

export const categoryIdSchema = z.string().uuid('ID de categoría inválido')

// 🟡 ACTIVITY LOG VALIDATION SCHEMAS
export const activityActionSchema = z.enum([
  'product_created',
  'product_updated', 
  'product_deleted',
  'category_created',
  'category_updated',
  'category_deleted',
  'order_created',
  'order_updated',
  'user_login',
  'user_logout',
  'cart_item_added',
  'cart_item_removed',
  'cart_cleared'
], {
  errorMap: () => ({ message: 'Acción de actividad inválida' })
})

export const entityTypeSchema = z.enum([
  'product',
  'category',
  'order',
  'user',
  'cart'
], {
  errorMap: () => ({ message: 'Tipo de entidad inválido' })
})

export const createActivityLogSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  
  action: activityActionSchema,
  
  entity_type: entityTypeSchema,
  
  entity_id: z.string()
    .min(1, 'El ID de entidad es requerido'),
  
  details: z.record(z.any()).default({})
})

// 🛒 CART VALIDATION SCHEMAS
export const cartItemSchema = z.object({
  id: z.string().uuid('ID de producto inválido'),
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser al menos 1')
    .max(15, 'No puedes agregar más de 15 unidades del mismo producto')
})

export const addToCartSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser al menos 1')
    .max(15, 'No puedes agregar más de 15 unidades del mismo producto')
    .default(1)
})

// 🔍 SEARCH AND FILTER SCHEMAS
export const searchQuerySchema = z.string()
  .min(1, 'La búsqueda no puede estar vacía')
  .max(100, 'La búsqueda no debe exceder 100 caracteres')
  .regex(/^[a-zA-Z0-9\s\-\.áéíóúñÁÉÍÓÚÑ]+$/, 'La búsqueda contiene caracteres inválidos')

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

export const priceRangeSchema = z.object({
  min: z.number().min(0).optional(),
  max: z.number().min(0).optional()
}).refine(data => {
  if (data.min !== undefined && data.max !== undefined) {
    return data.min <= data.max
  }
  return true
}, {
  message: 'El precio mínimo debe ser menor o igual al precio máximo'
})

// 📊 UTILITY VALIDATION FUNCTIONS
export const validateProductData = (data: unknown) => {
  return createProductSchema.parse(data)
}

export const validateUpdateProductData = (data: unknown) => {
  return updateProductSchema.parse(data)
}

export const validateCategoryData = (data: unknown) => {
  return createCategorySchema.parse(data)
}

export const validateUpdateCategoryData = (data: unknown) => {
  return updateCategorySchema.parse(data)
}

export const validateActivityLogData = (data: unknown) => {
  return createActivityLogSchema.parse(data)
}

export const validateCartItem = (data: unknown) => {
  return cartItemSchema.parse(data)
}

export const validateSearchQuery = (query: unknown) => {
  return searchQuerySchema.parse(query)
}

// 🔐 ADMIN AUTHENTICATION VALIDATION SCHEMAS
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'El email no debe exceder 255 caracteres'),
  
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(128, 'La contraseña no debe exceder 128 caracteres')
})

export const createAdminSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido')
    .max(255, 'El email no debe exceder 255 caracteres'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no debe exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número'),
  
  name: z.string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no debe exceder 100 caracteres'),
  
  role: z.enum(['admin'], {
        errorMap: () => ({ message: 'El rol debe ser admin' })
  }).optional()
})

export const updateAdminSchema = createAdminSchema.partial().omit({ password: true }).extend({
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña no debe exceder 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      'La contraseña debe contener al menos una minúscula, una mayúscula y un número')
    .optional(),
  
  is_active: z.boolean().optional()
})

export const adminIdSchema = z.string().uuid('ID de administrador inválido')

// UTILITY VALIDATION FUNCTIONS para ADMIN
export const validateLoginData = (data: unknown) => {
  return loginSchema.parse(data)
}

export const validateCreateAdminData = (data: unknown) => {
  return createAdminSchema.parse(data)
}

export const validateUpdateAdminData = (data: unknown) => {
  return updateAdminSchema.parse(data)
}

// 🛡️ SAFE VALIDATION HELPERS (return { success, data, error })
export const safeValidateProduct = (data: unknown) => {
  return createProductSchema.safeParse(data)
}

export const safeValidateCategory = (data: unknown) => {
  return createCategorySchema.safeParse(data)
}

export const safeValidateActivityLog = (data: unknown) => {
  return createActivityLogSchema.safeParse(data)
}

export const safeValidateCartItem = (data: unknown) => {
  return cartItemSchema.safeParse(data)
}

// 📋 NOTA: Todos los schemas ya están exportados individualmente arriba
// No es necesario un bloque de export adicional para evitar duplicaciones 

// Nuevo schema para API imágenes
export const ImageApiSchema = z.object({
  productId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const DeleteImagesSchema = ImageApiSchema.extend({
  urls: z.array(z.string().url()).min(1).max(10),
}).refine(urls => urls.every(url => url.includes('product-images')), {
  message: 'URLs deben ser de bucket product-images',
});

export const UpdateImagesSchema = z.object({
  productId: z.string().uuid(),
  images: z.array(z.string().url()).max(3).min(0),
}).refine(images => images.every(img => img.includes('product-images')), {
  message: 'Imágenes deben ser de bucket válido',
}); 