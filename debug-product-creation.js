// Debug detallado de creación de productos
const API_BASE_URL = 'http://localhost:3001/api';

async function debugProductCreation() {
  console.log('=== DEBUG CREACIÓN DE PRODUCTOS ===\n');
  
  // Paso 1: Login
  console.log('1. Haciendo login...');
  const loginResponse = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@vivero.com',
      password: 'admin123'
    })
  });
  
  console.log('Login Status:', loginResponse.status);
  const loginData = await loginResponse.json();
  console.log('Login Response:', JSON.stringify(loginData, null, 2));
  
  if (!loginResponse.ok) {
    console.log('❌ Login falló');
    return;
  }
  
  const token = loginData.data?.token || loginData.token;
  console.log(`Token: ${token?.substring(0, 30)}...\n`);
  
  // Paso 2: Obtener categoría
  console.log('2. Obteniendo categorías...');
  const categoryResponse = await fetch(`${API_BASE_URL}/categories`);
  const categoryData = await categoryResponse.json();
  const categories = categoryData.data || categoryData;
  const categoryId = categories[0]?.id;
  console.log(`Categoría ID: ${categoryId}\n`);
  
  // Paso 3: Intentar crear producto
  console.log('3. Intentando crear producto...');
  
  const productData = {
    name: "Debug Product",
    description: "Producto para debug de la creación",
    category_id: categoryId,
    price: 15.99,
    stock: 5,
    scientificName: "Debugus Productus",
    care: "Cuidados de debug",
    characteristics: "Características de prueba",
    origin: "Debug Lab",
    featured: false
  };
  
  console.log('Datos del producto:', JSON.stringify(productData, null, 2));
  console.log(`URL: ${API_BASE_URL}/products`);
  console.log(`Token: Bearer ${token?.substring(0, 20)}...`);
  
  try {
    const productResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    
    console.log('\n--- RESPUESTA DEL SERVIDOR ---');
    console.log('Status:', productResponse.status);
    console.log('Status Text:', productResponse.statusText);
    console.log('Headers:', Object.fromEntries(productResponse.headers.entries()));
    
    // Obtener respuesta como texto primero
    const responseText = await productResponse.text();
    console.log('Raw Response:', responseText);
    
    if (responseText) {
      try {
        const productResult = JSON.parse(responseText);
        console.log('Parsed Response:', JSON.stringify(productResult, null, 2));
      } catch (parseError) {
        console.log('❌ Error parseando JSON:', parseError.message);
      }
    } else {
      console.log('❌ Respuesta vacía del servidor');
    }
    
  } catch (error) {
    console.error('❌ Error en fetch:', error);
  }
}

debugProductCreation(); 