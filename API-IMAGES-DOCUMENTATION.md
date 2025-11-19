# 📷 API de Gestión de Imágenes

## 📋 Descripción

Esta API proporciona endpoints para la gestión completa de imágenes en el sistema ViveroWeb. Permite subir, listar, actualizar y eliminar imágenes, así como gestionar las imágenes asociadas a productos específicos.

## 🔐 Autenticación

La mayoría de los endpoints requieren autenticación como administrador. Las operaciones de lectura pública no requieren autenticación.

## 🌐 Endpoints

### 📋 Listar imágenes

**GET /api/images**

Lista las imágenes disponibles en una carpeta específica.

**Parámetros de consulta:**
- `folder` (opcional): Carpeta a listar. Por defecto: "products"
- `limit` (opcional): Número máximo de resultados. Por defecto: 50
- `offset` (opcional): Índice de inicio para paginación. Por defecto: 0

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "name": "imagen1.jpg",
        "path": "products/imagen1.jpg",
        "publicUrl": "https://...",
        "size": 123456,
        "lastModified": "2023-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "folder": "products"
  }
}
```

### 📤 Subir imagen

**POST /api/images/upload**

Sube una nueva imagen al almacenamiento.

**Requiere autenticación:** Sí

**Cuerpo de la solicitud (FormData):**
- `file`: Archivo de imagen a subir
- `folder` (opcional): Carpeta de destino. Por defecto: "products"

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "path": "products/timestamp-random.jpg",
    "publicUrl": "https://..."
  }
}
```

### 🗑️ Eliminar imagen

**DELETE /api/images/delete**

Elimina una imagen del almacenamiento.

**Requiere autenticación:** Sí

**Cuerpo de la solicitud:**
```json
{
  "url": "https://..." // URL completa de la imagen
}
```

o

```json
{
  "path": "products/imagen.jpg" // Path relativo de la imagen
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Imagen eliminada exitosamente"
}
```

### 🗑️ Eliminar múltiples imágenes

**POST /api/images/delete**

Elimina múltiples imágenes del almacenamiento.

**Requiere autenticación:** Sí

**Cuerpo de la solicitud:**
```json
{
  "images": [
    "https://...", // URL completa de la imagen
    "products/imagen.jpg" // o path relativo
  ]
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "2 imágenes eliminadas exitosamente",
  "deletedCount": 2
}
```

### 📋 Obtener imágenes de un producto

**GET /api/products/[id]/images**

Obtiene las imágenes asociadas a un producto específico.

**Parámetros de ruta:**
- `id`: ID del producto

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "productId": "123",
    "images": [
      {
        "url": "https://...",
        "isMain": true,
        "order": 0
      },
      {
        "url": "https://...",
        "isMain": false,
        "order": 1
      }
    ],
    "total": 2
  }
}
```

### 📝 Actualizar imágenes de un producto

**POST /api/products/[id]/images**

Actualiza las imágenes asociadas a un producto específico.

**Requiere autenticación:** Sí

**Parámetros de ruta:**
- `id`: ID del producto

**Cuerpo de la solicitud:**
```json
{
  "images": [
    "https://...", // URL de imagen como string
    {
      "url": "https://...",
      "isMain": true,
      "order": 0
    }
  ],
  "mainImageUrl": "https://..." // URL de la imagen principal (opcional)
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "productId": "123",
    "images": [
      {
        "url": "https://...",
        "isMain": true,
        "order": 0
      },
      {
        "url": "https://...",
        "isMain": false,
        "order": 1
      }
    ],
    "total": 2
  }
}
```

### 🗑️ Eliminar imagen de un producto

**DELETE /api/products/[id]/images**

Elimina una imagen específica de un producto o todas las imágenes.

**Requiere autenticación:** Sí

**Parámetros de ruta:**
- `id`: ID del producto

**Parámetros de consulta:**
- `url`: URL de la imagen a eliminar
- `all`: Si es "true", elimina todas las imágenes del producto

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "productId": "123",
    "images": [
      {
        "url": "https://...",
        "isMain": true,
        "order": 0
      }
    ],
    "total": 1,
    "deleted": "https://..."
  }
}
```

## 🔧 Validaciones

El sistema realiza las siguientes validaciones al subir imágenes:

1. **Formato de archivo**: Solo se permiten JPG, PNG, WebP, GIF y SVG
2. **Tamaño máximo**: 5MB por imagen
3. **Dimensiones mínimas**: 200x200 píxeles
4. **Límite de imágenes**: Máximo 3 imágenes por producto

## 🚨 Códigos de error

- **400**: Solicitud incorrecta (parámetros faltantes o inválidos)
- **401**: No autorizado (autenticación requerida)
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## 📝 Ejemplos de uso

### Subir una imagen

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder', 'products');

const response = await fetch('/api/images/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('Imagen subida:', result.data.url);
}
```

### Actualizar imágenes de un producto

```javascript
const productId = '123';
const images = [
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg'
];

const response = await fetch(`/api/products/${productId}/images`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    images,
    mainImageUrl: images[0]
  })
});

const result = await response.json();
if (result.success) {
  console.log('Imágenes actualizadas:', result.data.images);
}
```

## 🔄 Integración con el hook useImageUpload

El hook `useImageUpload` proporciona una interfaz sencilla para interactuar con esta API. Consulta la documentación del hook para más detalles.

```javascript
const [imageState, imageActions] = useImageUpload({
  maxImages: 3,
  folder: 'products',
  onUploadComplete: (urls) => {
    console.log('Imágenes subidas:', urls);
  }
});

// Subir imágenes
await imageActions.addImages(files);
await imageActions.uploadImages();

// Eliminar imágenes
await imageActions.deleteExistingImage(url);
```