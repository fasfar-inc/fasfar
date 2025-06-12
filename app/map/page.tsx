"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import axios from "axios"
import { ArrowLeft, MapPin, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { GeolocationRequest } from "@/components/geolocation-request"
import { ProductFilters, type FilterValues } from "@/components/product-filters"

// Import dynamique du composant de carte pour éviter les erreurs de rendu côté serveur
const LeafletMapComponent = dynamic(
  () => import("@/components/leaflet-map-component").then((mod) => mod.LeafletMapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-2 text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    ),
  },
)

interface Product {
  id: number
  title: string
  price: number
  location: string
  category: string
  primaryImage: string | null
  coordinates: [number, number] // [latitude, longitude]
  distance: number | null
  seller: {
    id: number
    username: string
    profileImage: string | null
  }
  createdAt: string
  latitude: number | null
  longitude: number | null
}

export default function MapPage() {
  const [showExpandedFilters, setShowExpandedFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showGeolocationRequest, setShowGeolocationRequest] = useState(true)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // État pour les filtres
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    category: "",
    condition: "",
    minPrice: "",
    maxPrice: "",
    distance: 50,
    sortBy: "date_desc",
  })

  // Ajouter cette fonction pour charger les produits
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true)

      // Construire les paramètres de requête
      const params = new URLSearchParams()

      if (filters.search) {
        params.append("search", filters.search)
      }

      if (filters.category) {
        params.append("category", filters.category)
      }

      if (filters.condition) {
        params.append("condition", filters.condition)
      }

      if (filters.minPrice) {
        params.append("minPrice", filters.minPrice)
      }

      if (filters.maxPrice) {
        params.append("maxPrice", filters.maxPrice)
      }

      if (filters.distance < 1000) {
        params.append("distance", filters.distance.toString())
      }

      if (filters.sortBy) {
        params.append("sortBy", filters.sortBy)
      }

      if (userLocation) {
        params.append("latitude", userLocation[0].toString())
        params.append("longitude", userLocation[1].toString())
      }

      const response = await axios.get(`/api/products/map?${params.toString()}`)

      // Transformer les données pour correspondre à l'interface Product
      const productsData = response.data.map((product: any) => ({
        ...product,
        coordinates: [product.latitude || 0, product.longitude || 0] as [number, number],
        image: product.primaryImage || "/placeholder.svg?height=300&width=300",
      }))

      setProducts(productsData)
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, userLocation])

  // Ajouter cet effet pour charger les produits lorsque les filtres changent
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Remplacer la fonction handleGeolocationAccept par celle-ci
  const handleGeolocationAccept = (position: [number, number]) => {
    setUserLocation(position)
    setLocationError(null)
    setShowGeolocationRequest(false)
    localStorage.setItem("geolocation-consent", "granted")

    // Recharger les produits avec la nouvelle position
    loadProducts()
  }

  // Remplacer la fonction handleGeolocationDecline par celle-ci
  const handleGeolocationDecline = () => {
    setShowGeolocationRequest(false)
    setUserLocation([35.1264, 33.4299]) // Default position
    setLocationError("You have refused geolocation. The map will display all products available in Turkey.")
    localStorage.setItem("geolocation-consent", "denied")

    // Charger les produits sans filtrage par distance
    loadProducts()
  }

  // Gérer les changements de filtres
  const handleFilterChange = useCallback((newFilters: FilterValues) => {
    setFilters((prev) => {
      // Vérifier si les filtres ont réellement changé
      if (JSON.stringify(prev) === JSON.stringify(newFilters)) {
        return prev // Retourner l'état précédent si aucun changement
      }
      return newFilters
    })
  }, [])

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      condition: "",
      minPrice: "",
      maxPrice: "",
      distance: 50,
      sortBy: "date_desc",
    })

    // Recharger les produits sans filtres
    setTimeout(() => {
      loadProducts()
    }, 100)
  }

  // Formater la date relative
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `There was ${diffDays} days ago`
    if (diffDays < 30) return `There was ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""}`
    if (diffDays < 365) return `There was ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""}`
    return `There was ${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""}`
  }

  const requestGeolocation = () => {
    setIsRequestingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleGeolocationAccept([position.coords.latitude, position.coords.longitude])
        setIsRequestingLocation(false)
      },
      (error) => {
        console.error("Error getting geolocation:", error)
        setLocationError("Unable to retrieve your position. Please try again or enable geolocation.")
        setIsRequestingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Popup de demande de géolocalisation */}
      {showGeolocationRequest && (
        <GeolocationRequest onAccept={handleGeolocationAccept} onDecline={handleGeolocationDecline} />
      )}

      <div className="container py-6 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>

        {locationError && (
          <div className="mt-2 mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{locationError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
              onClick={requestGeolocation}
              disabled={isRequestingLocation}
            >
              {isRequestingLocation ? (
                <>
                  <span className="animate-spin mr-1">⏳</span>
                  Location...
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 mr-1 pulse-location" />
                  Enable my position
                </>
              )}
            </Button>
          </div>
        )}

        {/* Composant de filtres centralisé */}
        <ProductFilters
          initialValues={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
          hasGeolocation={!!userLocation}
          onRequestGeolocation={requestGeolocation}
          isRequestingLocation={isRequestingLocation}
          showExpandedFilters={showExpandedFilters}
          onToggleExpandedFilters={() => setShowExpandedFilters(!showExpandedFilters)}
          className="mb-6"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden h-[600px]">
              <LeafletMapComponent
                userLocation={userLocation}
                products={products}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />
            </div>
          </div>

          {/* Liste des produits */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              {isLoading ? "Loading products..." : `Products nearby (${products.length})`}
            </h2>
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
              {isLoading ? (
                // Afficher des placeholders pendant le chargement
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex gap-3 p-3 rounded-lg border bg-white animate-pulse">
                    <div className="w-20 h-20 shrink-0 rounded-md bg-gray-200"></div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex justify-between">
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`flex gap-3 p-3 rounded-lg border bg-white cursor-pointer transition-all ${
                        selectedProduct === product.id ? "border-rose-500 shadow-md" : "hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedProduct(product.id)}
                    >
                      <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={product.primaryImage || "/placeholder.svg?height=300&width=300"}
                          alt={product.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>
                        <p className="text-rose-500 font-bold">{product.price.toLocaleString()}€</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{product.location}</span>
                          {product.distance !== null && (
                            <span className="ml-1">
                              (
                              {product.distance < 1
                                ? `${Math.round(product.distance * 1000)} m`
                                : `${product.distance.toFixed(1)} @&`}
                              )
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">{formatRelativeDate(product.createdAt)}</span>
                          <Link href={`/product/${product.id}`} className="text-xs text-rose-500 hover:underline">
                            See
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && !isLoading && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                      <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <h3 className="font-medium">No products found</h3>
                      <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                      <Button variant="outline" className="mt-4" onClick={resetFilters}>
                        Reset filters
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
