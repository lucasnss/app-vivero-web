"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder = "Buscar productos..." }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none bg-white shadow-sm text-green-800 placeholder-green-400"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-800 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {query && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-green-50 rounded-lg px-3 py-2 shadow-sm">
          <p className="text-sm text-green-700">
            Buscando: <span className="font-semibold">"{query}"</span>
          </p>
        </div>
      )}
    </div>
  )
}
