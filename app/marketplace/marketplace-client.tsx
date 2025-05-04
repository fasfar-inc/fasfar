"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X, Filter, MapPin, ChevronLeft, ChevronRight, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ProductCategory, ProductCondition } from "@prisma/client"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useDebounce } from "@/hooks/use-debounce"

// Définir les catégories avec leurs icônes et noms
const categories = [
  { id: "REAL_ESTATE", name: "Immobilier" },
  { id: "VEHICLES", name: "Véhicules" },
  { id: "PHONES", name: "Téléphones" },
  { id: "ELECTRONICS", name: "Électronique" },
  { id: "HOME_KITCHEN", name: "Maison" },
  { id: "FASHION", name: "Mode" },
  { id: "SPORTS", name: "Sports" },
  { id: "GARDEN", name: "Jardin" },
  { id: "BOOKS", name: "Livres" },
  { id: "TOYS", name: "Jouets" },
  { id: "OTHER", name: "Autre" },
]

// Définir les conditions des produits
const conditions = [
  { id: "NEW", name: "Neuf" },
  { id: "LIKE_NEW", name: "Comme neuf" },
  { id: "GOOD", name: "Bon état" },
  { id: "FAIR", name: "État correct" },
  { id: "POOR", name: "Mauvais état" },
]

interface MarketplaceClientProps {
  products: any[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
  filters: {
    category?: ProductCategory
    minPrice?: number
    maxPrice?: number
    condition?: ProductCondition
    location?: string
    distance?: number
    latitude?: number
    longitude?: number
    search?: string
    sortBy?: string
  }
}

export default function MarketplaceClient({ products, pagination, filters }: MarketplaceClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { latitude, longitude, loading, error, getPosition } = useGeolocation()

  // États pour les filtres
  const [searchQuery, setSearchQuery] = useState(filters.search || "")
  const [minPrice, setMinPrice] = useState<string>(filters.minPrice?.toString() || "")
  const [maxPrice, setMaxPrice] = useState<string>(filters.maxPrice?.toString() || "")
  const [distance, setDistance] = useState<number>(filters.distance || 50)
  const [selectedCategory, setSelectedCategory] = useState<string>(filters.category || "")
  const [selectedCondition, setSelectedCondition] = useState<string>(filters.condition || "")
  const [sortBy, setSortBy] = useState(filters.sortBy || "date_desc")
  const [currentPage, setCurrentPage] = useState(pagination.page)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 500)
  const debouncedMinPrice = useDebounce(minPrice, 800)
  const debouncedMaxPrice = useDebounce(maxPrice, 800)

  // Mettre à jour l'URL avec les filtres
  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    // Gérer la recherche
    if (debouncedSearch) {
      params.set("search", debouncedSearch)
    } else {
      params.delete("search")
    }

    // Gérer la catégorie
    if (selectedCategory) {
      params.set("category", selectedCategory)
    } else {
      params.delete("category")
    }

    // Gérer la condition
    if (selectedCondition) {
      params.set("condition", selectedCondition)
    } else {
      params.delete("condition")
    }

    // Gérer le prix minimum
    if (debouncedMinPrice) {
      params.set("minPrice", debouncedMinPrice)
    } else {
      params.delete("minPrice")
    }

    // Gérer le prix maximum
    if (debouncedMaxPrice) {
      params.set("maxPrice", debouncedMaxPrice)
    } else {
      params.delete("maxPrice")
    }

    // Gérer la distance
    if (distance !== 50) {
      params.set("distance", distance.toString())
    } else {
      params.delete("distance")
    }

    // Gérer le tri
    if (sortBy && sortBy !== "date_desc") {
      params.set("sortBy", sortBy)
    } else {
      params.delete("sortBy")
    }

    // Gérer la pagination
    if (currentPage > 1) {
      params.set("page", currentPage.toString())
    } else {
      params.delete("page")
    }

    // Gérer la géolocalisation
    if (latitude && longitude) {
      params.set("latitude", latitude.toString())
      params.set("longitude", longitude.toString())
    }

