"use client"

import React, { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { MapPin, Phone, Clock, Car } from 'lucide-react'

interface StoreLocation {
  id: string
  name: string
  address: string
  coordinates: [number, number] // [latitud, longitud]
  phone: string
  hours: string
  features: string[]
  isMain?: boolean
}

interface StoreMapProps {
  className?: string
  showInfo?: boolean
  height?: string
}

export function StoreMap({ 
  className = '', 
  showInfo = true, 
  height = 'h-96' 
}: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  // Datos de los dos locales
  const storeLocations: StoreLocation[] = [
    {
      id: 'sucursal-f-aguirre',
      name: 'Sucursal Av. F. de Aguirre',
      address: 'Avenida Francisco de Aguirre 2003, San Miguel de Tucumán',
      coordinates: [-26.790288, -65.2175075],
      phone: '+54 9 381 561-6175',
      hours: 'Atención de Lunes a Sabado | Dom: CERRADO',
      features: ['Estacionamiento', 'Envío a Domicilio', 'Vivero Especializado'],
      isMain: true
    },
    {
      id: 'sucursal-av-salta',
      name: 'Sucursal Av. Salta',
      address: 'Lisandro de la Torre 2300, San Miguel de Tucumán',
      coordinates: [-26.7989547, -65.2039087],
      phone: '+54 9 381 561-6175',
      hours: 'Atención de Lunes a Sabado | Dom: CERRADO',
      features: ['Estacionamiento', 'Envío a Domicilio', 'Vivero Especializado']
    }
  ]

  useEffect(() => {
    // Cargar Leaflet dinámicamente para evitar problemas de SSR
    const loadMap = async () => {
      try {
        // Verificar si ya está cargado
        if (typeof window !== 'undefined' && !window.L) {
          // Cargar CSS de Leaflet
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)

          // Cargar script de Leaflet
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
            script.crossOrigin = ''
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        // Inicializar mapa
        if (mapRef.current && window.L && !mapInstanceRef.current) {
          const L = window.L
          
          // Crear mapa centrado entre los dos locales
          const centerLat = (storeLocations[0].coordinates[0] + storeLocations[1].coordinates[0]) / 2
          const centerLng = (storeLocations[0].coordinates[1] + storeLocations[1].coordinates[1]) / 2
          
          mapInstanceRef.current = L.map(mapRef.current).setView([centerLat, centerLng], 12)

          // Agregar capa de OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current)

          // Agregar marcadores para cada local
          storeLocations.forEach((store, index) => {
            const isMain = store.isMain
            
            // Crear icono personalizado
            const icon = L.divIcon({
              className: 'custom-marker',
              html: `
                <div class="marker-content ${isMain ? 'main-store' : 'branch-store'}">
                  <div class="marker-icon">
                    ${isMain ? '🏪' : '🌱'}
                  </div>
                  <div class="marker-label">${store.name}</div>
                </div>
              `,
              iconSize: [80, 40],
              iconAnchor: [40, 40],
              popupAnchor: [0, -40]
            })

            // Crear marcador
            const marker = L.marker(store.coordinates, { icon })
              .addTo(mapInstanceRef.current)
              .bindPopup(`
                <div class="store-popup">
                  <h3 class="font-bold text-lg mb-2">${store.name}</h3>
                  <p class="text-sm mb-2">📍 ${store.address}</p>
                  <p class="text-sm mb-2">📞 ${store.phone}</p>
                  <p class="text-sm mb-2">🕒 ${store.hours}</p>
                  <div class="features mt-2">
                    ${store.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                  </div>
                </div>
              `)

            markersRef.current.push(marker)
          })

          // Ajustar vista para mostrar ambos marcadores
          const group = new L.featureGroup(markersRef.current)
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
        }
      } catch (error) {
        console.error('Error loading map:', error)
      }
    }

    loadMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      markersRef.current = []
    }
  }, [])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Nuestros Locales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef} 
            className={`w-full rounded-lg border ${height}`}
            style={{ minHeight: '300px' }}
          />
          
          {/* Estilos personalizados para el mapa */}
          <style jsx global>{`
            .custom-marker {
              background: transparent;
              border: none;
            }
            
            .marker-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            
            .marker-icon {
              font-size: 24px;
              margin-bottom: 4px;
            }
            
            .marker-label {
              font-size: 10px;
              font-weight: bold;
              color: #1f2937;
              background: white;
              padding: 2px 6px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              white-space: nowrap;
            }
            
            .main-store .marker-icon {
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            }
            
            .store-popup {
              min-width: 250px;
            }
            
            .feature-tag {
              display: inline-block;
              background: #f3f4f6;
              color: #374151;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              margin: 2px;
            }
          `}</style>
        </CardContent>
      </Card>

      {/* Información de los locales */}
      {showInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {storeLocations.map((store) => (
            <Card key={store.id} className={store.isMain ? 'ring-2 ring-green-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                  {store.isMain && (
                    <Badge variant="default" className="bg-green-600">
                      Principal
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{store.address}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600">{store.phone}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-600">{store.hours}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Servicios:</h4>
                  <div className="flex flex-wrap gap-1">
                    {store.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <a
                    href={`https://maps.google.com/?q=${store.coordinates[0]},${store.coordinates[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Car className="w-4 h-4" />
                    Ver en Google Maps
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default StoreMap
