# 🚀 GENERACIÓN DE ÓRDENES DE PRUEBA PARA VIVEROWEB

## 📋 **OBJETIVO**
Generar al menos 8 órdenes de cada estado para probar la funcionalidad de paginación y visualización de estados en el panel de administración.

## 🎯 **ESTADOS IMPLEMENTADOS**

### **✅ COMPLETADO (8 órdenes)**
- Pago aprobado + Entregado
- Fechas: 23-30 días atrás
- Métodos: Domicilio y Retiro

### **🚛 PAGO OK · ENVÍO PENDIENTE (8 órdenes)**
- Pago aprobado + Esperando envío
- Fechas: 15-22 días atrás
- Método: Solo Domicilio

### **📦 PAGO OK · LISTO PARA RETIRAR (8 órdenes)**
- Pago aprobado + Listo para retirar
- Fechas: 7-14 días atrás
- Método: Solo Retiro

### **⏰ PENDIENTE (8 órdenes)**
- Pago en proceso/pendiente/autorizado
- Fechas: 0-6 días atrás
- Métodos: Domicilio y Retiro

### **❌ RECHAZADO (8 órdenes)**
- Pago rechazado
- Fechas: 18-25 días atrás
- Métodos: Domicilio y Retiro

### **🚫 CANCELADO (8 órdenes)**
- Pago cancelado o reembolsado
- Fechas: 10-17 días atrás
- Métodos: Domicilio y Retiro

## 🔧 **PASOS PARA EJECUTAR**

### **1. Ejecutar el Script SQL**
```sql
-- Copiar y pegar el contenido de generate-test-orders.sql
-- en el SQL Editor de Supabase
```

### **2. Verificar la Generación**
```sql
-- Verificar total de órdenes
SELECT COUNT(*) FROM orders;

-- Verificar distribución por estado
SELECT 
  CASE 
    WHEN payment_status = 'approved' AND fulfillment_status = 'delivered' THEN 'Completado'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_shipment' THEN 'Pago OK · Envío pendiente'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_pickup' THEN 'Pago OK · Listo para retirar'
    WHEN payment_status IN ('pending', 'in_process', 'authorized') THEN 'Pendiente'
    WHEN payment_status = 'rejected' THEN 'Rechazado'
    WHEN payment_status IN ('cancelled', 'refunded') THEN 'Cancelado'
    ELSE 'Otro'
  END as estado_ui,
  COUNT(*) as cantidad
FROM orders
GROUP BY 
  CASE 
    WHEN payment_status = 'approved' AND fulfillment_status = 'delivered' THEN 'Completado'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_shipment' THEN 'Pago OK · Envío pendiente'
    WHEN payment_status = 'approved' AND fulfillment_status = 'awaiting_pickup' THEN 'Pago OK · Listo para retirar'
    WHEN payment_status IN ('pending', 'in_process', 'authorized') THEN 'Pendiente'
    WHEN payment_status = 'rejected' THEN 'Rechazado'
    WHEN payment_status IN ('cancelled', 'refunded') THEN 'Cancelado'
    ELSE 'Otro'
  END
ORDER BY cantidad DESC;
```

## 🎨 **FUNCIONALIDADES IMPLEMENTADAS**

### **📊 Paginación**
- **20 órdenes por página** (cambiado de 50)
- **Navegación completa**: Primera, Anterior, Números de página, Siguiente, Última
- **Información de página**: Muestra página actual y total
- **Números de página inteligentes**: Muestra máximo 5 números con navegación contextual

### **🎯 Estados Visuales**
- **Texto en negritas y color negro** para todos los estados
- **Colores de fondo mantenidos** para diferenciación visual
- **Íconos descriptivos** para cada estado
- **Badges responsivos** con colores distintivos

### **🔍 Filtros y Búsqueda**
- Filtro por estado UI
- Filtro por estado de pago
- Filtro por estado logístico
- Filtro por método de envío
- Búsqueda por texto
- Filtros de fecha

## 🧪 **PRUEBAS RECOMENDADAS**

### **1. Verificar Paginación**
- Navegar entre páginas
- Verificar que se muestren 20 órdenes por página
- Probar botones de primera/última página
- Verificar números de página contextuales

### **2. Verificar Estados**
- Confirmar que hay al menos 8 de cada estado
- Verificar colores y fuentes de los badges
- Probar filtros por estado
- Verificar estadísticas en tiempo real

### **3. Verificar Responsividad**
- Probar en diferentes tamaños de pantalla
- Verificar que la paginación se adapte
- Probar filtros en móvil

## 📱 **RESULTADO ESPERADO**

- **Total de órdenes**: 48 órdenes
- **Páginas**: 3 páginas (20 + 20 + 8)
- **Estados distribuidos**: 8 de cada uno
- **Paginación funcional**: Navegación completa entre páginas
- **Estados visuales**: Texto negro en negritas con colores de fondo

## 🚨 **NOTAS IMPORTANTES**

1. **Ejecutar solo en ambiente de desarrollo/testing**
2. **No ejecutar en producción** sin backup
3. **Verificar que la tabla orders tenga la estructura correcta**
4. **Los campos customer_info, payment_status y fulfillment_status son obligatorios**

## 🔄 **ROLLBACK (si es necesario)**

```sql
-- Eliminar órdenes de prueba
DELETE FROM orders WHERE customer_email LIKE '%@email.com';

-- Verificar limpieza
SELECT COUNT(*) FROM orders;
```
