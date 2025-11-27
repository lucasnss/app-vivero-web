'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Shield } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)
  
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth()
  const router = useRouter()
  
  // Obtener la URL de retorno del query string (donde quería ir el usuario)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const url = params.get('returnUrl')
      console.log('📍 Login - returnUrl desde query:', url)
      setReturnUrl(url || '/admin')
    }
  }, [])

  // Redirigir si ya está autenticado
  useEffect(() => {
    // Solo redirigir si returnUrl ya está configurado
    if (isAuthenticated && !isLoading && returnUrl !== null) {
      console.log('✅ Login - Usuario autenticado, redirigiendo a:', returnUrl)
      
      // Forzar redirección inmediata con window.location
      setTimeout(() => {
        console.log('🚀 Ejecutando redirección a:', returnUrl)
        window.location.href = returnUrl
      }, 100)
    }
  }, [isAuthenticated, isLoading, returnUrl])

  // Limpiar errores cuando el usuario empiece a escribir
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      return
    }

    setIsSubmitting(true)
    
    try {
      const result = await login(email, password)
      
      if (result.success) {
        const targetUrl = returnUrl || '/admin'
        console.log('✅ Login exitoso, redirigiendo a:', targetUrl)
        
        // Dar un pequeño tiempo para que el estado se actualice
        setTimeout(() => {
          router.push(targetUrl)
        }, 100)
        
        // Fallback: si no redirige en 2 segundos, forzar redirección
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            console.log('⚠️ Fallback redirect a:', targetUrl)
            window.location.href = targetUrl
          }
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Error durante el login:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar loading mientras se verifica la autenticación inicial o esperando returnUrl
  if (isLoading || returnUrl === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado, mostrar loading mientras redirige
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-green-800">Vivero El Ombú</h1>
                <p className="text-sm text-green-600">Panel de Administración</p>
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Accede al panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@vivero.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="username"
                className="transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                  autoComplete="current-password"
                  className="pr-10 transition-colors"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              ¿Problemas para acceder?{' '}
              <button 
                className="text-green-600 hover:underline"
                onClick={() => {
                  // En el futuro, aquí podríamos agregar un enlace a "recuperar contraseña"
                  alert('Contacta al administrador del sistema')
                }}
              >
                Contacta al administrador
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 