    // Mettre à jour l'URL sans recharger la page
    const newUrl = `${window.location.pathname}?${params.toString()}`
    router.push(newUrl, { scroll: false })
  }

  // Effet pour mettre à jour l'URL quand les filtres changent
  useEffect(() => {
    updateFilters()
  }, [
    debouncedSearch,
    debouncedMinPrice,
    debouncedMaxPrice,
    selectedCategory,
    selectedCondition,
    distance,
    sortBy,
    currentPage,
    latitude,
    longitude,
  ])

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery("")
    setMinPrice("")
    setMaxPrice("")
    setDistance(50)
    setSelectedCategory("")
    setSelectedCondition("")
    setSortBy("date_desc")
    setCurrentPage(1)
    router.push("/marketplace")
  }

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Activer la géolocalisation
  const handleGetLocation = () => {
    getPosition()
  }

  // Calculer le nombre de filtres actifs
  const activeFiltersCount = [
    selectedCategory,
    selectedCondition,
    minPrice,
    maxPrice,
    distance !== 50 ? distance : null,
    searchQuery,
  ].filter(Boolean).length

  // Générer les éléments de pagination
  const paginationItems = []
  if (pagination.pages <= 7) {
    // Afficher toutes les pages si leur nombre est inférieur à 7
    for (let i = 1; i <= pagination.pages; i++) {
      paginationItems.push(i)
    }
  } else {
    // Logique pour afficher les pages avec des ellipses
    paginationItems.push(1)

    if (currentPage > 3) {
      paginationItems.push("...")
    }

    // Pages autour de la page courante
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(pagination.pages - 1, currentPage + 1)

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(i)
    }

    if (currentPage < pagination.pages - 2) {
      paginationItems.push("...")
    }

    paginationItems.push(pagination.pages)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        {/* En-tête avec titre et barre de recherche */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Marketplace</h1>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                className="pl-10 pr-4 w-full md:w-[300px]"
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
                      <h3 className="font-medium mb-3">Catégories</h3>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les catégories</SelectItem>
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
                      <h3 className="font-medium mb-3">État</h3>
                      <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les états" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les états</SelectItem>
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
                      <h3 className="font-medium mb-3">Prix (€)</h3>
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
                        <span className="text-sm">{distance} km</span>
                      </div>

                      {latitude && longitude ? (
                        <>
                          <Slider
                            defaultValue={[distance]}
                            min={1}
                            max={300}
                            step={5}
                            value={[distance]}
                            onValueChange={(value) => setDistance(value[0])}
                            className="mb-2"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>1 km</span>
                            <span>300 km</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            Localisation activée
                          </div>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" onClick={handleGetLocation} className="w-full">
                          <MapPin className="h-4 w-4 mr-2" />
                          Activer la géolocalisation
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

              <Select value={sortBy} onValueChange={setSortBy} className="hidden md:flex">
                <SelectTrigger className="w-[180px]">
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

              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <Filter className="h-4 w-4" />
                Filtres
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 bg-rose-100 text-rose-600">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
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
                Prix: {minPrice || "0"}€ - {maxPrice || "∞"}€
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

            {distance !== 50 && latitude && longitude && (
              <Badge variant="secondary" className="bg-rose-50 text-rose-600 border-rose-200">
                <MapPin className="h-3 w-3 mr-1" />
                {distance} km
                <button className="ml-1" onClick={() => setDistance(50)}>
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
              Tout effacer
            </Button>
          </div>
        )}

        {/* Panneau de filtres desktop */}
        {showMobileFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Catégorie */}
                <div>
                  <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                    Catégorie
                  </Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
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
                    État
                  </Label>
                  <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Tous les états" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les états</SelectItem>
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
                  <Label className="text-sm font-medium mb-2 block">Prix (€)</Label>
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
                    <span className="text-sm">{distance} km</span>
                  </div>

                  {latitude && longitude ? (
                    <>
                      <Slider
                        defaultValue={[distance]}
                        min={1}
                        max={300}
                        step={5}
                        value={[distance]}
                        onValueChange={(value) => setDistance(value[0])}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1 km</span>
                        <span>300 km</span>
                      </div>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleGetLocation} className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Activer la géolocalisation
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenu principal */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Résultats */}
          <div className="flex-1">
            {/* Nombre de résultats et tri mobile */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {pagination.total} produit{pagination.total > 1 ? "s" : ""} trouvé{pagination.total > 1 ? "s" : ""}
              </h2>

              <Select value={sortBy} onValueChange={setSortBy} className="md:hidden">
                <SelectTrigger className="w-[140px]">
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

            {/* Liste des produits */}
            {products.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <Filter className="h-10 w-10 text-gray-400" />
                  <h3 className="mt-4 text-lg font-semibold">Aucun résultat</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Aucun produit ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="aspect-square overflow-hidden">
                        <Image
                          src={product.primaryImage || "/placeholder.svg?height=300&width=300&query=product"}
                          alt={product.title}
                          width={300}
                          height={300}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium line-clamp-1">{product.title}</h3>
                        <p className="mt-1 text-lg font-bold text-rose-500">{product.price.toLocaleString()}€</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPin className="mr-1 h-3.5 w-3.5" />
                          <span className="line-clamp-1">{product.location || "Emplacement non spécifié"}</span>
                          {product.distance !== undefined && (
                            <span className="ml-auto">{Math.round(product.distance)} km</span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {product.createdAt
                              ? new Date(product.createdAt).toLocaleDateString("fr-FR")
                              : "Date inconnue"}
                          </span>
                          {product.seller?.rating && (
                            <div className="flex items-center">
                              <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium">{product.seller.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {paginationItems.map((item, index) =>
                        typeof item === "string" ? (
                          <span key={`ellipsis-${index}`} className="px-2">
                            ...
                          </span>
                        ) : (
                          <Button
                            key={`page-${item}`}
                            variant={currentPage === item ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(item)}
                            className={`w-9 h-9 p-0 ${currentPage === item ? "bg-rose-500 hover:bg-rose-600" : ""}`}
                          >
                            {item}
                          </Button>
                        ),
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Composant de débogage */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-0 left-0 bg-black/80 text-white p-2 text-xs z-50">
          <p>Latitude: {latitude}</p>
          <p>Longitude: {longitude}</p>
          <p>Erreur: {error}</p>
          <p>Chargement: {loading ? "Oui" : "Non"}</p>
          <button onClick={handleGetLocation} className="bg-blue-500 text-white px-2 py-1 rounded mt-1">
            Rafraîchir position
          </button>
        </div>
      )}
    </div>
  )
}
