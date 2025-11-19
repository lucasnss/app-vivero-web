'use client'

import React, { useState } from 'react'
import { AdvancedImageUploader } from './ImageUploader'
import { ImageUploadState } from '../../src/types/product'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'

export function ImageUploaderExample() {
  const [images, setImages] = useState<ImageUploadState[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])

  const handleImagesChange = (newImages: ImageUploadState[]) => {
    setImages(newImages)
    console.log('Imágenes actualizadas:', newImages)
  }

  const handleUpload = async () => {
    if (images.length === 0) {
      alert('No hay imágenes para subir')
      return
    }

    // Simular subida de imágenes
    const urls: string[] = []
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      
      // Simular progreso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Actualizar progreso en la imagen
        const updatedImages = images.map((img, index) => 
          index === i ? { ...img, progress, uploading: true } : img
        )
        setImages(updatedImages)
      }

      // Simular URL de imagen subida
      const fakeUrl = `https://example.com/images/${Date.now()}-${i}.jpg`
      urls.push(fakeUrl)
    }

    setUploadedUrls(urls)
    setImages([])
    alert(`¡${images.length} imágenes subidas exitosamente!`)
  }

  const handleReset = () => {
    setImages([])
    setUploadedUrls([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Ejemplo: ImageUploader</h1>
        <p className="text-muted-foreground">
          Componente para subir múltiples imágenes con drag & drop, validaciones y preview
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuración básica */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Imágenes del Producto</label>
              <AdvancedImageUploader
                maxImages={3}
                maxFileSize={5 * 1024 * 1024}
                acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                onImagesChange={handleImagesChange}
                autoOptimize={true}
                showPreview={true}
                showProgress={true}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={images.length === 0}>
                Simular Subida
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Limpiar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración personalizada */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración Personalizada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Solo PNG (máx 2, 1MB)</label>
              <AdvancedImageUploader
                maxImages={2}
                maxFileSize={1024 * 1024} // 1MB
                acceptedTypes={['image/png']}
                onImagesChange={() => {}}
                autoOptimize={true}
                showPreview={false}
                showProgress={false}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Configuración:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Máximo: 2 imágenes</div>
                <div>• Formato: Solo PNG</div>
                <div>• Tamaño: Máximo 1MB</div>
                <div>• Sin progreso ni info de archivo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado actual */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Imágenes Seleccionadas:</h4>
              {images.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay imágenes seleccionadas</p>
              ) : (
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="text-sm font-medium">{image.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({image.file.size} bytes)
                      </span>
                      {image.uploading && (
                        <Badge variant="outline">Subiendo... {image.progress}%</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {uploadedUrls.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">URLs Subidas:</h4>
                <div className="space-y-1">
                  {uploadedUrls.map((url, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      {index + 1}. {url}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del componente */}
      <Card>
        <CardHeader>
          <CardTitle>Características del Componente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Funcionalidades:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Drag & drop de imágenes</li>
                <li>• Selección múltiple de archivos</li>
                <li>• Preview de imágenes</li>
                <li>• Validación en tiempo real</li>
                <li>• Progreso de subida</li>
                <li>• Eliminación individual</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Validaciones:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Formato de archivo</li>
                <li>• Tamaño máximo</li>
                <li>• Dimensiones mínimas</li>
                <li>• Límite de cantidad</li>
                <li>• Tipos MIME</li>
                <li>• Extensiones de archivo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 