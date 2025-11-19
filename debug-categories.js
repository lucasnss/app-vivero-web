// Debug de categorías
async function debugCategories() {
  try {
    const response = await fetch('http://localhost:3001/api/categories');
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Raw data:', JSON.stringify(data, null, 2));
    console.log('Type of data:', typeof data);
    console.log('Is array:', Array.isArray(data));
    console.log('Data length:', data.length);
    
    if (data && data.length > 0) {
      console.log('First category:', data[0]);
      console.log('First category ID:', data[0].id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

debugCategories(); 