import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Lightbulb, Droplets, Sun, Scissors } from "lucide-react"

export default function RecomendacionesPage() {
  const tips = [
    {
      icon: <Droplets className="h-8 w-8 text-blue-500" />,
      title: "Riego Adecuado",
      description: "La mayoría de las plantas mueren por exceso de agua. Verifica la humedad del suelo antes de regar.",
      details: "Introduce tu dedo 2-3 cm en la tierra. Si está húmeda, espera. Si está seca, es momento de regar.",
    },
    {
      icon: <Sun className="h-8 w-8 text-yellow-500" />,
      title: "Luz Correcta",
      description: "Cada planta tiene necesidades específicas de luz. Observa las señales que te da tu planta.",
      details: "Hojas amarillas pueden indicar exceso de luz, hojas pálidas o estiradas indican falta de luz.",
    },
    {
      icon: <Scissors className="h-8 w-8 text-green-500" />,
      title: "Poda Regular",
      description: "La poda estimula el crecimiento y mantiene la forma de tus plantas.",
      details: "Retira hojas secas, amarillas o dañadas. Poda en primavera para estimular nuevo crecimiento.",
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-orange-500" />,
      title: "Observación Diaria",
      description: "Dedica unos minutos diarios a observar tus plantas para detectar problemas temprano.",
      details: "Busca cambios en color, textura, presencia de plagas o signos de enfermedad.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <Navbar />

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-yellow-500">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Guía de Cuidados</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Consejos expertos para mantener tus plantas saludables y hermosas. Más de 15 años de experiencia a tu
            disposición.
          </p>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">{tip.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">{tip.title}</h3>
                    <p className="text-gray-600 mb-3">{tip.description}</p>
                    <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">{tip.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Care Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-100 to-yellow-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-green-800 mb-8">Cuidados Estacionales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Primavera", "Verano", "Otoño", "Invierno"].map((season, index) => (
              <div key={season} className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h3 className="text-lg font-bold text-green-800 mb-3">{season}</h3>
                <p className="text-gray-600 text-sm">
                  {season === "Primavera" && "Época de crecimiento. Aumenta el riego y fertilización."}
                  {season === "Verano" && "Protege del sol directo intenso. Riega más frecuentemente."}
                  {season === "Otoño" && "Prepara las plantas para el invierno. Reduce fertilización."}
                  {season === "Invierno" && "Reduce riego. Protege del frío. Menos fertilizante."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
