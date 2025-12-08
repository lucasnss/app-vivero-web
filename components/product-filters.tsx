"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { Category } from "@/data/categories"

export interface FilterState {
  search: string
  categoryId: string | null
  priceMin: number | null
  priceMax: number | null
  inStockOnly: boolean
}

interface ProductFiltersProps {
  categories: Category[]
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  maxPrice: number
  onClose?: () => void
  isMobile?: boolean
}

export const defaultFilters: FilterState = {
  search: "",
  categoryId: null,
  priceMin: null,
  priceMax: null,
  inStockOnly: false,
}

export default function ProductFilters(props: ProductFiltersProps) {
  const {
    categories = [],
    filters = defaultFilters,
    onFilterChange,
    maxPrice = 50000,
    onClose,
    isMobile = false,
  } = props
  const [localPriceMin, setLocalPriceMin] = useState<string>(
    filters?.priceMin?.toString() ?? ""
  )
  const [localPriceMax, setLocalPriceMax] = useState<string>(
    filters?.priceMax?.toString() ?? ""
  )
  const [sliderValue, setSliderValue] = useState<number>(
    filters?.priceMax ?? maxPrice
  )
  const [isExpanded, setIsExpanded] = useState(!isMobile)

  // Sincronizar slider con precio máximo
  useEffect(() => {
    if (filters?.priceMax != null) {
      setSliderValue(filters.priceMax)
      setLocalPriceMax(filters.priceMax.toString())
    } else {
      setSliderValue(maxPrice)
      setLocalPriceMax("")
    }
  }, [filters?.priceMax, maxPrice])

  useEffect(() => {
    if (filters?.priceMin != null) {
      setLocalPriceMin(filters.priceMin.toString())
    } else {
      setLocalPriceMin("")
    }
  }, [filters?.priceMin])

  const handleSearchChange = useCallback(
    (value: string) => {
      onFilterChange({ ...filters, search: value })
    },
    [filters, onFilterChange]
  )

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      onFilterChange({
        ...filters,
        categoryId: categoryId === "" ? null : categoryId,
      })
    },
    [filters, onFilterChange]
  )

  const handlePriceMinBlur = useCallback(() => {
    const value = localPriceMin === "" ? null : parseFloat(localPriceMin)
    if (value !== filters?.priceMin) {
      onFilterChange({ ...filters, priceMin: value })
    }
  }, [localPriceMin, filters, onFilterChange])

  const handlePriceMaxBlur = useCallback(() => {
    const value = localPriceMax === "" ? null : parseFloat(localPriceMax)
    if (value !== filters?.priceMax) {
      onFilterChange({ ...filters, priceMax: value })
      setSliderValue(value ?? maxPrice)
    }
  }, [localPriceMax, filters, onFilterChange, maxPrice])

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value)
      setSliderValue(value)
      setLocalPriceMax(value.toString())
    },
    []
  )

  const handleSliderMouseUp = useCallback(() => {
    onFilterChange({ ...filters, priceMax: sliderValue })
  }, [filters, onFilterChange, sliderValue])

  const handleStockChange = useCallback(
    (checked: boolean) => {
      onFilterChange({ ...filters, inStockOnly: checked })
    },
    [filters, onFilterChange]
  )

  const handleClearFilters = useCallback(() => {
    onFilterChange(defaultFilters)
    setLocalPriceMin("")
    setLocalPriceMax("")
    setSliderValue(maxPrice)
  }, [onFilterChange, maxPrice])

  const hasActiveFilters =
    filters?.search !== "" ||
    filters?.categoryId !== null ||
    filters?.priceMin !== null ||
    filters?.priceMax !== null ||
    filters?.inStockOnly

  const filterContent = (
    <div className="space-y-6">
      {/* BUSCAR */}
      <div>
        <label
          htmlFor="filter-search"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Buscar por nombre
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            id="filter-search"
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Ej: Rosal"
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* CATEGORÍA */}
      <div>
        <label
          htmlFor="filter-category"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Categoría
        </label>
        <select
          id="filter-category"
          value={filters.categoryId || ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full py-2.5 px-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* RANGO DE PRECIOS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rango de precios
        </label>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              type="number"
              value={localPriceMin}
              onChange={(e) => setLocalPriceMin(e.target.value)}
              onBlur={handlePriceMinBlur}
              onKeyDown={(e) => e.key === "Enter" && handlePriceMinBlur()}
              placeholder="Min"
              min="0"
              className="w-full py-2 pl-7 pr-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
          <span className="text-gray-400 font-medium">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              type="number"
              value={localPriceMax}
              onChange={(e) => setLocalPriceMax(e.target.value)}
              onBlur={handlePriceMaxBlur}
              onKeyDown={(e) => e.key === "Enter" && handlePriceMaxBlur()}
              placeholder="Max"
              min="0"
              className="w-full py-2 pl-7 pr-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Slider */}
        <div className="mt-4">
          <input
            type="range"
            min="0"
            max={maxPrice}
            step={100}
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderMouseUp}
            onTouchEnd={handleSliderMouseUp}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium text-green-600">
              ${sliderValue.toLocaleString("es-AR")}
            </span>
            <span>${maxPrice.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* STOCK */}
      <div className="flex items-center">
        <input
          id="filter-in-stock"
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => handleStockChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-green-500 bg-white dark:bg-gray-800 cursor-pointer"
        />
        <label
          htmlFor="filter-in-stock"
          className="ml-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none"
        >
          Mostrar solo productos en stock
        </label>
      </div>

      {/* BOTONES */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col space-y-2">
        {hasActiveFilters && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-2">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Filtros activos aplicados
            </p>
          </div>
        )}

        <button
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
            ${
              hasActiveFilters
                ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-300 dark:border-gray-600"
                : "text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700"
            }`}
        >
          <X className="h-4 w-4" />
          <span>Limpiar Filtros</span>
        </button>

        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Ver Resultados</span>
          </button>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filtros
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
        {filterContent}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header colapsable en tablet */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-green-600 to-green-700 text-white lg:cursor-default"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <span className="font-semibold">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
              Activos
            </span>
          )}
        </div>
        <div className="lg:hidden">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Contenido del filtro */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 lg:max-h-[1000px] lg:opacity-100"
        } overflow-hidden`}
      >
        <div className="p-5">{filterContent}</div>
      </div>
    </div>
  )
}
