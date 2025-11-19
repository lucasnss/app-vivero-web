"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export interface ImageItem {
  src: string
  alt?: string
  caption?: string
  thumbnail?: string
}

interface ImageLightboxProps {
  images: ImageItem[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
  showThumbnails?: boolean
  showImageInfo?: boolean
  allowDownload?: boolean
  className?: string
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  showThumbnails = true,
  showImageInfo = true,
  allowDownload = true,
  className = ''
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  // Reset zoom y posición cuando cambia la imagen
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setImageLoaded(false)
  }, [currentIndex])

  // Manejar teclas del teclado
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          resetZoom()
          break
        case 'r':
        case 'R':
          handleRotate()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  // Prevenir scroll del body cuando el lightbox está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.5))
  }, [])

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360)
  }, [])

  const handleDownload = useCallback(async () => {
    const image = images[currentIndex]
    if (!image) return

    try {
      const response = await fetch(image.src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `imagen-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando imagen:', error)
    }
  }, [images, currentIndex])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom === 1) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }, [zoom, position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || zoom === 1) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart, zoom])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }, [])

  const currentImage = images[currentIndex]

  if (!isOpen || !currentImage) return null

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center ${className}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Header con controles */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {currentIndex + 1} de {images.length}
            </Badge>
            {showImageInfo && currentImage.caption && (
              <span className="text-white text-sm">{currentImage.caption}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Controles de zoom */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              className="text-white hover:bg-white/20"
            >
              {Math.round(zoom * 100)}%
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            {/* Rotar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            {/* Descargar */}
            {allowDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* Cerrar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Navegación anterior */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="lg"
            onClick={goToPrevious}
            className="absolute left-4 z-10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* Contenedor de imagen */}
        <div
          className="relative max-w-full max-h-full cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <Image
            src={currentImage.src}
            alt={currentImage.alt || `Imagen ${currentIndex + 1}`}
            width={800}
            height={600}
            className="max-w-full max-h-[80vh] object-contain"
            onLoad={() => setImageLoaded(true)}
            priority
          />
          
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Navegación siguiente */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="lg"
            onClick={goToNext}
            className="absolute right-4 z-10 text-white hover:bg-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex justify-center space-x-2 overflow-x-auto max-w-full">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`
                  flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all
                  ${index === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-80'}
                `}
              >
                <Image
                  src={image.thumbnail || image.src}
                  alt={`Thumbnail ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones de uso */}
      <div className="absolute bottom-4 left-4 text-white text-xs opacity-50">
        <p>Usa las flechas del teclado para navegar</p>
        <p>+ / - para zoom, R para rotar, ESC para cerrar</p>
      </div>
    </div>
  )
}

// Componente de galería que integra el lightbox
interface ImageGalleryProps {
  images: ImageItem[]
  columns?: number
  gap?: number
  className?: string
  lightboxProps?: Partial<ImageLightboxProps>
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  className = '',
  lightboxProps = {}
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  return (
    <>
      <div 
        className={`grid gap-${gap} ${className}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openLightbox(index)}
          >
            <Image
              src={image.thumbnail || image.src}
              alt={image.alt || `Imagen ${index + 1}`}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex || 0}
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        {...lightboxProps}
      />
    </>
  )
}

export default ImageLightbox
