// Interceptor global para manejar errores de autenticación
let isInterceptorSetup = false

export function setupApiInterceptor() {
  // Verificar que estamos en el navegador
  if (typeof window === 'undefined') {
    return
  }

  // Evitar configurar el interceptor múltiples veces
  if (isInterceptorSetup) {
    return
  }

  // Interceptar fetch para manejar errores 401/403 globalmente
  const originalFetch = window.fetch

  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args)
      
      // Si hay error de autenticación, emitir evento personalizado
      if (response.status === 401 || response.status === 403) {
        // Verificar que window.dispatchEvent esté disponible
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('auth-error', {
            detail: {
              status: response.status,
              url: args[0],
              message: response.status === 401 ? 'Sesión expirada' : 'Permisos insuficientes'
            }
          }))
        }
      }
      
      return response
    } catch (error) {
      // Manejar errores de red u otros errores
      console.error('Error en petición:', error)
      throw error
    }
  }

  isInterceptorSetup = true
}

// Función helper para hacer peticiones con manejo de errores
export async function apiRequest(url: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP Error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error en ${options.method || 'GET'} ${url}:`, error)
    throw error
  }
}

// Función para hacer peticiones autenticadas
export const authApi = {
  get: (url: string) => apiRequest(url, { method: 'GET' }),
  post: (url: string, data?: any) => apiRequest(url, { 
    method: 'POST', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  put: (url: string, data?: any) => apiRequest(url, { 
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined 
  }),
  delete: (url: string) => apiRequest(url, { method: 'DELETE' }),
} 