# Cómo Usar el Archivo de Ejemplo para Importación

## 📄 Archivo Disponible

- **Nombre**: `Ejemplo_Importacion_Productos.csv`
- **Ubicación**: `app-vivero-web/data/`
- **Contenido**: 10 productos de ejemplo con todos los campos necesarios

## 🔄 Convertir CSV a Excel

El archivo está en formato CSV. Para usarlo en la funcionalidad de importación, conviértelo a Excel:

### Opción 1: Microsoft Excel

1. Abre Microsoft Excel
2. Ve a `Archivo` → `Abrir`
3. Selecciona `Ejemplo_Importacion_Productos.csv`
4. Ve a `Archivo` → `Guardar como`
5. Selecciona formato `Excel Workbook (.xlsx)`
6. Guarda el archivo

### Opción 2: Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com)
2. `Archivo` → `Importar` → `Subir`
3. Selecciona `Ejemplo_Importacion_Productos.csv`
4. Una vez importado: `Archivo` → `Descargar` → `Microsoft Excel (.xlsx)`

### Opción 3: LibreOffice Calc (Gratis)

1. Descarga [LibreOffice](https://www.libreoffice.org/)
2. Abre LibreOffice Calc
3. `Archivo` → `Abrir` → selecciona el CSV
4. `Archivo` → `Guardar como` → selecciona formato `.xlsx`

### Opción 4: Usar el CSV Directamente en Excel

1. Cambia la extensión del archivo de `.csv` a `.xlsx` manualmente
2. Abre el archivo con Excel
3. Excel detectará automáticamente el formato CSV y lo convertirá

## ✅ Verificar el Archivo

Antes de importar, verifica que:

- ✅ La primera fila contenga los nombres de las columnas (headers)
- ✅ No haya filas vacías entre los datos
- ✅ Los `category_id` sean válidos (1-20 según `data/categories.ts`)
- ✅ Los valores numéricos (price, stock) no tengan texto
- ✅ El archivo no supere las 500 filas de productos

## 🎯 Usar en la Importación

1. Abre el panel de admin en tu navegador: `http://localhost:3000/admin`
2. Haz clic en **"Importar desde Excel"** (botón azul)
3. Arrastra el archivo `.xlsx` o haz clic para seleccionarlo
4. Revisa la vista previa
5. Haz clic en **"Importar Productos"**

## 📝 Personalizar el Ejemplo

Puedes editar el archivo CSV o Excel para:

- Agregar más productos
- Cambiar los valores de ejemplo
- Probar diferentes categorías
- Agregar URLs de imágenes reales

### IDs de Categorías Disponibles

```
1  = Plantas de interior
2  = Plantas con flores
3  = Palmeras
4  = Árboles
5  = Coníferas
6  = Arbustos
7  = Frutales
8  = Macetas de plástico
9  = Macetas de arcilla
10 = Macetas de cemento
11 = Macetas de fibracemento
12 = Macetas rotomoldeadas
13 = Macetas de cerámica
14 = Fertilizantes
15 = Tierras y sustratos
16 = Productos químicos
17 = Insumos de jardinería
18 = Atrapasueños
19 = Adornos de jardín
20 = Souvenirs
```

## 💡 Consejos

1. **Empieza con pocos productos**: Prueba primero con 2-3 productos para verificar el formato
2. **Copia las filas**: Usa los productos de ejemplo como plantilla
3. **Verifica los IDs**: Asegúrate de usar category_id existentes
4. **URLs de imágenes**: Puedes usar URLs de Unsplash o dejar vacío el campo

## 🔗 URLs de Imágenes de Ejemplo

Si necesitas URLs de imágenes gratuitas:

- [Unsplash](https://unsplash.com/) - Fotos gratuitas de alta calidad
- [Pexels](https://www.pexels.com/) - Fotos y videos gratuitos
- [Pixabay](https://pixabay.com/) - Imágenes libres de derechos

Busca "plants", "cactus", "flowers", etc. y copia la URL de la imagen.

## ❓ Problemas Comunes

### "El archivo contiene campos inválidos"
- Verifica que los nombres de las columnas sean exactamente como en el ejemplo
- No agregues espacios extra en los headers

### "Category_id inválido"
- Usa solo números del 1 al 20
- Verifica que la categoría exista en tu sistema

### "Error al leer el archivo"
- Asegúrate de que el archivo esté en formato .xlsx o .xls
- Intenta guardar de nuevo desde Excel

## 📚 Más Información

Para más detalles sobre la funcionalidad de importación, consulta:

- `GUIA-IMPORTACION-EXCEL.md` - Guía completa de uso
- `components/README-IMPORTACION.md` - Documentación técnica
- `RESUMEN-IMPORTACION-EXCEL.md` - Resumen ejecutivo

