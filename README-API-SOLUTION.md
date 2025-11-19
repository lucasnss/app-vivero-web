# Solución: API Routes para Persistencia de Datos

## 🚨 **Problema Resuelto**

**Error:** `Module not found: Can't resolve 'fs'`

**Causa:** Intentábamos usar módulos de Node.js (`fs`, `path`) en el lado del cliente, pero estos solo funcionan en el servidor.

## ✅ **Solución Implementada**

### **Arquitectura API Routes**

```txt
Cliente (Frontend)          Servidor (API Routes)          Archivo JSON
     ↓                           ↓                           ↓
lib/products.ts    →    app/api/products/route.ts    →    data/products.json
```

### **Flujo de Datos**

```txt
1. Cliente hace fetch() a /api/products
2. API Route ejecuta en servidor (puede usar fs)
3. Servidor lee/escribe data/products.json
4. Servidor responde con JSON
5. Cliente recibe datos
```

## 📁 **Archivos Creados/Modificados**

### **1. API Routes (Servidor)**

#### **`app/api/products/route.ts`**

```typescript
// Endpoints principales
GET    /api/products              // Todos los productos
GET    /api/products?featured=true // Productos destacados
GET    /api/products?category=X   // Por categoría
GET    /api/products?search=X     // Búsqueda
GET    /api/products?id=X         // Producto específico
POST   /api/products              // Crear producto
PUT    /api/products              // Actualizar producto
DELETE /api/products?id=X         // Eliminar producto
```

#### **`app/api/products/stock/route.ts`**

```typescript
PATCH  /api/products/stock        // Actualizar stock
```

### **2. Cliente (Frontend)**

#### **`lib/products.ts`** - Actualizado

```typescript
// Ahora usa fetch() en lugar de repositorio directo
export async function getAllProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')
  return response.json()
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const response = await fetch('/api/products', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data })
  })
  return response.json()
}
```

### **3. Eliminado**
- ❌ `lib/database/products.ts` - Causaba el error de `fs`

## 🎯 **Ventajas de esta Solución**

### ✅ **Separación Cliente/Servidor**
- **Cliente:** Solo usa `fetch()` (compatible con navegador)
- **Servidor:** Usa `fs` y `path` (módulos de Node.js)

### ✅ **Persistencia Real**
- Los cambios se guardan en `data/products.json`
- Sobreviven reinicios del servidor
- Datos consistentes entre sesiones

### ✅ **API RESTful**
- Endpoints estándar (GET, POST, PUT, DELETE)
- Fácil de testear y documentar
- Preparado para futuras integraciones

### ✅ **Manejo de Errores**
- Respuestas HTTP apropiadas (200, 201, 404, 500)
- Mensajes de error descriptivos
- Validaciones en el servidor

## 🔧 **Cómo Funciona**

### **1. Carga Inicial**
```typescript
// Al iniciar el servidor
class ProductService {
  constructor() {
    this.loadProducts() // Lee data/products.json
  }
}
```

### **2. Operaciones CRUD**
```typescript
// Cliente
await updateProduct("1", { price: 3000 })

// Servidor (API Route)
export async function PUT(request: NextRequest) {
  const { id, ...data } = await request.json()
  const updated = productService.update(id, data)
  return NextResponse.json(updated)
}
```

### **3. Persistencia**
```typescript
// Servidor
private saveProducts() {
  writeFileSync(this.dataFile, JSON.stringify(this.products, null, 2))
}
```

## 🚀 **Endpoints Disponibles**

### **Productos**
| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/products` | Todos los productos |
| GET | `/api/products?featured=true` | Productos destacados |
| GET | `/api/products?category=Plantas` | Por categoría |
| GET | `/api/products?search=monstera` | Búsqueda |
| GET | `/api/products?id=1` | Producto específico |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products` | Actualizar producto |
| DELETE | `/api/products?id=1` | Eliminar producto |

### **Stock**
| Método | URL | Descripción |
|--------|-----|-------------|
| PATCH | `/api/products/stock` | Actualizar stock |

## 🧪 **Pruebas**

### **1. Probar API directamente**
```bash
# Obtener todos los productos
curl http://localhost:3000/api/products

# Obtener productos destacados
curl http://localhost:3000/api/products?featured=true

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo Producto","price":1000}'
```

### **2. Probar desde el frontend**
1. Ve a `/admin`
2. Modifica un producto
3. Guarda cambios
4. Ve a `/` y recarga
5. Verifica que los cambios persisten

## 📊 **Datos Iniciales**

El sistema crea automáticamente 3 productos iniciales:
- **Monstera Deliciosa** (Plantas de interior, destacado)
- **Ficus Lyrata** (Plantas de interior, destacado)
- **Lavanda** (Plantas con flores, destacado)

## 🔮 **Próximos Pasos**

### **Base de Datos Real**
```typescript
// Fácil migración
class DatabaseProductService {
  async getAll(): Promise<Product[]> {
    return await prisma.product.findMany()
  }
}
```

### **Validaciones**
```typescript
// Agregar validaciones en API routes
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  // ...
})
```

### **Autenticación**
```typescript
// Proteger endpoints de admin
export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  // ...
}
```

---

**¡Problema resuelto! El sistema funciona correctamente con persistencia de datos.** 🎉 