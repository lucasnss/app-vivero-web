"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Upload, FileText, FileUp, CheckCircle, AlertTriangle, X, Pencil } from "lucide-react"
import * as XLSX from 'xlsx'
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { Product } from "@/lib/products"
import { Category } from "@/types/category"
import { getAllCategories } from "@/lib/categories"
import { findCategoryByName } from "@/lib/categoryMatcher"
import { 
  ValidProductForBulk, 
  ProductWithCategoryError, 
  CategoryCorrection,
  ParsedExcelProduct 
} from "@/types/import-types"
import { ProductCategoryErrorsDialog } from "@/components/product-category-errors-dialog"

// Extensiones permitidas de Excel
const allowedExtensions = ['.xlsx', '.xls']

interface ExcelUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onDataProcessed: (data: Partial<Product>[]) => Promise<void>
}

interface FileValidation {
  isValid: boolean
  error?: string
  file?: File
}

export function ExcelUploadDialog({ isOpen, onClose, onDataProcessed }: ExcelUploadDialogProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [validationResult, setValidationResult] = useState<FileValidation | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [completeData, setCompleteData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [totalProducts, setTotalProducts] = useState<number>(0)
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; header: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showConfirmClose, setShowConfirmClose] = useState(false)
  const [shouldCloseMainModal, setShouldCloseMainModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Nuevos estados para fuzzy matching
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryErrors, setCategoryErrors] = useState<ProductWithCategoryError[]>([])
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [validProductsCache, setValidProductsCache] = useState<ValidProductForBulk[]>([])

  // Cargar categorías cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      getAllCategories()
        .then((cats) => {
          setCategories(cats)
        })
        .catch((error) => {
          console.error('Error cargando categorías:', error)
          toast({
            title: "Error",
            description: "No se pudieron cargar las categorías",
            variant: "destructive",
            duration: 4000,
          })
        })
    }
  }, [isOpen, toast])

  // Validar archivo
  const validateFile = useCallback((file: File): FileValidation => {
    // Verificar tamaño del archivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.'
      }
    }

    // Verificar extensión
    const fileName = file.name.toLowerCase()
    const hasValidExtension = allowedExtensions.some((ext: string) => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      return {
        isValid: false,
        error: 'Solo se permiten archivos de Excel (.xlsx, .xls).'
      }
    }

    return {
      isValid: true,
      file
    }
  }, [])

  // Procesar archivo Excel con fuzzy matching de categorías
  const processExcelFile = useCallback(async (file: File) => {
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        throw new Error("El archivo está vacío")
      }

      // Validar límites
      if (jsonData.length > 500) {
        throw new Error(`El archivo contiene ${jsonData.length} productos. El máximo permitido es 500 productos por carga.`)
      }

      if (jsonData.length < 1) {
        throw new Error("Debe incluir al menos 1 producto.")
      }

      // Obtener headers
      const firstRow = jsonData[0] as Record<string, unknown>
      const headers = Object.keys(firstRow)
      setHeaders(headers)
      setTotalProducts(jsonData.length)
      setPreviewData(jsonData.slice(0, 5)) // Mostrar solo las primeras 5 filas
      setCompleteData(jsonData) // Guardar datos completos

      // Buscar columna de categoría (case insensitive)
      const categoryKey = headers.find(h => 
        h.toLowerCase() === 'category' || 
        h.toLowerCase() === 'categoria' ||
        h.toLowerCase() === 'categoría'
      )

      if (!categoryKey) {
        throw new Error('El archivo debe contener una columna "category" o "categoria"')
      }

      // Procesar productos con fuzzy matching
      const validProducts: ValidProductForBulk[] = []
      const productsWithErrors: ProductWithCategoryError[] = []

      jsonData.forEach((row: any, index: number) => {
        const rowNumber = index + 2 // Fila en Excel (1 es header, así que +2)
        const categoryName = String(row[categoryKey] || '').trim()

        // Validar campos requeridos
        if (!row.name || !categoryName || row.price === undefined) {
          productsWithErrors.push({
            rowNumber,
            productName: row.name || `Fila ${rowNumber}`,
            categoryNameProvided: categoryName || '(vacío)',
            suggestions: [],
            originalProduct: row as ParsedExcelProduct
          })
          return
        }

        // Hacer fuzzy matching
        const matchResult = findCategoryByName(categoryName, categories)

        if (matchResult.exactMatch) {
          // Match exacto (≥85%) - agregar a productos válidos
          const validProduct: ValidProductForBulk = {
            name: String(row.name).trim(),
            description: String(row.description || '').trim(),
            category_id: matchResult.exactMatch.id,
            price: Number(row.price),
            stock: Number(row.stock || 0),
            scientificName: String(row.scientificName || '').trim(),
            care: String(row.care || '').trim(),
            characteristics: String(row.characteristics || '').trim(),
            origin: String(row.origin || '').trim(),
            image: String(row.image || '/placeholder.svg').trim(),
            images: row.images 
              ? String(row.images).split(',').map(i => i.trim()) 
              : [String(row.image || '/placeholder.svg').trim()],
            featured: row.featured === true || row.featured === 'true' || row.featured === '1' || row.featured === 1 || false
          }
          validProducts.push(validProduct)
        } else if (matchResult.suggestions.length > 0) {
          // Sugerencias (60-84%) - agregar a errores con sugerencias
          productsWithErrors.push({
            rowNumber,
            productName: String(row.name).trim(),
            categoryNameProvided: categoryName,
            suggestions: matchResult.suggestions,
            originalProduct: row as ParsedExcelProduct
          })
        } else {
          // Sin match (<60%) - agregar a errores sin sugerencias
          productsWithErrors.push({
            rowNumber,
            productName: String(row.name).trim(),
            categoryNameProvided: categoryName,
            suggestions: [],
            originalProduct: row as ParsedExcelProduct
          })
        }
      })

      // Guardar resultados en estados
      setValidProductsCache(validProducts)
      setCategoryErrors(productsWithErrors)

      console.log(`Procesamiento completo: ${validProducts.length} válidos, ${productsWithErrors.length} con errores`)

      return jsonData
    } catch (error) {
      console.error("Error al procesar el archivo:", error)
      throw error instanceof Error ? error : new Error("Error al procesar el archivo Excel")
    }
  }, [categories])

  // Manejar archivos seleccionados
  const handleFileSelection = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validation = validateFile(file)
    setValidationResult(validation)

    if (validation.isValid) {
      try {
        await processExcelFile(file)
        setSelectedFile(file)
        toast({
          title: "Archivo seleccionado",
          description: `${file.name} está listo para importar.`,
          duration: 3000,
        })
      } catch (error) {
        setSelectedFile(null)
        toast({
          title: "Error en el archivo",
          description: error instanceof Error ? error.message : "Error al procesar el archivo",
          variant: "destructive",
          duration: 4000,
        })
      }
    } else {
      setSelectedFile(null)
      toast({
        title: "Error en el archivo",
        description: validation.error,
        variant: "destructive",
        duration: 4000,
      })
    }
  }, [validateFile, processExcelFile, toast])

  // Eventos de drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelection(e.dataTransfer.files)
  }, [handleFileSelection])

  // Manejar click en el área de drop
  const handleAreaClick = () => fileInputRef.current?.click()

  // Manejar cambio en input file
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files)
  }, [handleFileSelection])

  // Limpiar archivo seleccionado
  const handleClearFile = useCallback(() => {
    setSelectedFile(null)
    setValidationResult(null)
    setPreviewData([])
    setCompleteData([])
    setHeaders([])
    setTotalProducts(0)
    setIsDragOver(false)
    setEditingCell(null)
    setEditValue("")
    setCategoryErrors([])
    setValidProductsCache([])
    setShowErrorDialog(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Manejar importación con fuzzy matching
  const handleImportFile = useCallback(async () => {
    if (!selectedFile || !validationResult?.isValid || completeData.length === 0) return

    // Si hay errores de categoría, mostrar el modal de corrección
    if (categoryErrors.length > 0) {
      setShowErrorDialog(true)
      return
    }

    // Si no hay errores, importar directamente los productos válidos
    if (validProductsCache.length === 0) {
      toast({
        title: "Sin productos válidos",
        description: "No hay productos válidos para importar. Por favor, corrija los errores.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    setIsUploading(true)

    try {
      // Llamar al endpoint de bulk insert
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validProductsCache)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Error al importar productos')
      }

      handleClearFile()
      setCategoryErrors([])
      setValidProductsCache([])
      onClose()
      
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${result.data.insertedCount} productos correctamente.`,
        duration: 4000,
      })
    } catch (error) {
      console.error('Error en importación:', error)
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : "Hubo un error al importar el archivo.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, validationResult, completeData, categoryErrors, validProductsCache, handleClearFile, onClose, toast])

  // Manejar corrección de errores e importación
  const handleCorrectAndRetry = useCallback(async (corrections: CategoryCorrection[]) => {
    try {
      // Convertir correcciones a productos válidos
      const correctedProducts: ValidProductForBulk[] = corrections.map(correction => {
        const errorProduct = categoryErrors.find(e => e.rowNumber === correction.rowNumber)
        if (!errorProduct) {
          throw new Error(`No se encontró producto para fila ${correction.rowNumber}`)
        }

        const original = errorProduct.originalProduct
        return {
          name: String(original.name).trim(),
          description: String(original.description || '').trim(),
          category_id: correction.selectedCategoryId, // Categoría corregida
          price: Number(original.price),
          stock: Number(original.stock || 0),
          scientificName: String(original.scientificName || '').trim(),
          care: String(original.care || '').trim(),
          characteristics: String(original.characteristics || '').trim(),
          origin: String(original.origin || '').trim(),
          image: String(original.image || '/placeholder.svg').trim(),
          images: original.images 
            ? String(original.images).split(',').map(i => i.trim()) 
            : [String(original.image || '/placeholder.svg').trim()],
          featured: original.featured === true || original.featured === 'true' || original.featured === '1' || original.featured === 1 || false
        }
      })

      // Combinar productos válidos originales con productos corregidos
      const allProducts = [...validProductsCache, ...correctedProducts]

      if (allProducts.length === 0) {
        toast({
          title: "Sin productos",
          description: "No hay productos para importar.",
          variant: "destructive",
          duration: 4000,
        })
        return
      }

      // Llamar al endpoint de bulk insert
      const response = await fetch('/api/products/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allProducts)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Error al importar productos')
      }

      // Limpiar todo y cerrar
      handleClearFile()
      setCategoryErrors([])
      setValidProductsCache([])
      setShowErrorDialog(false)
      onClose()
      
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${result.data.insertedCount} productos correctamente.`,
        duration: 4000,
      })
    } catch (error) {
      console.error('Error en importación con correcciones:', error)
      toast({
        title: "Error en la importación",
        description: error instanceof Error ? error.message : "Hubo un error al importar los productos.",
        variant: "destructive",
        duration: 4000,
      })
    }
  }, [categoryErrors, validProductsCache, handleClearFile, onClose, toast])

  // Cerrar el modal sin confirmación (para uso interno)
  const handleClose = useCallback(() => {
    setSelectedFile(null)
    setValidationResult(null)
    setPreviewData([])
    setHeaders([])
    setTotalProducts(0)
    setIsDragOver(false)
    setEditingCell(null)
    setEditValue("")
    setShowConfirmClose(false)
    setShouldCloseMainModal(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }, [onClose])

  // Verificar si necesitamos mostrar confirmación antes de cerrar
  const handleCloseRequest = useCallback(() => {
    // Si hay archivo seleccionado O se está procesando, mostrar confirmación
    // Solo cerrar directamente si no hay nada subido
    if (selectedFile || isUploading) {
      setShowConfirmClose(true)
    } else {
      handleClose()
    }
  }, [selectedFile, isUploading, handleClose])

  // Confirmar el cierre del modal
  const handleConfirmClose = useCallback(() => {
    setShouldCloseMainModal(true)
    setShowConfirmClose(false)
    // El cierre del modal principal se manejará cuando el modal de confirmación se cierre completamente
  }, [])

  // Manejar el cierre completo del modal de confirmación
  const handleConfirmDialogClose = useCallback(() => {
    setShowConfirmClose(false)
    // Si debemos cerrar el modal principal, hacerlo ahora que el modal de confirmación se cerró
    if (shouldCloseMainModal) {
      setShouldCloseMainModal(false)
      handleClose()
    }
  }, [shouldCloseMainModal, handleClose])

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Manejar inicio de edición
  const handleStartEdit = useCallback((rowIndex: number, header: string, value: any) => {
    setEditingCell({ rowIndex, header })
    setEditValue(String(value))
    // Enfocar el input después de que se renderice
    setTimeout(() => {
      editInputRef.current?.focus()
    }, 0)
  }, [])

  // Manejar fin de edición
  const handleEndEdit = useCallback(() => {
    if (!editingCell) return

    const { rowIndex, header } = editingCell
    const newData = [...completeData]
    newData[rowIndex] = {
      ...newData[rowIndex],
      [header]: editValue
    }
    setCompleteData(newData)
    setPreviewData(newData.slice(0, 5)) // Actualizar preview
    setEditingCell(null)
  }, [editingCell, editValue, completeData])

  // Manejar tecla Enter en edición
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEndEdit()
    }
    // No manejamos ESC aquí porque se maneja a nivel del modal
  }, [handleEndEdit])

  // Manejar click en el ícono de edición (para móvil)
  const handleEditIconClick = useCallback((e: React.MouseEvent, rowIndex: number, header: string, value: any) => {
    e.stopPropagation()
    handleStartEdit(rowIndex, header, value)
  }, [handleStartEdit])

  // Manejar doble click en la celda (para desktop)
  const handleCellDoubleClick = useCallback((rowIndex: number, header: string, value: any) => {
    // Solo activar doble click en pantallas medianas y grandes
    if (window.innerWidth >= 640) { // sm breakpoint
      handleStartEdit(rowIndex, header, value)
    }
  }, [handleStartEdit])

  // Manejar tecla ESC a nivel de modal
  const handleEscapeKeyDown = useCallback((e: KeyboardEvent) => {
    // Si estamos editando una celda, solo cancelar la edición, no cerrar el modal
    if (editingCell) {
      e.preventDefault()
      setEditingCell(null)
    } else if (selectedFile || isUploading) {
      // Si hay archivo seleccionado O se está procesando, prevenir cierre directo y mostrar confirmación
      e.preventDefault()
      setShowConfirmClose(true)
    }
    // Si no hay nada subido, permitir que se cierre el modal normalmente
  }, [editingCell, selectedFile, isUploading])

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseRequest}>
      <DialogContent 
        className="w-full max-w-[95vw] sm:max-w-[600px] lg:max-w-[800px] xl:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col"
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        <DialogHeader>
          <DialogTitle>Importar Productos desde Excel</DialogTitle>
          <DialogDescription>
            Selecciona un archivo de Excel (.xlsx o .xls) con los datos de los productos a importar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 flex-1 overflow-auto">
          {/* Área de Drag and Drop */}
          <div className="space-y-4">
            <div
              className={cn(
                "relative border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center cursor-pointer transition-colors",
                isDragOver
                  ? "border-primary bg-primary/10"
                  : selectedFile
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : validationResult && !validationResult.isValid
                  ? "border-red-500 bg-red-50 dark:bg-red-950"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleAreaClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="space-y-3 sm:space-y-4">
                  <Loader2 className="mx-auto h-8 w-8 sm:h-10 w-10 lg:h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm font-medium">
                    Importando productos...
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="space-y-3">
                  <CheckCircle className="mx-auto h-8 w-8 sm:h-10 w-10 lg:h-12 w-12 text-green-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      Archivo seleccionado
                    </p>
                    <p className="text-xs text-muted-foreground break-all px-2">
                      {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClearFile()
                    }}
                    disabled={isUploading}
                    className="mt-2"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cambiar archivo
                  </Button>
                </div>
              ) : validationResult && !validationResult.isValid ? (
                <div className="space-y-3">
                  <AlertTriangle className="mx-auto h-8 w-8 sm:h-10 w-10 lg:h-12 w-12 text-red-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Error en el archivo
                    </p>
                    <p className="text-xs text-muted-foreground px-2">
                      {validationResult.error}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileUp className={cn(
                    "mx-auto h-8 w-8 sm:h-10 w-10 lg:h-12 w-12",
                    isDragOver ? "text-primary" : "text-muted-foreground"
                  )} />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {isDragOver ? "Suelta el archivo aquí" : "Arrastra tu archivo de Excel (.xlsx/.xls)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      o haz clic para seleccionar • máximo 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Previsualización de datos */}
          {previewData.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div className="p-3 sm:p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm sm:text-base">Previsualización de Datos</h3>
                  <span className={cn(
                    "text-xs sm:text-sm px-2 py-1 rounded",
                    totalProducts > 500 ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                    totalProducts > 400 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" :
                    "bg-muted text-muted-foreground"
                  )}>
                    Total: {totalProducts} producto{totalProducts !== 1 ? 's' : ''} 
                    {totalProducts > 500 && " ⚠️ Excede límite"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  <span className="sm:hidden">Toca el ícono del lápiz para editar.</span>
                  <span className="hidden sm:inline">Haz doble clic en cualquier celda o usa el ícono del lápiz para editar.</span>
                  <span className="block mt-1">Presiona Enter para guardar o Esc para cancelar.</span>
                </p>
              </div>
              <div className="overflow-auto max-h-[250px] sm:max-h-[300px] lg:max-h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      {headers.map((header, index) => (
                        <TableHead 
                          key={header} 
                          className={cn(
                            "min-w-[120px] sm:min-w-[150px] text-xs sm:text-sm",
                            // Ocultar columnas menos importantes en pantallas pequeñas
                            index > 2 && "hidden sm:table-cell",
                            index > 4 && "hidden lg:table-cell"
                          )}
                        >
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {headers.map((header, index) => (
                          <TableCell 
                            key={`${rowIndex}-${header}`}
                            className={cn(
                              "relative group min-w-[120px] sm:min-w-[150px] text-xs sm:text-sm",
                              // Ocultar columnas menos importantes en pantallas pequeñas
                              index > 2 && "hidden sm:table-cell",
                              index > 4 && "hidden lg:table-cell"
                            )}
                            onDoubleClick={(e) => handleCellDoubleClick(rowIndex, header, row[header])}
                          >
                            {editingCell?.rowIndex === rowIndex && editingCell?.header === header ? (
                              <Input
                                ref={editInputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleEndEdit}
                                onKeyDown={handleKeyDown}
                                className="h-6 sm:h-8 text-xs sm:text-sm"
                              />
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="truncate pr-2">{row[header]}</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleEditIconClick(e, rowIndex, header, row[header])}
                                  className={cn(
                                    "p-1.5 sm:p-1 rounded-sm transition-all flex-shrink-0",
                                    // En móvil: siempre visible con área de toque más grande
                                    "sm:opacity-0 sm:group-hover:opacity-100",
                                    // En desktop: solo en hover
                                    "opacity-100 sm:hover:bg-muted",
                                    // Mejor target para touch en móvil
                                    "touch-manipulation"
                                  )}
                                  aria-label="Editar celda"
                                >
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </button>
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Indicador de columnas ocultas en móvil */}
              {headers.length > 3 && (
                <div className="p-2 sm:hidden text-center text-xs text-muted-foreground border-t bg-muted/30">
                  + {headers.length - 3} columnas más (visible en pantalla grande)
                </div>
              )}
            </div>
          )}

          {/* Información adicional - Solo visible cuando no hay archivo cargado */}
          {!selectedFile && !previewData.length && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">Especificaciones del archivo</span>
              </div>
                <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Límites:</strong> Entre 1 y 500 productos por archivo</p>
                <p><strong>Campos OBLIGATORIOS:</strong> <code className="bg-blue-100 px-1 py-0.5 rounded">name</code>, <code className="bg-blue-100 px-1 py-0.5 rounded">price</code></p>
                <p><strong>Campos opcionales:</strong> description, category_id, stock, scientificName, care, characteristics, origin, image, images, featured</p>
                <p><strong>Formato de imágenes:</strong> URLs completas. Para múltiples, separa con comas en la columna "images"</p>
                <p><strong>Stock:</strong> Si no se proporciona, se asignará 0 por defecto</p>
                <p><strong>Featured:</strong> Acepta: true/false, 1/0, sí/no, yes</p>
                <p><strong>Lógica:</strong> Todos los productos serán creados como nuevos en el sistema</p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCloseRequest}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleImportFile}
              disabled={!selectedFile || !validationResult?.isValid || isUploading || completeData.length === 0}
              className="w-full sm:w-auto"
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Productos
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Dialog de confirmación para cerrar con datos cargados */}
      <ConfirmationDialog
        isOpen={showConfirmClose}
        onClose={handleConfirmDialogClose}
        onConfirm={handleConfirmClose}
        title="¿Cerrar importación?"
        description={
          isUploading 
            ? "Se está procesando la importación de productos. Si cierras ahora, se cancelará el proceso y se perderán los datos."
            : "Tienes un archivo cargado con datos para importar. Si cierras ahora, se perderán todos los datos sin procesar."
        }
        confirmLabel="Cerrar"
        cancelLabel="Continuar"
        variant="destructive"
      />

      {/* Dialog de corrección de errores de categoría */}
      <ProductCategoryErrorsDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        productsWithErrors={categoryErrors}
        allCategories={categories}
        onCorrectAndImport={handleCorrectAndRetry}
      />
    </Dialog>
  )
}

