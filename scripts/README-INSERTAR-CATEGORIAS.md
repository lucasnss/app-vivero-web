# 🚀 INSERTAR CATEGORÍAS EN SUPABASE - VIVERO WEB

## 📋 **Categorías a Insertar**

Se van a insertar las siguientes **15 categorías** en Supabase:

### 🌿 **Plantas**
1. **Plantas de interior** - Plantas ideales para decorar espacios interiores
2. **Plantas con flores** - Plantas que producen hermosas flores  
3. **Palmeras** - Palmeras de diferentes tamaños y variedades
4. **Árboles** - Árboles para jardines y espacios exteriores
5. **Coníferas** - Árboles y arbustos coníferos
6. **Arbustos** - Arbustos ornamentales y decorativos
7. **Frutales** - Árboles y plantas que producen frutos

### 🪴 **Macetas**
8. **Macetas** - Macetas de diferentes materiales y tamaños

### 🌱 **Productos de Jardinería**
9. **Fertilizantes** - Fertilizantes y nutrientes para plantas
10. **Tierras y sustratos** - Tierras y sustratos especializados
11. **Productos químicos** - Productos químicos para el cuidado de plantas
12. **Insumos de jardinería** - Herramientas e insumos para jardinería

### 🎨 **Decoración y Souvenirs**
13. **Atrapasueños** - Atrapasueños artesanales
14. **Adornos de jardín** - Adornos y decoraciones para jardín
15. **Souvenirs** - Souvenirs y regalos relacionados con plantas

---

## 🔧 **Métodos de Inserción**

### **Opción 1: SQL Directo (Recomendado)**

1. **Ir a Supabase Dashboard**
   - Acceder a tu proyecto en [supabase.com](https://supabase.com)
   - Ir a **SQL Editor**

2. **Ejecutar el script SQL**
   - Copiar el contenido de `scripts/insert-categories.sql`
   - Pegar en el SQL Editor
   - Hacer clic en **Run**

3. **Verificar la inserción**
   - El script incluye consultas de verificación
   - Deberías ver 15 categorías insertadas

### **Opción 2: Vía API (Alternativo)**

1. **Preparar el entorno**
   ```bash
   cd Fronted
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   # En .env.local
   ADMIN_TOKEN=tu_token_de_admin
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Ejecutar el script**
   ```bash
   node scripts/insert-categories-via-api.js
   ```

---

## 📊 **Estructura de Datos**

Cada categoría incluye:

```typescript
{
  id: "UUID único",
  name: "Nombre de la categoría",
  description: "Descripción detallada",
  icon: "Emoji representativo",
  color: "Clases CSS de Tailwind",
  slug: "URL-friendly-name",
  featured: boolean, // true para categorías destacadas
  display_order: number, // Orden de visualización
  is_active: true
}
```

---

## ✅ **Verificación Post-Inserción**

### **1. Verificar en Supabase**
```sql
-- Ver todas las categorías
SELECT * FROM categories ORDER BY display_order;

-- Contar total
SELECT COUNT(*) FROM categories;

-- Ver categorías destacadas
SELECT * FROM categories WHERE featured = true;
```

### **2. Verificar en la API**
```bash
# Obtener todas las categorías
curl http://localhost:3000/api/categories

# Obtener categoría específica
curl http://localhost:3000/api/categories?name=Plantas%20de%20interior
```

### **3. Verificar en el Frontend**
- Ir a `http://localhost:3000/categorias`
- Verificar que aparezcan todas las categorías
- Comprobar que los iconos y colores se muestren correctamente

---

## 🔄 **Actualización de Datos**

Si necesitas actualizar categorías existentes:

### **SQL**
```sql
-- Actualizar una categoría específica
UPDATE categories 
SET description = 'Nueva descripción',
    icon = '🌿',
    color = 'bg-green-100 text-green-800'
WHERE name = 'Plantas de interior';
```

### **API**
```bash
# Actualizar vía API (requiere autenticación de admin)
curl -X PUT http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_token" \
  -d '{
    "name": "Plantas de interior",
    "description": "Nueva descripción"
  }'
```

---

## 🚨 **Solución de Problemas**

### **Error: "duplicate key value violates unique constraint"**
- Las categorías ya existen
- El script usa `ON CONFLICT` para actualizar en lugar de insertar
- Es seguro ejecutar múltiples veces

### **Error: "relation 'categories' does not exist"**
- La tabla categories no existe
- Ejecutar primero `scripts/setup-database-from-zero.sql`

### **Error: "permission denied"**
- Problemas de RLS (Row Level Security)
- Verificar políticas de Supabase
- Ejecutar `scripts/configure-rls-dev.sql`

---

## 📝 **Notas Importantes**

1. **IDs Únicos**: Cada categoría tiene un UUID único predefinido
2. **Slugs Únicos**: Los slugs son únicos y URL-friendly
3. **Orden de Visualización**: Las categorías se ordenan por `display_order`
4. **Categorías Destacadas**: Solo "Plantas de interior", "Plantas con flores" y "Macetas" están marcadas como `featured = true`
5. **Compatibilidad**: Los datos son compatibles con el frontend existente

---

## 🎯 **Próximos Pasos**

Después de insertar las categorías:

1. **Crear productos** y asignarlos a las categorías
2. **Probar la funcionalidad** de filtrado por categorías
3. **Personalizar iconos y colores** según necesidades
4. **Agregar subcategorías** si es necesario (usando `parent_id`)

---

**✅ ¡Listo! Las categorías estarán disponibles en tu aplicación ViveroWeb.** 