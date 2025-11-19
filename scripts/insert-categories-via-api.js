// 🚀 INSERTAR CATEGORÍAS VÍA API - VIVERO WEB
// Script para insertar categorías usando la API del proyecto
// Ejecutar con: node scripts/insert-categories-via-api.js

const categories = [
  // Plantas
  {
    name: "Plantas de interior",
    description: "Plantas ideales para decorar espacios interiores",
    icon: "🌿",
    color: "bg-green-100 text-green-800",
    slug: "plantas-interior",
    featured: true,
    display_order: 1
  },
  {
    name: "Plantas con flores",
    description: "Plantas que producen hermosas flores",
    icon: "🌸",
    color: "bg-pink-100 text-pink-800",
    slug: "plantas-flores",
    featured: true,
    display_order: 2
  },
  {
    name: "Palmeras",
    description: "Palmeras de diferentes tamaños y variedades",
    icon: "🌴",
    color: "bg-yellow-100 text-yellow-800",
    slug: "palmeras",
    featured: false,
    display_order: 3
  },
  {
    name: "Árboles",
    description: "Árboles para jardines y espacios exteriores",
    icon: "🌳",
    color: "bg-brown-100 text-brown-800",
    slug: "arboles",
    featured: false,
    display_order: 4
  },
  {
    name: "Coníferas",
    description: "Árboles y arbustos coníferos",
    icon: "🌲",
    color: "bg-green-100 text-green-800",
    slug: "coniferas",
    featured: false,
    display_order: 5
  },
  {
    name: "Arbustos",
    description: "Arbustos ornamentales y decorativos",
    icon: "🌿",
    color: "bg-green-100 text-green-800",
    slug: "arbustos",
    featured: false,
    display_order: 6
  },
  {
    name: "Frutales",
    description: "Árboles y plantas que producen frutos",
    icon: "🍎",
    color: "bg-red-100 text-red-800",
    slug: "frutales",
    featured: false,
    display_order: 7
  },
  // Macetas
  {
    name: "Macetas",
    description: "Macetas de diferentes materiales y tamaños",
    icon: "🪴",
    color: "bg-blue-100 text-blue-800",
    slug: "macetas",
    featured: true,
    display_order: 8
  },
  // Productos de jardinería
  {
    name: "Fertilizantes",
    description: "Fertilizantes y nutrientes para plantas",
    icon: "🌱",
    color: "bg-green-100 text-green-800",
    slug: "fertilizantes",
    featured: false,
    display_order: 9
  },
  {
    name: "Tierras y sustratos",
    description: "Tierras y sustratos especializados",
    icon: "🌍",
    color: "bg-brown-100 text-brown-800",
    slug: "tierras-sustratos",
    featured: false,
    display_order: 10
  },
  {
    name: "Productos químicos",
    description: "Productos químicos para el cuidado de plantas",
    icon: "🧪",
    color: "bg-yellow-100 text-yellow-800",
    slug: "productos-quimicos",
    featured: false,
    display_order: 11
  },
  {
    name: "Insumos de jardinería",
    description: "Herramientas e insumos para jardinería",
    icon: "🛠️",
    color: "bg-blue-100 text-blue-800",
    slug: "insumos-jardineria",
    featured: false,
    display_order: 12
  },
  // Decoración y souvenirs
  {
    name: "Atrapasueños",
    description: "Atrapasueños artesanales",
    icon: "🕸️",
    color: "bg-purple-100 text-purple-800",
    slug: "atrapasuenos",
    featured: false,
    display_order: 13
  },
  {
    name: "Adornos de jardín",
    description: "Adornos y decoraciones para jardín",
    icon: "🎨",
    color: "bg-pink-100 text-pink-800",
    slug: "adornos-jardin",
    featured: false,
    display_order: 14
  },
  {
    name: "Souvenirs",
    description: "Souvenirs y regalos relacionados con plantas",
    icon: "🎁",
    color: "bg-red-100 text-red-800",
    slug: "souvenirs",
    featured: false,
    display_order: 15
  }
];

async function insertCategories() {
  console.log('🚀 Iniciando inserción de categorías...');
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const adminToken = process.env.ADMIN_TOKEN; // Token de admin para autenticación
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const category of categories) {
    try {
      console.log(`📝 Insertando: ${category.name}`);
      
      const response = await fetch(`${baseUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'x-admin-token': adminToken
        },
        body: JSON.stringify(category)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`✅ ${category.name} - Insertado correctamente`);
        successCount++;
      } else {
        console.error(`❌ ${category.name} - Error:`, result.error?.message || 'Error desconocido');
        errorCount++;
      }
      
      // Pausa pequeña entre requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ ${category.name} - Error de red:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n📊 RESUMEN:');
  console.log(`✅ Categorías insertadas: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📋 Total procesadas: ${categories.length}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertCategories().catch(console.error);
}

module.exports = { insertCategories, categories }; 