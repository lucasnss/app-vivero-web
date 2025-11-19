import { TreePine, MessageCircle, Facebook, MapPin, Phone, Clock, MessageSquareText } from "lucide-react"
import { StoreMap } from "./ui/StoreMap"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-800 to-green-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TreePine className="h-6 w-6 text-yellow-400" />
              <span className="font-bold text-lg">Nuestros Horarios</span>
            </div>
            
            <div className="space-y-2 text-sm text-green-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Lunes a Viernes de 9:00 a 13:00 | 16:30 a 19:30</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Sábados de 9:00 a 13:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Domingos CERRADO</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+54 381 123-4567</span>
              </div>
            </div>
          </div>

          {/* Ayuda */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-yellow-400">Ayuda</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-green-200 hover:text-white transition-colors duration-200">
                  Cuidados
                </a>
              </li>
              <li>
                <a href="#" className="text-green-200 hover:text-white transition-colors duration-200">
                  Envíos a Domicilio
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-yellow-400">Contacto</h3>
            <div className="space-y-3">
              <div className="flex space-x-4">
                <a 
                  href="https://wa.me/5493815616175" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-200 hover:text-white transition-colors duration-200"
                  title="Enviar mensaje por WhatsApp"
                >
                  <MessageSquareText className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.facebook.com/vivero.elombu" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-green-200 hover:text-white transition-colors duration-200"
                  title="Visitar nuestra página de Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-yellow-400">Nuestras Sucursales</h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="text-green-200">
                  <div className="font-medium text-white">Sucursal Av. F. de Aguirre</div>
                  <div className="text-sm">Avenida Francisco de Aguirre 2003</div>
                  <div className="text-sm">San Miguel de Tucumán</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-green-200">
                  <div className="font-medium text-white">Sucursal Av. Salta</div>
                  <div className="text-sm">Avenida Lisandro de la Torre 2300</div>
                  <div className="text-sm">San Miguel de Tucumán</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa de locales */}
        <div className="mt-12">
          <StoreMap 
            showInfo={false} 
            height="h-64" 
            className="text-gray-800"
          />
        </div>

        <div className="border-t border-green-600 mt-8 pt-8 text-center">
          <p className="text-green-200">© 2024 Vivero El Ombú. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
