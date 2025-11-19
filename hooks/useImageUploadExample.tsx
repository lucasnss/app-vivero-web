"use client"

import { useState } from 'react'
import { useImageUpload } from './useImageUpload'
import { AdvancedImageUploader } from '@/components/ui/ImageUploader'
import { ImagePreview } from '@/components/ui/ImagePreview'
import { EnhancedImageGallery } from '@/components/ui/ImageGallery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, Upload, Trash2 } from 'lucide-react'

export const UseImageUploadExample = () => {
  const [productId, setProductId] = useState('product-123')
  
  // Configurar el hook
  const [imageState, imageActions] = useImageUpload({
    maxImages: 3,
    validateOnAdd: true,
    autoUpload: false,
    folder: `products/${productId}`,
    onUploadStart: () => console.log('🔄 Iniciando subida...'),
    onUploadComplete: (urls) => console.log('✅ Subida completada:', urls),
    onUploadError: (error) => console.log('❌ Error en subida:', error),
    onImageAdd: (image) => console.log('📷 Imagen agregada:', image.file.name),
    onImageRemove: (index) => console.log('🗑️ Imagen removida en índice:', index)
  })

  // Simular imágenes existentes
  const handleLoadExistingImages = () => {
    const existingImages = [
      { url: '/placeholder.jpg', isMain: true, order: 0 },
      { url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', isMain: false, order: 1 }
    ]
    imageActions.setExistingImages(existingImages)
  }

  // Manejar subida de archivos desde ImageUploader
  const handleFilesSelected = async (files: File[]) => {
    await imageActions.addImages(files)
  }

  // Manejar eliminación desde ImagePreview
  const handleDeleteExisting = async (url: string) => {
    try {
      await imageActions.deleteExistingImage(url)
    } catch (error) {
      console.error('Error eliminando imagen:', error)
    }
  }

  // Manejar reordenamiento desde ImagePreview
  const handleReorderExisting = (newOrder: string[]) => {
    const reorderedImages = newOrder.map((url, index) => {
      const existing = imageState.existingImages.find(img => img.url === url)
      return existing ? { ...existing, order: index } : { url, isMain: index === 0, order: index }
    })
    imageActions.reorderImages(reorderedImages)
  }

  // Subir todas las imágenes
  const handleUploadAll = async () => {
    try {
      const urls = await imageActions.uploadImages()
      console.log('URLs subidas:', urls)
    } catch (error) {
      console.error('Error en subida:', error)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">useImageUpload Hook</h1>
        <p className="text-gray-600">
          Ejemplo completo del hook de gestión de imágenes
        </p>
      </div>

      {/* Estado del hook */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Hook</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Imágenes nuevas:</span>
              <p className="text-lg font-bold text-blue-600">{imageState.images.length}</p>
            </div>
            <div>
              <span className="font-medium">Imágenes existentes:</span>
              <p className="text-lg font-bold text-green-600">{imageState.existingImages.length}</p>
            </div>
            <div>
              <span className="font-medium">Total:</span>
              <p className="text-lg font-bold">{imageState.totalImages}/3</p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <p className={`text-lg font-bold ${imageState.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {imageState.uploading ? 'Subiendo...' : imageState.isValid ? 'Válido' : 'Inválido'}
              </p>
            </div>
          </div>

          {/* Progreso de subida */}
          {imageState.uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Subiendo imágenes...</span>
                <span>{imageState.uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${imageState.uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Controles de prueba */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleLoadExistingImages} variant="outline">
              Cargar Imágenes Existentes
            </Button>
            <Button 
              onClick={handleUploadAll} 
              disabled={!imageState.canUpload}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Subir Todas ({imageState.images.length})
            </Button>
            <Button 
              onClick={imageActions.clearImages} 
              variant="destructive"
              disabled={imageState.images.length === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Nuevas
            </Button>
            <Button 
              onClick={imageActions.resetState} 
              variant="outline"
            >
              Reset Completo
            </Button>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Product ID:</label>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="product-123"
            />
          </div>
        </CardContent>
      </Card>

      {/* Errores y advertencias */}
      {imageState.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {imageState.errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {imageState.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {imageState.warnings.map((warning, index) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ImageUploader */}
      <Card>
        <CardHeader>
          <CardTitle>1. ImageUploader - Agregar Nuevas Imágenes</CardTitle>
          <p className="text-sm text-gray-600">
            Permite {3 - imageState.totalImages} imágenes más
          </p>
        </CardHeader>
        <CardContent>
          <AdvancedImageUploader
            maxImages={3 - imageState.totalImages}
            maxFileSize={5 * 1024 * 1024}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
            onImagesChange={handleFilesSelected}
            disabled={imageState.totalImages >= 3 || imageState.uploading}
            autoOptimize={true}
            showPreview={true}
            showProgress={true}
          />
          
          {/* Lista de imágenes nuevas */}
          {imageState.images.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium">Imágenes pendientes de subir:</h4>
              {imageState.images.map((image, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <img 
                      src={image.preview} 
                      alt={`Preview ${index + 1}`}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium">{image.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(image.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {image.uploading && (
                      <div className="text-blue-600 text-sm">Subiendo...</div>
                    )}
                    {image.error && (
                      <div className="text-red-600 text-sm">Error</div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => imageActions.removeImage(index)}
                      disabled={image.uploading}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ImagePreview */}
      {imageState.existingImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. ImagePreview - Imágenes Existentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ImagePreview
              images={imageState.existingImages}
              onDelete={handleDeleteExisting}
              onReorder={handleReorderExisting}
              onSetMain={(url) => {
                const updated = imageState.existingImages.map(img => ({
                  ...img,
                  isMain: img.url === url
                }))
                imageActions.reorderImages(updated)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* ImageGallery */}
      {imageState.existingImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. ImageGallery - Vista de Galería</CardTitle>
          </CardHeader>
          <CardContent>
            <EnhancedImageGallery
              images={imageState.existingImages.map(img => ({
                src: img.url,
                alt: `Imagen ${img.order + 1}`,
                caption: img.isMain ? 'Imagen principal' : `Imagen ${img.order + 1}`
              }))}
              columns={2}
              lightboxProps={{
                showThumbnails: true,
                showImageInfo: true,
                allowDownload: true
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Estado de validación */}
      {imageState.isValid && imageState.totalImages > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ Estado válido - {imageState.totalImages} imagen(es) configurada(s)
          </AlertDescription>
        </Alert>
      )}

      {/* Información de debug */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
            {JSON.stringify({
              totalImages: imageState.totalImages,
              hasChanges: imageState.hasChanges,
              canUpload: imageState.canUpload,
              isValid: imageState.isValid,
              uploading: imageState.uploading,
              newImages: imageState.images.length,
              existingImages: imageState.existingImages.length,
              errors: imageState.errors.length,
              warnings: imageState.warnings.length
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}