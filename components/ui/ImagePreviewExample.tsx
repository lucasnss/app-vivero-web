'use client'

import * as React from 'react'
import { useState } from 'react'
import { ImagePreview } from './ImagePreview'
import { ImagePreview as ImagePreviewType } from '../../src/types/product'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Switch } from './switch'
import { Label } from './label'

export const ImagePreviewExample = () => {
  // Datos de ejemplo
  const [images, setImages] = useState<ImagePreviewType[]>([
    {
      url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
      isMain: true,
      order: 1
    },
    {
      url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
      isMain: false,
      order: 2
    },
    {
      url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
      isMain: false,
      order: 3
    }
  ])

  // Estados para controles
  const [disabled, setDisabled] = useState(false)
  const [showMainIndicator, setShowMainIndicator] = useState(true)
  const [showReorderButtons, setShowReorderButtons] = useState(true)
  const [showZoomButton, setShowZoomButton] = useState(true)

  // Función para eliminar imagen
  const handleDelete = (imageUrl: string) => {
    setImages(prev => prev.filter(img => img.url !== imageUrl))
  }

  // Función para reordenar imágenes
  const handleReorder = (newOrder: string[]) => {
    setImages(prev => {
      const newImages = newOrder.map((url, index) => {
        const existingImage = prev.find(img => img.url === url)
        return {
          ...existingImage!,
          order: index + 1,
          isMain: index === 0 // La primera imagen es la principal
        }
      })
      return newImages
    })
  }

  // Función para establecer imagen principal
  const handleSetMain = (imageUrl: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isMain: img.url === imageUrl
    })))
  }

  // Función para agregar imagen de ejemplo
  const addExampleImage = () => {
    if (images.length >= 3) return

    const newImage: ImagePreviewType = {
      url: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=400&h=400&fit=crop`,
      isMain: false,
      order: images.length + 1
    }

    setImages(prev => [...prev, newImage])
  }

  // Función para resetear imágenes
  const resetImages = () => {
    setImages([
      {
        url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop',
        isMain: true,
        order: 1
      },
      {
        url: 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
        isMain: false,
        order: 2
      }
    ])
  }

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">ImagePreview Component</h1>
        <p className="text-gray-600">
          Componente para mostrar y gestionar imágenes existentes de productos
        </p>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Controles del Componente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="disabled"
                checked={disabled}
                onCheckedChange={setDisabled}
              />
              <Label htmlFor="disabled">Deshabilitado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showMainIndicator"
                checked={showMainIndicator}
                onCheckedChange={setShowMainIndicator}
              />
              <Label htmlFor="showMainIndicator">Indicador Principal</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showReorderButtons"
                checked={showReorderButtons}
                onCheckedChange={setShowReorderButtons}
              />
              <Label htmlFor="showReorderButtons">Botones Reordenar</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showZoomButton"
                checked={showZoomButton}
                onCheckedChange={setShowZoomButton}
              />
              <Label htmlFor="showZoomButton">Botón Zoom</Label>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={addExampleImage} disabled={images.length >= 3}>
              Agregar Imagen
            </Button>
            <Button onClick={resetImages} variant="outline">
              Resetear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información del estado */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Total de imágenes:</strong> {images.length}</p>
            <p><strong>Imagen principal:</strong> {images.find(img => img.isMain)?.url || 'Ninguna'}</p>
            <p><strong>Orden actual:</strong> {images.map(img => img.order).join(' → ')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Componente ImagePreview */}
      <Card>
        <CardHeader>
          <CardTitle>ImagePreview Component</CardTitle>
        </CardHeader>
        <CardContent>
          <ImagePreview
            images={images}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onSetMain={handleSetMain}
            disabled={disabled}
            showMainIndicator={showMainIndicator}
            showReorderButtons={showReorderButtons}
            showZoomButton={showZoomButton}
            maxImages={3}
          />
        </CardContent>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Funcionalidades:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Eliminar:</strong> Haz clic en el botón de eliminar (🗑️) en el overlay de cada imagen</li>
              <li><strong>Reordenar:</strong> Arrastra las imágenes para cambiar su orden (la primera será la principal)</li>
              <li><strong>Establecer principal:</strong> Usa el botón "Establecer como principal" o reordena las imágenes</li>
              <li><strong>Zoom:</strong> Haz clic en el botón de zoom (🔍) para ver la imagen ampliada</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Props disponibles:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><code>images</code>: Array de imágenes con URL, estado principal y orden</li>
              <li><code>onDelete</code>: Función llamada al eliminar una imagen</li>
              <li><code>onReorder</code>: Función llamada al reordenar imágenes</li>
              <li><code>onSetMain</code>: Función llamada al establecer imagen principal</li>
              <li><code>disabled</code>: Deshabilita todas las interacciones</li>
              <li><code>showMainIndicator</code>: Muestra indicador de imagen principal</li>
              <li><code>showReorderButtons</code>: Habilita reordenamiento por drag & drop</li>
              <li><code>showZoomButton</code>: Muestra botón de zoom</li>
              <li><code>maxImages</code>: Límite máximo de imágenes (por defecto 3)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 