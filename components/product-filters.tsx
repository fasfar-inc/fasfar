"use client"

import { useState, useEffect } from "react"
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

// Définir les catégories avec leurs icônes et noms
export const categories = [
  { id: "REAL_ESTATE", name: "Real estate", icon: "real-estate" },
  { id: "VEHICLES", name: "Vehicles", icon: "vehicles" },
  { id: "PHONES", name: "Phones", icon: "phones" },
  { id: "ELECTRONICS", name: "Electronics", icon: "digital-devices" },
  { id: "HOME_KITCHEN", name: "Home & Kitchen", icon: "home-kitchen" },
  { id: "FASHION", name: "Fashion", icon: "fashion" },
  { id: "SPORTS", name: "Sports", icon: "sports" },
  { id: "GARDEN", name: "Garden", icon: "garden" },
  { id: "BOOKS", name: "Books", icon: "books" },
  { id: "TOYS", name: "Toys", icon: "toys" },
  { id: "OTHER", name: "Other", icon: "other" },
]

// Définir les conditions des produits
export const conditions = [
  { id: "NEW", name: "New" },
  { id: "LIKE_NEW", name: "Like new" },
  { id: "GOOD", name: "Good" },
  { id: "FAIR", name: "Fair" },
  { id: "POOR", name: "Poor" },
]

export interface FilterValues {
  search: string
  category: string
  condition: string
  minPrice: string
  maxPrice: string
  distance: number
  sortBy: string
}

interface ProductFiltersProps {
  initialValues: FilterValues
  onFilterChange: (filters: FilterValues) => void
  onResetFilters: () => void
  hasGeolocation: boolean
  onRequestGeolocation: () => void
  isRequestingLocation?: boolean
  showExpandedFilters?: boolean
  onToggleExpandedFilters?: () => void
  className?: string
}

