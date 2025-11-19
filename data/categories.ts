import { Category } from '@/types/category'

// Re-exportar el tipo para compatibilidad
export type { Category }

// Mock de categorías
export const categories: Category[] = [
  {
    id: "1",
    name: "Plantas de interior",
    description: "Plantas ideales para decorar espacios interiores",
    icon: "🌿",
    color: "bg-green-100 text-green-800",
    slug: "plantas-interior"
  },
  {
    id: "2",
    name: "Plantas con flores",
    description: "Plantas que producen hermosas flores",
    icon: "🌸",
    color: "bg-pink-100 text-pink-800",
    slug: "plantas-flores"
  },
  {
    id: "3",
    name: "Palmeras",
    description: "Palmeras de diferentes tamaños y variedades",
    icon: "🌴",
    color: "bg-yellow-100 text-yellow-800",
    slug: "palmeras"
  },
  {
    id: "4",
    name: "Árboles",
    description: "Árboles para jardines y espacios exteriores",
    icon: "🌳",
    color: "bg-brown-100 text-brown-800",
    slug: "arboles"
  },
  {
    id: "5",
    name: "Coníferas",
    description: "Árboles y arbustos coníferos",
    icon: "🌲",
    color: "bg-green-100 text-green-800",
    slug: "coniferas"
  },
  {
    id: "6",
    name: "Arbustos",
    description: "Arbustos ornamentales y decorativos",
    icon: "🌿",
    color: "bg-green-100 text-green-800",
    slug: "arbustos"
  },
  {
    id: "7",
    name: "Frutales",
    description: "Árboles y plantas que producen frutos",
    icon: "🍎",
    color: "bg-red-100 text-red-800",
    slug: "frutales"
  },
  {
    id: "8",
    name: "Macetas de plástico",
    description: "Macetas fabricadas en plástico resistente",
    icon: "🪴",
    color: "bg-blue-100 text-blue-800",
    slug: "macetas-plastico"
  },
  {
    id: "9",
    name: "Macetas de arcilla",
    description: "Macetas tradicionales de arcilla",
    icon: "🏺",
    color: "bg-orange-100 text-orange-800",
    slug: "macetas-arcilla"
  },
  {
    id: "10",
    name: "Macetas de cemento",
    description: "Macetas de cemento para exteriores",
    icon: "🧱",
    color: "bg-gray-100 text-gray-800",
    slug: "macetas-cemento"
  },
  {
    id: "11",
    name: "Macetas de fibracemento",
    description: "Macetas de fibracemento duraderas",
    icon: "🏗️",
    color: "bg-gray-100 text-gray-800",
    slug: "macetas-fibracemento"
  },
  {
    id: "12",
    name: "Macetas rotomoldeadas",
    description: "Macetas rotomoldeadas de alta calidad",
    icon: "🔄",
    color: "bg-purple-100 text-purple-800",
    slug: "macetas-rotomoldeadas"
  },
  {
    id: "13",
    name: "Macetas de cerámica",
    description: "Macetas artesanales de cerámica",
    icon: "🏺",
    color: "bg-red-100 text-red-800",
    slug: "macetas-ceramica"
  },
  {
    id: "14",
    name: "Fertilizantes",
    description: "Fertilizantes y nutrientes para plantas",
    icon: "🌱",
    color: "bg-green-100 text-green-800",
    slug: "fertilizantes"
  },
  {
    id: "15",
    name: "Tierras y sustratos",
    description: "Tierras y sustratos especializados",
    icon: "🌍",
    color: "bg-brown-100 text-brown-800",
    slug: "tierras-sustratos"
  },
  {
    id: "16",
    name: "Productos químicos",
    description: "Productos químicos para el cuidado de plantas",
    icon: "🧪",
    color: "bg-yellow-100 text-yellow-800",
    slug: "productos-quimicos"
  },
  {
    id: "17",
    name: "Insumos de jardinería",
    description: "Herramientas e insumos para jardinería",
    icon: "🛠️",
    color: "bg-blue-100 text-blue-800",
    slug: "insumos-jardineria"
  },
  {
    id: "18",
    name: "Atrapasueños",
    description: "Atrapasueños artesanales",
    icon: "🕸️",
    color: "bg-purple-100 text-purple-800",
    slug: "atrapasuenos"
  },
  {
    id: "19",
    name: "Adornos de jardín",
    description: "Adornos y decoraciones para jardín",
    icon: "🎨",
    color: "bg-pink-100 text-pink-800",
    slug: "adornos-jardin"
  },
  {
    id: "20",
    name: "Souvenirs",
    description: "Souvenirs y regalos relacionados con plantas",
    icon: "🎁",
    color: "bg-red-100 text-red-800",
    slug: "souvenirs"
  }
]

// Función para obtener categoría por ID
export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id)
}

// Función para obtener categoría por slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(category => category.slug === slug)
}

// Función para obtener categoría por nombre
export function getCategoryByName(name: string): Category | undefined {
  return categories.find(category => category.name === name)
}

// Función para obtener todas las categorías
export function getAllCategories(): Category[] {
  return categories
} 