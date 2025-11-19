"use client"

import { useState } from 'react'
import { EnhancedImageGallery } from './ImageGallery'
import { Card, CardContent, CardHeader, CardTitle } from './card'

export const ImageGalleryExample = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Imágenes de ejemplo para demostración
  const sampleImages = [
    '/placeholder.jpg',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop'
  ]

  const singleImage = ['/placeholder.jpg']
  const emptyImages: string[] = []

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">ImageGallery Component</h1>
        <p className="text-gray-600">
          Ejemplos de uso del componente ImageGallery con diferentes configuraciones
        </p>
      </div>

      {/* Ejemplo 1: Galería completa */}
      <Card>
        <CardHeader>
          <CardTitle>Galería Completa - Múltiples Imágenes</CardTitle>
          <p className="text-sm text-gray-600">
            Incluye navegación, zoom, contador y miniaturas
          </p>
        </CardHeader>
        <CardContent>
          <EnhancedImageGallery
            images={sampleImages.map((src, index) => ({
              src,
              alt: `Imagen ${index + 1}`,
              caption: `Imagen ${index + 1} de ${sampleImages.length}`
            }))}
            columns={1}
            lightboxProps={{
              initialIndex: currentIndex,
              showThumbnails: true,
              showImageInfo: true,
              allowDownload: true
            }}
          />
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm">
              <strong>Imagen actual:</strong> {currentIndex + 1} de {sampleImages.length}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Funcionalidades: Navegación con flechas del teclado, zoom con clic, miniaturas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo 2: Galería simple */}
      <Card>
        <CardHeader>
          <CardTitle>Galería Simple - Sin Controles Extra</CardTitle>
          <p className="text-sm text-gray-600">
            Solo navegación básica, sin zoom ni contador
          </p>
        </CardHeader>
        <CardContent>
          <EnhancedImageGallery
            images={sampleImages.map((src, index) => ({
              src,
              alt: `Imagen ${index + 1}`
            }))}
            columns={1}
            lightboxProps={{
              showThumbnails: true,
              showImageInfo: false,
              allowDownload: false
            }}
          />
        </CardContent>
      </Card>

      {/* Ejemplo 3: Una sola imagen */}
      <Card>
        <CardHeader>
          <CardTitle>Imagen Individual</CardTitle>
          <p className="text-sm text-gray-600">
            Cuando solo hay una imagen (sin navegación ni miniaturas)
          </p>
        </CardHeader>
        <CardContent>
          <EnhancedImageGallery
            images={singleImage.map((src, index) => ({
              src,
              alt: `Imagen ${index + 1}`
            }))}
            columns={1}
            lightboxProps={{
              showThumbnails: false,
              showImageInfo: false,
              allowDownload: true
            }}
          />
        </CardContent>
      </Card>

      {/* Ejemplo 4: Sin imágenes */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Vacío</CardTitle>
          <p className="text-sm text-gray-600">
            Cuando no hay imágenes disponibles
          </p>
        </CardHeader>
        <CardContent>
          <EnhancedImageGallery
            images={[]}
            columns={1}
            lightboxProps={{
              showThumbnails: false,
              showImageInfo: false,
              allowDownload: false
            }}
          />
        </CardContent>
      </Card>

      {/* Ejemplo 5: Galería compacta */}
      <Card>
        <CardHeader>
          <CardTitle>Galería Compacta</CardTitle>
          <p className="text-sm text-gray-600">
            Versión más pequeña para espacios reducidos
          </p>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            <EnhancedImageGallery
              images={sampleImages.map((src, index) => ({
                src,
                alt: `Imagen ${index + 1}`
              }))}
              columns={1}
              className="h-48"
              lightboxProps={{
                showThumbnails: true,
                showImageInfo: true,
                allowDownload: false
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documentación de props */}
      <Card>
        <CardHeader>
          <CardTitle>Propiedades del Componente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">images: string[]</code>
              <p className="text-gray-600">Array de URLs de imágenes a mostrar</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">currentIndex?: number</code>
              <p className="text-gray-600">Índice de la imagen actualmente seleccionada (por defecto: 0)</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">onImageChange?: (index: number) => void</code>
              <p className="text-gray-600">Callback que se ejecuta cuando cambia la imagen activa</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">showCounter?: boolean</code>
              <p className="text-gray-600">Mostrar contador "X/Y" (por defecto: true)</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">showNavigation?: boolean</code>
              <p className="text-gray-600">Mostrar botones de navegación (por defecto: true)</p>
            </div>
            <div>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">allowZoom?: boolean</code>
              <p className="text-gray-600">Permitir zoom en las imágenes (por defecto: true)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}