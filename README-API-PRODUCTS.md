# 📋 API de Productos - Documentación Completa

Esta documentación describe la API REST completamente mejorada para la gestión de productos, que incluye validaciones robustas, paginación, filtros avanzados y manejo de errores consistente.

---

## 🌐 **Base URL**
```
/api/products
```

---

## 📖 **Endpoints Disponibles**

### **GET /api/products**
Obtener productos con filtros avanzados, paginación y ordenamiento.

#### **Parámetros de Query (todos opcionales):**

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `id` | UUID | Obtener producto específico | `?id=uuid` |
| `page` | number | Página actual (por defecto: 1) | `?page=2` |
| `limit` | number | Items por página (por defecto: 20, máx: 100) | `?limit=10` |
| `category_id` o `category` | UUID | Filtrar por categoría | `?category=uuid` |
| `search` o `q` | string | Búsqueda en nombre, descripción, nombre científico | `?search=rosa` |
| `featured` | boolean | Solo productos destacados | `?featured=true` |
| `min_price` | number | Precio mínimo | `?min_price=10.50` |
| `max_price` | number | Precio máximo | `?max_price=100.00` |
| `in_stock` | boolean | Disponibilidad de stock | `?in_stock=true` |
| `material` | string | Filtrar por material | `?material=cerámica` |
| `size` | string | Filtrar por tamaño | `?size=grande` |
| `type` | string | Filtrar por tipo | `?type=interior` |
| `sort_by` | string | Campo de ordenamiento | `?sort_by=price` |
| `sort_order` | string | Dirección (asc/desc) | `?sort_order=asc` |

#### **Opciones de Ordenamiento:**
- `name` - Por nombre
- `price` - Por precio
- `stock` - Por stock disponible
- `created_at` - Por fecha de creación (por defecto)

#### **Ejemplos de Uso:**

**1. Obtener producto específico:**
```http
GET /api/products?id=550e8400-e29b-41d4-a716-446655440000
```

**2. Productos paginados:**
```http
GET /api/products?page=2&limit=10
```

**3. Búsqueda con filtros:**
```http
GET /api/products?search=rosa&min_price=15&max_price=50&in_stock=true
```

**4. Productos por categoría ordenados por precio:**
```http
GET /api/products?category=uuid&sort_by=price&sort_order=asc
```

**5. Filtros avanzados combinados:**
```http
GET /api/products?featured=true&material=cerámica&size=grande&page=1&limit=5
```

#### **Respuesta Exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Rosa Roja",
      "description": "Hermosa rosa roja...",
      "category_id": "uuid",
      "price": 25.99,
      "stock": 15,
      "image": "https://example.com/rosa.jpg",
      "images": ["url1", "url2"],
      "scientificName": "Rosa rubiginosa",
      "care": "Riego moderado...",
      "characteristics": "Flores rojas...",
      "origin": "Europa",
      "featured": true,
      "material": null,
      "size": null,
      "weight": null,
      "usageType": null,
      "idea": null,
      "type": null,
      "usageForm": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "categoryId": null,
    "search": "rosa",
    "featured": false,
    "priceRange": {
      "min": 15,
      "max": 50
    },
    "inStock": "true",
    "material": null,
    "size": null,
    "type": null
  },
  "sorting": {
    "sortBy": "created_at",
    "sortOrder": "desc"
  }
}
```

---

### **POST /api/products**
Crear un nuevo producto.

#### **Body Requerido:**
```json
{
  "name": "Rosa Roja Premium",
  "description": "Hermosa rosa roja de la mejor calidad",
  "category_id": "550e8400-e29b-41d4-a716-446655440000",
  "price": 25.99,
  "stock": 15,
  "image": "https://example.com/rosa.jpg",
  "images": ["https://example.com/rosa1.jpg", "https://example.com/rosa2.jpg"],
  "scientificName": "Rosa rubiginosa",
  "care": "Riego moderado, sol directo",
  "characteristics": "Flores rojas intensas, fragantes",
  "origin": "Europa",
  "featured": true,
  "material": "Natural",
  "size": "Mediana",
  "weight": "500g",
  "usageType": "Decorativo",
  "idea": "Perfecta para jardines románticos",
  "type": "Exterior",
  "usageForm": "Plantar en tierra o maceta grande"
}
```

#### **Validaciones:**
- `name`: 3-100 caracteres, requerido
- `description`: 10-1000 caracteres, requerido
- `category_id`: UUID válido, requerido
- `price`: Número positivo, máximo 999,999
- `stock`: Entero no negativo, máximo 9999
- `image`: URL válida o ruta de archivo, requerido
- `scientificName`: 1-100 caracteres, requerido
- `care`: 1-1000 caracteres, requerido
- `characteristics`: 1-1000 caracteres, requerido
- `origin`: 1-100 caracteres, requerido
- Campos opcionales: material, size, weight, usageType, idea, type, usageForm

#### **Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "id": "nuevo-uuid",
    "name": "Rosa Roja Premium",
    // ... resto de campos
  }
}
```

