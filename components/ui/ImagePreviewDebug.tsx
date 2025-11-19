'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Card } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { X, ZoomIn, GripVertical, Star, StarOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePreviewDebugProps {
  images: Array<{ url: string; id?: string }>
  onDelete?: (url: string) => void
  onReorder?: (newOrder: string[]) => void
  onSetMain?: (url: string) => void
  disabled?: boolean
  className?: string
  showMainIndicator?: boolean
  showReorderButtons?: boolean
  showZoomButton?: boolean
  maxImages?: number
}

export const ImagePreviewDebug = React.memo(({
  images,
  onDelete,
  onReorder,
  onSetMain,
  disabled = false,
  className,
  showMainIndicator = true,
  showReorderButtons = true,
  showZoomButton = true,
  maxImages = 3
}: ImagePreviewDebugProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [zoomImage, setZoomImage] = useState<string | null>(null)
  
  // Contadores de render para diagnóstico
  const renderCount = useRef(0)
  const lastImagesRef = useRef(images)
  const lastOnReorderRef = useRef(onReorder)
  
  // Incrementar contador en cada render
  renderCount.current += 1
  
  // Detectar cambios en props
  useEffect(() => {
    console.log('🔄 ImagePreviewDebug - Render #', renderCount.current)
    console.log('📊 Images changed:', images !== lastImagesRef.current)
    console.log('📊 OnReorder changed:', onReorder !== lastOnReorderRef.current)
    console.log('📊 Images length:', images.length)
    console.log('📊 Images:', images.map(img => img.url))
    
    lastImagesRef.current = images
    lastOnReorderRef.current = onReorder
  })
  
  // Función para manejar drop con diagnóstico
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    console.log('🎯 handleDrop called')
    console.log('🎯 draggedIndex:', draggedIndex)
    console.log('🎯 dropIndex:', dropIndex)
    console.log('🎯 disabled:', disabled)
    
    if (disabled || draggedIndex === null) {
      console.log('❌ Drop cancelled - disabled or no dragged item')
      return
    }
    
    e.preventDefault()
    
    if (draggedIndex === dropIndex) {
      console.log('❌ Drop cancelled - same position')
      return
    }
    
    console.log('✅ Processing drop')
    const newOrder = [...images.map(img => img.url)]
    const [draggedItem] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, draggedItem)
    
    console.log('📤 Calling onReorder with:', newOrder)
    onReorder?.(newOrder)
    setDraggedIndex(null)
  }, [disabled, draggedIndex, onReorder])
  
  // Función para manejar mouse enter
  const handleMouseEnter = useCallback((index: number) => {
    console.log('🖱️ Mouse enter:', index)
    setHoveredIndex(index)
  }, [])
  
  // Función para manejar mouse leave
  const handleMouseLeave = useCallback(() => {
    console.log('🖱️ Mouse leave')
    setHoveredIndex(null)
  }, [])
  
  // Función para manejar drag start
  const handleDragStart = useCallback((index: number) => {
    console.log('🎯 Drag start:', index)
    setDraggedIndex(index)
  }, [])
  
  // Función para manejar drag end
  const handleDragEnd = useCallback(() => {
    console.log('🎯 Drag end')
    setDraggedIndex(null)
  }, [])
  
  // Función para manejar delete
  const handleDelete = useCallback((url: string) => {
    console.log('🗑️ Delete:', url)
    onDelete?.(url)
  }, [onDelete])
  
  // Función para manejar set main
  const handleSetMain = useCallback((url: string) => {
    console.log('⭐ Set main:', url)
    onSetMain?.(url)
  }, [onSetMain])
  
  // Función para manejar zoom
  const handleZoom = useCallback((url: string) => {
    console.log('🔍 Zoom:', url)
    setZoomImage(url)
  }, [])
  
  // Función para cerrar zoom
  const handleCloseZoom = useCallback(() => {
    console.log('❌ Close zoom')
    setZoomImage(null)
  }, [])
  
  console.log('🎨 Rendering ImagePreviewDebug with', images.length, 'images')
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Información de diagnóstico */}
      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
        <h3 className="font-semibold text-yellow-800">🔍 Diagnóstico del Componente</h3>
        <p className="text-sm text-yellow-700">Render #: {renderCount.current}</p>
        <p className="text-sm text-yellow-700">Imágenes: {images.length}</p>
        <p className="text-sm text-yellow-700">Dragged Index: {draggedIndex}</p>
        <p className="text-sm text-yellow-700">Hovered Index: {hoveredIndex}</p>
      </div>
      
      {/* Grid de imágenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.slice(0, maxImages).map((image, index) => (
          <Card
            key={`${image.url}-${index}`}
            className={cn(
              'relative group overflow-hidden transition-all duration-200',
              draggedIndex === index && 'opacity-50 scale-95',
              hoveredIndex === index && 'ring-2 ring-primary ring-offset-2'
            )}
            draggable={showReorderButtons && !disabled}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="aspect-square relative">
              <img
                src={image.url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Indicador de imagen principal */}
              {showMainIndicator && index === 0 && (
                <Badge
                  variant="secondary"
                  className="absolute top-2 left-2 bg-primary text-primary-foreground"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Principal
                </Badge>
              )}
              
              {/* Overlay de acciones */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                {showZoomButton && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleZoom(image.url)}
                    disabled={disabled}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                )}
                
                {showReorderButtons && index > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetMain(image.url)}
                    disabled={disabled}
                  >
                    <StarOff className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(image.url)}
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Indicador de arrastrar */}
              {showReorderButtons && !disabled && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      
      {/* Modal de zoom */}
      {zoomImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={handleCloseZoom}>
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 z-10"
              onClick={handleCloseZoom}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={zoomImage}
              alt="Vista ampliada"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
})

ImagePreviewDebug.displayName = 'ImagePreviewDebug'
