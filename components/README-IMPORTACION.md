# Componentes de Importación de Excel

Este directorio contiene los componentes necesarios para la funcionalidad de importación de productos desde archivos Excel.

## Componentes

### 1. ConfirmationDialog (`confirmation-dialog.tsx`)

Diálogo de confirmación reutilizable basado en `AlertDialog` de shadcn/ui.

#### Props

```typescript
interface ConfirmationDialogProps {
  isOpen: boolean           // Controla la visibilidad del diálogo
  onClose: () => void      // Callback cuando se cierra el diálogo
  onConfirm: () => void    // Callback cuando se confirma la acción
  title: string            // Título del diálogo
  description: string      // Descripción/mensaje del diálogo
  confirmLabel?: string    // Texto del botón de confirmación (default: "Confirmar")
  cancelLabel?: string     // Texto del botón de cancelar (default: "Cancelar")
  variant?: 'default' | 'destructive'  // Estilo del botón (default: 'default')
}
```

#### Ejemplo de Uso

```tsx
<ConfirmationDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="¿Eliminar producto?"
  description="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  cancelLabel="Cancelar"
  variant="destructive"
/>
```

### 2. ExcelUploadDialog (`excel-upload-dialog.tsx`)

Modal completo para importar productos desde archivos Excel con las siguientes características:

#### Características

- ✅ Drag & Drop de archivos
- ✅ Validación de formato (.xlsx, .xls)
- ✅ Validación de tamaño (máx. 10MB)
- ✅ Vista previa de datos (primeras 5 filas)
- ✅ Edición inline de celdas
- ✅ Responsive (optimizado para móvil y desktop)
- ✅ Indicador de progreso
- ✅ Confirmación antes de cerrar con datos cargados
- ✅ Límite de 500 productos por archivo

#### Props

```typescript
interface ExcelUploadDialogProps {
  isOpen: boolean                                    // Controla la visibilidad del modal
  onClose: () => void                               // Callback cuando se cierra el modal
  onDataProcessed: (data: Partial<Product>[]) => Promise<void>  // Callback con los datos procesados
}
```

#### Ejemplo de Uso

```tsx
import { ExcelUploadDialog } from "@/components/excel-upload-dialog"

function AdminPage() {
  const [showExcelUpload, setShowExcelUpload] = useState(false)

  const handleExcelDataProcessed = async (data: Partial<Product>[]) => {
    // Procesar los datos importados
    for (const productData of data) {
      await createProduct(productData)
    }
  }

  return (
    <>
      <button onClick={() => setShowExcelUpload(true)}>
        Importar desde Excel
      </button>

      <ExcelUploadDialog
        isOpen={showExcelUpload}
        onClose={() => setShowExcelUpload(false)}
        onDataProcessed={handleExcelDataProcessed}
      />
    </>
  )
}
```

## Dependencias

### Nuevas Dependencias Instaladas

- **xlsx**: Librería para leer y procesar archivos Excel

### Dependencias Existentes Utilizadas

- **@radix-ui/react-dialog**: Para el componente Dialog
- **@radix-ui/react-alert-dialog**: Para el componente AlertDialog
- **lucide-react**: Para los íconos
- **@/components/ui/***: Componentes de shadcn/ui

## Archivos Relacionados

### Documentación

- `GUIA-IMPORTACION-EXCEL.md`: Guía completa de uso para usuarios finales

### Archivos de Ejemplo

- `data/Ejemplo_Importacion_Productos.csv`: Archivo CSV de ejemplo que puede convertirse a Excel

## Integración en Admin

El componente `ExcelUploadDialog` está integrado en `app/admin/page.tsx`:

1. **Estado**: Se maneja con `showExcelUpload`
2. **Botón**: Botón azul "Importar desde Excel" junto al botón "Agregar Producto"
3. **Procesamiento**: La función `handleExcelDataProcessed` procesa los datos importados
4. **Feedback**: Notificaciones de éxito/error usando el sistema toast existente

## Flujo de Importación

```
Usuario selecciona archivo
       ↓
Validación de archivo (tamaño, formato)
       ↓
Lectura con xlsx (SheetJS)
       ↓
Vista previa (primeras 5 filas)
       ↓
[Opcional] Edición de celdas
       ↓
Usuario confirma importación
       ↓
Validación de campos obligatorios
       ↓
Creación de productos uno por uno
       ↓
Feedback de resultado (éxitos/errores)
```

## Personalización

### Validaciones Personalizadas

Para agregar validaciones personalizadas, modifica la función `handleExcelDataProcessed` en `app/admin/page.tsx`:

```typescript
const handleExcelDataProcessed = async (data: Partial<Product>[]) => {
  for (const productData of data) {
    // Agregar validaciones personalizadas aquí
    if (!isValidCategoryId(productData.category_id)) {
      errors.push(`Categoría inválida para ${productData.name}`)
      continue
    }
    
    // ... resto del procesamiento
  }
}
```

### Campos del Excel

Para modificar qué campos se esperan del Excel, actualiza:
1. La sección "Especificaciones del archivo" en el componente
2. La validación en `handleExcelDataProcessed`
3. La documentación en `GUIA-IMPORTACION-EXCEL.md`

## Consideraciones de Rendimiento

- **Procesamiento asíncrono**: Los productos se crean uno por uno para evitar sobrecargar el servidor
- **Vista previa limitada**: Solo se muestran 5 filas para mejor rendimiento
- **Validación progresiva**: La validación ocurre durante la importación, no antes

## Manejo de Errores

Los errores se manejan en tres niveles:

1. **Validación de archivo**: Formato, tamaño, contenido vacío
2. **Validación de datos**: Campos obligatorios, tipos de datos
3. **Errores de creación**: Problemas con la API, base de datos, etc.

Todos los errores se reportan mediante:
- Notificaciones toast para el usuario
- Console.log para debugging
- Resumen de éxitos/errores al finalizar

## Soporte Multi-idioma

Actualmente el componente está en español. Para agregar soporte multi-idioma:

1. Extraer todos los textos a un archivo de traducciones
2. Usar next-intl o similar
3. Actualizar los textos en el componente

## Testing

Para probar la funcionalidad:

1. Usa el archivo `data/Ejemplo_Importacion_Productos.csv`
2. Conviértelo a Excel (.xlsx)
3. Importa en el panel de admin
4. Verifica que los productos se creen correctamente

## Solución de Problemas

### El modal no se abre
- Verifica que `showExcelUpload` se actualice correctamente
- Revisa la consola para errores de importación

### Los datos no se leen correctamente
- Verifica que el archivo Excel tenga headers en la primera fila
- Asegúrate de que los nombres de columnas coincidan exactamente

### Errores al crear productos
- Verifica que los `category_id` existan en el sistema
- Confirma que todos los campos obligatorios estén presentes
- Revisa la consola para mensajes de error detallados