---

### **PUT /api/products**
Actualizar un producto existente.

#### **Body Requerido:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Rosa Roja Premium Actualizada",
  "price": 27.99,
  "stock": 20
  // ... otros campos a actualizar (opcionales)
}
```

#### **Validaciones:**
- `id`: UUID válido, requerido
- Otros campos: mismas validaciones que POST, pero todos opcionales

---

### **DELETE /api/products**
Eliminar un producto.

#### **Query Parameters:**
- `id` (requerido): UUID del producto a eliminar

#### **Ejemplo:**
```http
DELETE /api/products?id=550e8400-e29b-41d4-a716-446655440000
```

#### **Respuesta Exitosa:**
```json
{
  "success": true,
  "data": {
    "message": "Producto eliminado exitosamente",
    "deletedId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 🚨 **Códigos de Error**

### **400 - Bad Request**
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Datos de producto inválidos",
    "details": [
      {
        "field": "name",
        "message": "El nombre debe tener al menos 3 caracteres"
      }
    ]
  }
}
```

**Códigos específicos:**
- `VALIDATION_ERROR` - Error de validación de datos
- `INVALID_PRODUCT_ID` - ID de producto inválido
- `MISSING_PRODUCT_ID` - ID de producto no proporcionado
- `INVALID_PAGINATION` - Parámetros de paginación inválidos
- `INVALID_PRICE_RANGE` - Rango de precios inválido
- `INVALID_SEARCH_QUERY` - Query de búsqueda inválido

### **404 - Not Found**
```json
{
  "success": false,
  "error": {
    "type": "NOT_FOUND_ERROR",
    "message": "Producto no encontrado",
    "code": "PRODUCT_NOT_FOUND"
  }
}
```

### **500 - Internal Server Error**
```json
{
  "success": false,
  "error": {
    "type": "INTERNAL_ERROR",
    "message": "Error interno del servidor"
  }
}
```

---

## 🔧 **Características Implementadas**

### ✅ **Validaciones Robustas**
- Todos los campos validados con Zod
- Mensajes de error en español
- Validación de tipos de datos y rangos

### ✅ **Paginación Inteligente**
- Límites configurables (1-100 items por página)
- Metadatos completos de paginación
- Navegación fácil (hasNext, hasPrev)

### ✅ **Filtros Avanzados**
- Búsqueda por texto (nombre, descripción, nombre científico)
- Filtros por categoría, precio, stock
- Filtros específicos (material, tamaño, tipo)
- Combinación de múltiples filtros

### ✅ **Ordenamiento Flexible**
- Por nombre, precio, stock, fecha de creación
- Orden ascendente o descendente
- Ordenamiento por defecto inteligente

### ✅ **Manejo de Errores Consistente**
- Códigos de error específicos
- Mensajes descriptivos
- Logging estructurado para debugging

### ✅ **Respuestas Estructuradas**
- Formato consistente con `success` y `data`
- Metadatos de paginación y filtros
- Información contextual útil

---

## 📝 **Notas de Uso**

1. **Performance**: Los filtros se aplican en memoria para mayor flexibilidad, pero para grandes volúmenes de datos se recomienda mover la lógica a la base de datos.

2. **Límites**: La paginación tiene un límite máximo de 100 items por página para prevenir sobrecarga.

3. **Búsqueda**: La búsqueda es case-insensitive y busca en múltiples campos simultáneamente.

4. **Validaciones**: Todas las URLs de imágenes se validan, pero también se aceptan rutas de archivos locales.

5. **Compatibilidad**: La API mantiene compatibilidad con versiones anteriores mientras agrega nuevas funcionalidades.

---

## 🚀 **Ejemplos de Integración**

### **Frontend (JavaScript/TypeScript)**
```javascript
// Obtener productos con filtros
const response = await fetch('/api/products?search=rosa&min_price=15&page=1&limit=10');
const result = await response.json();

if (result.success) {
  console.log('Productos:', result.data);
  console.log('Paginación:', result.pagination);
} else {
  console.error('Error:', result.error.message);
}

// Crear producto
const newProduct = {
  name: "Nueva Rosa",
  description: "Rosa hermosa",
  category_id: "uuid",
  price: 25.99,
  stock: 10,
  // ... otros campos
};

const createResponse = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProduct)
});
```

---

*Documentación actualizada: 22 de Enero de 2025* 