# Guía de Importación de Productos desde Excel

## 📋 Descripción

Esta funcionalidad permite importar múltiples productos al sistema desde un archivo de Excel (.xlsx o .xls), agilizando la carga masiva de datos.

## 🚀 Cómo usar

1. **Acceder al Panel de Admin**
   - Navega a `/admin`
   - Haz clic en el botón **"Importar desde Excel"** (botón azul con ícono de upload)

2. **Seleccionar archivo**
   - Arrastra y suelta tu archivo Excel en el área designada
   - O haz clic en el área para seleccionar el archivo desde tu computadora

3. **Previsualizar datos**
   - El sistema mostrará una vista previa de las primeras 5 filas
   - Puedes editar cualquier celda haciendo doble clic (desktop) o tocando el ícono del lápiz (móvil)

4. **Importar**
   - Haz clic en "Importar Productos"
   - El sistema procesará todos los productos y mostrará un resumen

## 📝 Formato del Archivo Excel

### Campos Obligatorios

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| name | Texto | Nombre del producto | "Cactus Mexicano" |
| description | Texto | Descripción detallada | "Hermoso cactus ideal para interiores" |
| category_id | UUID | ID de categoría existente | "550e8400-e29b-41d4-a716-446655440000" |
| price | Número | Precio del producto | 1500.50 |
| stock | Número | Cantidad disponible | 25 |
| scientificName | Texto | Nombre científico | "Opuntia ficus-indica" |
| care | Texto | Instrucciones de cuidado | "Riego moderado, luz solar directa" |
| characteristics | Texto | Características principales | "Resistente a sequías, fácil mantenimiento" |
| origin | Texto | Origen de la planta | "México" |

### Campos Opcionales

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| image | Texto | URL de imagen principal | "https://example.com/image1.jpg" |
| images | Texto | URLs de imágenes adicionales (separadas por comas) | "https://example.com/img1.jpg, https://example.com/img2.jpg" |
| featured | Boolean | Producto destacado | TRUE o FALSE |

### Ejemplo de Estructura Excel

```
| name           | description              | category_id                          | price | stock | scientificName        | care                    | characteristics           | origin  | image                      | images                                    | featured |
|----------------|--------------------------|--------------------------------------|-------|-------|-----------------------|-------------------------|---------------------------|---------|----------------------------|------------------------------------------|----------|
| Cactus Pequeño | Cactus ideal para mesa   | 550e8400-e29b-41d4-a716-446655440000 | 850   | 30    | Mammillaria elongata  | Riego cada 15 días      | Pequeño, bajo mantenimiento | México  | https://example.com/1.jpg  | https://example.com/1.jpg,https://ex.../2.jpg | FALSE    |
| Rosa Roja      | Rosa clásica de jardín   | 550e8400-e29b-41d4-a716-446655440001 | 2500  | 15    | Rosa rubiginosa       | Riego diario            | Fragante, ornamental      | Europa  | https://example.com/3.jpg  |                                          | TRUE     |
```

## ⚙️ Especificaciones Técnicas

### Límites
- **Tamaño máximo de archivo**: 10 MB
- **Productos por archivo**: 1 - 500
- **Formatos soportados**: .xlsx, .xls

### Validaciones
- Todos los campos obligatorios deben estar presentes
- Los precios y stocks deben ser números válidos
- El `category_id` debe corresponder a una categoría existente
- Las URLs de imágenes deben ser válidas (si se proporcionan)

### Lógica de Importación
- **Creación**: Se crean todos los productos como nuevos registros
- **Validación**: Si un producto tiene campos faltantes, se registra un error y se continúa con el siguiente
- **Resultado**: Al finalizar, se muestra un resumen con productos importados exitosamente y errores

## 🎨 Características de la Interfaz

### Desktop
- Vista previa con scroll horizontal para muchas columnas
- Edición de celdas con doble clic
- Vista completa de todas las columnas

### Móvil
- Vista optimizada con columnas prioritarias
- Edición con botón táctil (ícono de lápiz)
- Indicador de columnas ocultas

### Ambas
- Drag & Drop de archivos
- Validación en tiempo real
- Preview antes de importar
- Confirmación antes de cerrar con datos cargados

## 🛠️ Obtener category_id

Para obtener los IDs de las categorías:

1. **Desde la base de datos**:
   ```sql
   SELECT id, name FROM categories;
   ```

2. **Desde el código**:
   - Los IDs se encuentran en `app-vivero-web/data/categories.ts`

3. **Desde la API**:
   ```bash
   curl https://tu-dominio.com/api/categories
   ```

## 📊 Ejemplo de Resultado

```
✅ Importación Exitosa
25 productos importados correctamente

o

⚠️ Importación Parcial
20 productos importados correctamente. 5 errores

o

❌ Error en la Importación
Error al importar productos. 25 errores
```

Los errores se registran en la consola del navegador para debugging.

## 💡 Consejos

1. **Prueba con pocos productos primero**: Importa 2-3 productos para verificar el formato
2. **Verifica los category_id**: Asegúrate de usar IDs existentes
3. **Revisa la preview**: Usa la vista previa para verificar que los datos se lean correctamente
4. **URLs de imágenes**: Si no tienes URLs, deja los campos vacíos o elimina las columnas
5. **Featured**: Si no incluyes esta columna, todos los productos serán NO destacados por defecto

## 🔧 Solución de Problemas

### "El archivo contiene X productos. El máximo permitido es 500"
- Divide tu archivo en archivos más pequeños

### "Producto 'X' tiene campos obligatorios faltantes"
- Verifica que todas las columnas obligatorias estén presentes
- Asegúrate de que no haya celdas vacías en campos obligatorios

### "Error al crear producto"
- Verifica que el `category_id` exista en el sistema
- Confirma que los valores numéricos sean válidos
- Revisa la consola del navegador para más detalles

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12 → Console)
2. Verifica el formato del archivo Excel
3. Prueba con el archivo de ejemplo proporcionado

