"use client"

import { useState, useEffect } from "react"
import { Menu, X, ShoppingCart, TreePine, ArrowLeft, LogIn, User, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCart, savePreviousUrl } from "@/lib/cart"
import { usePathname } from "next/navigation"
import { useAuth, usePermissions } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar({ onlyBackButton = false, prevUrl }: { onlyBackButton?: boolean, prevUrl?: string | null }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()
  const { isAdmin } = usePermissions()

  // Usar useEffect para actualizar el contador del carrito solo en el cliente
  useEffect(() => {
    setMounted(true)
    const updateCartCount = () => {
      const items = getCart()
      const total = items.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(total)
    }
    
    // Actualizar inmediatamente al montar el componente
    updateCartCount()
    
    // Escuchar eventos de actualización del carrito
    window.addEventListener("cart-updated", updateCartCount)
    window.addEventListener("storage", updateCartCount)
    
    // Actualizar cada segundo para detectar cambios externos
    const interval = setInterval(updateCartCount, 1000)
    
    return () => {
      window.removeEventListener("cart-updated", updateCartCount)
      window.removeEventListener("storage", updateCartCount)
      clearInterval(interval)
    }
  }, [])

  // Guardar la URL actual cuando se hace clic en el carrito
  const handleCartClick = () => {
    if (pathname && pathname !== "/carrito" && !pathname.includes("/carrito/")) {
      savePreviousUrl(pathname)
    }
  }

  // Manejar logout
  const handleLogout = async () => {
    await logout()
    router.push('/')
    setIsMenuOpen(false)
  }

  const menuItems = [
    { name: "Inicio", href: "/" },
    { name: "Plantas", href: "/plantas" },
    { name: "Macetas", href: "/macetas" },
    { name: "Categorías", href: "/categorias" },
    { name: "Recomendaciones", href: "/recomendaciones" },
  ]

  if (onlyBackButton) {
    return (
      <nav className="bg-gradient-to-r from-green-700 to-green-600 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link
            href={prevUrl || "/"}
            className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Llenar carrito</span>
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <TreePine className="h-6 w-6 text-yellow-400" />
              <span className="font-bold text-lg">Vivero El Ombú</span>
            </Link>
          </div>

          {/* Menu desktop */}
          <div className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-yellow-300 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Carrito y Usuario */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <Link 
              href="/carrito" 
              className="relative text-white hover:text-yellow-300 transition-colors duration-200"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-6 w-6" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-green-900 text-xs font-bold rounded-full px-2 py-0.5 shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Usuario autenticado o login */}
            {mounted && isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white hover:text-yellow-300 hover:bg-green-600 hidden md:flex">
                    <User className="h-5 w-5 mr-2" />
                    Panel de Administrador
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Administrador
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin() && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/admin/sales-history')}>
                        <TreePine className="h-4 w-4 mr-2" />
                        Historial
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Shield className="h-4 w-4 mr-2" />
                        Panel de Administrador
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : mounted && !isAuthenticated ? (
              <Link 
                href="/login"
                className="hidden md:flex items-center text-white hover:text-yellow-300 transition-colors duration-200"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Iniciar Sesión
              </Link>
            ) : null}

            {/* Menu mobile button */}
            <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-green-800 rounded-lg mt-2 py-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-white hover:bg-green-700 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Opciones de usuario en mobile */}
            <div className="border-t border-green-700 mt-2 pt-2">
              {mounted && isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 text-white text-sm">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-green-300 text-xs">
                      Administrador
                    </p>
                  </div>
                  {isAdmin() && (
                    <>
                      <Link
                        href="/admin/sales-history"
                        className="flex items-center px-4 py-2 text-white hover:bg-green-700 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <TreePine className="h-4 w-4 mr-2" />
                        Historial
                      </Link>
                      <Link
                        href="/admin"
                        className="flex items-center px-4 py-2 text-white hover:bg-green-700 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Panel de Administrador
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-white hover:bg-green-700 transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </>
              ) : mounted && !isAuthenticated ? (
                <Link
                  href="/login"
                  className="flex items-center px-4 py-2 text-white hover:bg-green-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
