"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle2, Upload } from "lucide-react"
import { ProductWithCategoryError, CategoryCorrection } from "@/types/import-types"
import { Category } from "@/types/category"
import { cn } from "@/lib/utils"

interface ProductCategoryErrorsDialogProps {
  isOpen: boolean
  onClose: () => void
  productsWithErrors: ProductWithCategoryError[]
  allCategories: Category[]
  onCorrectAndImport: (corrections: CategoryCorrection[]) => Promise<void>
}

export function ProductCategoryErrorsDialog({
  isOpen,
  onClose,
  productsWithErrors,
  allCategories,
  onCorrectAndImport
}: ProductCategoryErrorsDialogProps) {
  // Map: rowNumber -> selectedCategoryId
  const [corrections, setCorrections] = useState<Map<number, string>>(new Map())
  const [isImporting, setIsImporting] = useState(false)

  // Calcular estadísticas
  const totalErrors = productsWithErrors.length
  const correctedCount = corrections.size
  const pendingCount = totalErrors - correctedCount

  // Manejar selección de categoría
  const handleSelectCategory = useCallback((rowNumber: number, categoryId: string) => {
    setCorrections(prev => {
      const newMap = new Map(prev)
      newMap.set(rowNumber, categoryId)
      return newMap
    })
  }, [])

  // Manejar importación con correcciones
  const handleImport = useCallback(async () => {
    if (corrections.size === 0) return

    setIsImporting(true)
    try {
      const correctionsList: CategoryCorrection[] = Array.from(corrections.entries()).map(
        ([rowNumber, selectedCategoryId]) => ({
          rowNumber,
          selectedCategoryId
        })
      )
      
      await onCorrectAndImport(correctionsList)
      
      // Limpiar estado y cerrar
      setCorrections(new Map())
      onClose()
    } catch (error) {
      console.error('Error al importar productos:', error)
    } finally {
      setIsImporting(false)
    }
  }, [corrections, onCorrectAndImport, onClose])

  // Limpiar estado al cerrar
  const handleClose = useCallback(() => {
    if (!isImporting) {
      setCorrections(new Map())
      onClose()
    }
  }, [isImporting, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[700px] lg:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Corregir Errores de Categoría</DialogTitle>
          <DialogDescription>
            Algunos productos tienen errores en el nombre de la categoría. Por favor, selecciona la categoría correcta para cada producto.
          </DialogDescription>
        </DialogHeader>

        {/* Header con estadísticas */}
        <div className="flex flex-wrap gap-2 py-3 border-b">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            <AlertTriangle className="mr-1 h-3 w-3" />
            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {correctedCount} corregido{correctedCount !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Lista de productos con errores */}
        <div className="flex-1 overflow-y-auto space-y-3 py-3">
          {productsWithErrors.map((productError) => {
            const isCorrected = corrections.has(productError.rowNumber)
            const hasSuggestions = productError.suggestions.length > 0

            return (
              <Card 
                key={productError.rowNumber}
                className={cn(
                  "transition-colors",
                  isCorrected 
                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" 
                    : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                )}
              >
                <CardContent className="pt-4 space-y-3">
                  {/* Información del producto */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Fila {productError.rowNumber}
                      </Label>
                      {isCorrected && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">Producto:</span> {productError.productName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Categoría ingresada:</span>{" "}
                      <span className="text-red-600 dark:text-red-400 font-mono">
                        "{productError.categoryNameProvided}"
                      </span>
                    </p>
                  </div>

                  {/* Selector de categoría */}
                  <div className="space-y-2">
                    <Label htmlFor={`category-select-${productError.rowNumber}`} className="text-sm">
                      {hasSuggestions ? 'Selecciona la categoría correcta:' : 'Selecciona manualmente la categoría correcta:'}
                    </Label>
                    
                    {hasSuggestions ? (
                      <>
                        {/* Mostrar sugerencias con porcentaje de similitud */}
                        <Select
                          value={corrections.get(productError.rowNumber) || ''}
                          onValueChange={(value) => handleSelectCategory(productError.rowNumber, value)}
                        >
                          <SelectTrigger 
                            id={`category-select-${productError.rowNumber}`}
                            className={cn(
                              "w-full",
                              isCorrected && "border-green-500 dark:border-green-600"
                            )}
                          >
                            <SelectValue placeholder="Selecciona una categoría..." />
                          </SelectTrigger>
                          <SelectContent>
                            {productError.suggestions.map((suggestion) => (
                              <SelectItem 
                                key={suggestion.category.id} 
                                value={suggestion.category.id}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{suggestion.category.name}</span>
                                  <Badge 
                                    variant="outline" 
                                    className="ml-2 text-xs"
                                  >
                                    {suggestion.similarity}%
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        {/* Sin sugerencias: mostrar todas las categorías disponibles */}
                        <div className="p-2 border border-yellow-300 dark:border-yellow-700 rounded-md bg-yellow-50 dark:bg-yellow-900/20 mb-2">
                          <p className="text-xs text-yellow-700 dark:text-yellow-300">
                            No se encontraron coincidencias. Selecciona manualmente la categoría correcta.
                          </p>
                        </div>
                        <Select
                          value={corrections.get(productError.rowNumber) || ''}
                          onValueChange={(value) => handleSelectCategory(productError.rowNumber, value)}
                        >
                          <SelectTrigger 
                            id={`category-select-${productError.rowNumber}`}
                            className={cn(
                              "w-full",
                              isCorrected && "border-green-500 dark:border-green-600"
                            )}
                          >
                            <SelectValue placeholder="Selecciona una categoría..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allCategories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Footer con botones */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isImporting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleImport}
            disabled={corrections.size === 0 || isImporting}
            className="w-full sm:w-auto"
          >
            {isImporting ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-pulse" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Corregir e Importar ({correctedCount})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