export function ProductFilters({
  initialValues,
  onFilterChange,
  onResetFilters,
  hasGeolocation,
  onRequestGeolocation,
  isRequestingLocation = false,
  showExpandedFilters = false,
  onToggleExpandedFilters,
  className = "",
}: ProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(initialValues.search)
  const [selectedCategory, setSelectedCategory] = useState(initialValues.category)
  const [selectedCondition, setSelectedCondition] = useState(initialValues.condition)
  const [minPrice, setMinPrice] = useState(initialValues.minPrice)
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice)
  const [distance, setDistance] = useState(initialValues.distance || 1000)
  const [sortBy, setSortBy] = useState(initialValues.sortBy)

  // Calculer le nombre de filtres actifs
  const activeFiltersCount = [
    selectedCategory,
    selectedCondition,
    minPrice,
    maxPrice,
    distance !== 1000 ? distance : null,
    searchQuery,
  ].filter(Boolean).length

  // Mettre à jour les filtres lorsque les valeurs changent
  useEffect(() => {
    const newFilters = {
      search: searchQuery,
      category: selectedCategory,
      condition: selectedCondition,
      minPrice,
      maxPrice,
      distance,
      sortBy,
    }

    // Vérifier si les filtres ont réellement changé avant d'appeler onFilterChange
    const hasChanged = JSON.stringify(newFilters) !== JSON.stringify(initialValues)
    if (hasChanged) {
      onFilterChange(newFilters)
    }
  }, [searchQuery, selectedCategory, selectedCondition, minPrice, maxPrice, distance, sortBy])

  // Synchroniser les états locaux avec initialValues lorsque celles-ci changent
  useEffect(() => {
    setSearchQuery(initialValues.search)
    setSelectedCategory(initialValues.category)
    setSelectedCondition(initialValues.condition)
    setMinPrice(initialValues.minPrice)
    setMaxPrice(initialValues.maxPrice)
    setDistance(initialValues.distance || 1000)
    setSortBy(initialValues.sortBy)
  }, [initialValues])

  // Appliquer le filtre de distance par défaut au montage du composant
  useEffect(() => {
    if (hasGeolocation) {
      onFilterChange({
        ...initialValues,
        distance: 1000
      })
    }
  }, [hasGeolocation]) // Only run when geolocation status changes

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedCategory("")
    setSelectedCondition("")
    setMinPrice("")
    setMaxPrice("")
    setDistance(1000)
    setSortBy("date_desc")
    onResetFilters()
  }

  return (
    <div className={className}>
      {/* Barre de recherche et boutons de filtre */}
      <div className="flex flex-col md:flex-row gap-3 w-full">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Rechercher des produits..."
            className="pl-10 pr-4 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden relative">
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtres</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-6">
                {/* Catégories */}
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* État */}
                <div>
                  <h3 className="font-medium mb-3">Condition</h3>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="All conditions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All conditions</SelectItem>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prix */}
                <div>
                  <h3 className="font-medium mb-3">Price (€)</h3>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full"
                    />
                    <span>-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Distance</h3>
                    <span className="text-sm">{`${distance} km`}</span>
                  </div>

                  {hasGeolocation ? (
                    <>
                      <Slider
                        defaultValue={[distance]}
                        min={1}
                        max={1000}
                        step={5}
                        value={[distance]}
                        onValueChange={(value) => setDistance(value[0])}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1 km</span>
                        <span>1000 km</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location enabled
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRequestGeolocation}
                      className="w-full"
                      disabled={isRequestingLocation}
                    >
                      {isRequestingLocation ? (
                        <>
                          <span className="animate-spin mr-1">⏳</span>
                          Location...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4 mr-2" />
                          Enable location
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Tri */}
                <div>
                  <h3 className="font-medium mb-3">Trier par</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Plus récents</SelectItem>
                      <SelectItem value="date_asc">Plus anciens</SelectItem>
                      <SelectItem value="price_asc">Prix croissant</SelectItem>
                      <SelectItem value="price_desc">Prix décroissant</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] hidden md:flex">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Plus récents</SelectItem>
              <SelectItem value="date_asc">Plus anciens</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="hidden md:flex items-center gap-2" onClick={onToggleExpandedFilters}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-rose-100 text-rose-600">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedCategory && (
            <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200">
              {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
              <button className="ml-1" onClick={() => setSelectedCategory("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedCondition && (
            <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200">
              {conditions.find((c) => c.id === selectedCondition)?.name || selectedCondition}
              <button className="ml-1" onClick={() => setSelectedCondition("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(minPrice || maxPrice) && (
            <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200">
              Price: {minPrice || "0"}€ - {maxPrice || "∞"}€
              <button
                className="ml-1"
                onClick={() => {
                  setMinPrice("")
                  setMaxPrice("")
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {distance !== 1000 && hasGeolocation && (
            <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200">
              <MapPin className="h-3 w-3 mr-1" />
              {distance} km
              <button className="ml-1" onClick={() => setDistance(1000)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {searchQuery && (
            <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200">
              <Search className="h-3 w-3 mr-1" />"{searchQuery}"
              <button className="ml-1" onClick={() => setSearchQuery("")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
            Clear all
          </Button>
        </div>
      )}

      {/* Panneau de filtres desktop */}
      {showExpandedFilters && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Catégorie */}
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* État */}
              <div>
                <Label htmlFor="condition" className="text-sm font-medium mb-2 block">
                  Condition
                </Label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="All conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All conditions</SelectItem>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.id} value={condition.id}>
                        {condition.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prix */}
              <div className="col-span-1 md:col-span-2">
                <Label className="text-sm font-medium mb-2 block">Price (€)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full"
                  />
                  <span>-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Distance */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Distance</Label>
                  <span className="text-sm font-medium text-rose-500">
                    {`${distance} km`}
                  </span>
                </div>

                {hasGeolocation ? (
                  <>
                    <Slider
                      defaultValue={[distance]}
                      min={1}
                      max={1000}
                      step={5}
                      value={[distance]}
                      onValueChange={(value) => setDistance(value[0])}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 km</span>
                      <span>1000 km</span>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRequestGeolocation}
                    className="w-full"
                    disabled={isRequestingLocation}
                  >
                    {isRequestingLocation ? (
                      <>
                        <span className="animate-spin mr-1">⏳</span>
                        Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        Enable location
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
