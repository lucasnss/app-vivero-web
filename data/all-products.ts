// Función para generar productos aleatorios
function generateRandomProducts() {
  const categoryIds = [
    "1", // Plantas de interior
    "2", // Plantas con flores
    "3", // Palmeras
    "4", // Árboles
    "5", // Coníferas
    "6", // Arbustos
    "7", // Frutales
    "8", // Macetas de plástico
    "9", // Macetas de arcilla
    "10", // Macetas de cemento
    "11", // Macetas de fibracemento
    "12", // Macetas rotomoldeadas
    "13", // Macetas de cerámica
    "14", // Fertilizantes
    "15", // Tierras y sustratos
    "16", // Productos químicos
    "17", // Insumos de jardinería
    "18", // Atrapasueños
    "19", // Adornos de jardín
    "20", // Souvenirs
  ]

  const plantNames = [
    "Monstera Deliciosa",
    "Ficus Lyrata",
    "Pothos Dorado",
    "Sansevieria",
    "Philodendron",
    "Begonia",
    "Geranio",
    "Petunia",
    "Rosa",
    "Lavanda",
    "Jazmín",
    "Hortensia",
    "Palmera Phoenix",
    "Palmera Washingtonia",
    "Palmera Cocos",
    "Areca",
    "Roble",
    "Jacarandá",
    "Tilo",
    "Ceibo",
    "Ombú",
    "Eucalipto",
    "Pino Paraná",
    "Ciprés",
    "Tuya",
    "Abeto",
    "Cedro",
    "Azalea",
    "Camelia",
    "Rododendro",
    "Forsitia",
    "Espirea",
    "Limonero",
    "Naranjo",
    "Mandarino",
    "Pomelo",
    "Duraznero",
  ]

  const macetaTypes = ["Maceta redonda", "Maceta cuadrada", "Maceta rectangular", "Jardinera", "Macetero colgante"]

  const otherProducts = [
    "Fertilizante líquido",
    "Compost orgánico",
    "Tierra negra",
    "Sustrato para cactus",
    "Insecticida natural",
    "Fungicida",
    "Herbicida",
    "Pala de jardín",
    "Regadera",
    "Atrapasueños artesanal",
    "Gnomo de jardín",
    "Fuente decorativa",
    "Llavero de planta",
  ]

  const scientificNames = [
    "Monstera deliciosa",
    "Ficus lyrata",
    "Epipremnum aureum",
    "Sansevieria trifasciata",
    "Philodendron hederaceum",
    "Begonia semperflorens",
    "Pelargonium zonale",
    "Petunia hybrida",
    "Rosa gallica",
    "Lavandula angustifolia",
    "Jasminum officinale",
    "Hydrangea macrophylla",
  ]

  const products = []

  for (let i = 1; i <= 50; i++) {
    const categoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)]
    let name = ""

    // Determinar el tipo de producto basado en el category_id
    const isPlant = ["1", "2", "3", "4", "5", "6", "7"].includes(categoryId)
    const isMaceta = ["8", "9", "10", "11", "12", "13"].includes(categoryId)

    if (isPlant) {
      name = plantNames[Math.floor(Math.random() * plantNames.length)]
    } else if (isMaceta) {
      const type = macetaTypes[Math.floor(Math.random() * macetaTypes.length)]
      const material = categoryId === "8" ? "plástico" : 
                      categoryId === "9" ? "arcilla" : 
                      categoryId === "10" ? "cemento" : 
                      categoryId === "11" ? "fibracemento" : 
                      categoryId === "12" ? "rotomoldeado" : "cerámica"
      name = `${type} de ${material} ${Math.floor(Math.random() * 30 + 10)}cm`
    } else {
      name = otherProducts[Math.floor(Math.random() * otherProducts.length)]
    }

    const basePrice = isMaceta
      ? Math.floor(Math.random() * 2000 + 500)
      : Math.floor(Math.random() * 5000 + 800)

    products.push({
      id: i,
      name: name,
      description: `${name} de excelente calidad.`,
      category_id: categoryId,
      price: basePrice,
      stock: Math.floor(Math.random() * 25 + 1),
      image: `/placeholder.svg?height=300&width=300`,
      scientificName: isPlant
        ? scientificNames[Math.floor(Math.random() * scientificNames.length)]
        : "N/A",
      care: isPlant
        ? "Riego moderado, luz indirecta, temperatura ambiente."
        : "Mantener en lugar seco y protegido.",
      characteristics: `Producto de alta calidad. Resistente y duradero.`,
      origin: isPlant
        ? "Cultivado en viveros especializados"
        : "Fabricado con materiales de primera calidad",
    })
  }

  return products
}

export const allProducts = generateRandomProducts()
