import { ArrowRight, BookOpen } from "lucide-react"

export default function Hero() {
  return (
    <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Contenido izquierdo */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transforma tu hogar con plantas naturales
            </h1>
            <p className="text-xl text-green-100 mb-8 leading-relaxed">
              Descubre nuestra amplia selección de plantas, macetas y accesorios. Más de 15 años creando espacios verdes
              únicos para tu hogar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-green-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <span>Explorar catálogo</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Guía de cuidado</span>
              </button>
            </div>
          </div>

          {/* Imagen derecha */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/placeholder.svg?height=400&width=500"
                alt="Vivero El Ombú - Local físico"
                className="rounded-2xl shadow-2xl w-full max-w-md lg:max-w-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
