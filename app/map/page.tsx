"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Home,
  Car,
  Smartphone,
  Laptop,
  Utensils,
  Shirt,
  Dumbbell,
  Flower,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { GeolocationRequest } from "@/components/geolocation-request"

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

// Composant pour afficher l'icône dynamiquement
const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "real-estate":
      return <Home className="h-5 w-5" />
    case "vehicles":
      return <Car className="h-5 w-5" />
    case "phones":
      return <Smartphone className="h-5 w-5" />
    case "digital-devices":
      return <Laptop className="h-5 w-5" />
    case "home-kitchen":
      return <Utensils className="h-5 w-5" />
    case "fashion":
      return <Shirt className="h-5 w-5" />
    case "sports":
      return <Dumbbell className="h-5 w-5" />
    case "garden":
      return <Flower className="h-5 w-5" />
    default:
      return <Home className="h-5 w-5" />
  }
}

const categories = [
  { id: "real-estate", name: "Immobilier", icon: "real-estate" },
  { id: "vehicles", name: "Véhicules", icon: "vehicles" },
  { id: "phones", name: "Téléphones", icon: "phones" },
  { id: "digital-devices", name: "Appareils numériques", icon: "digital-devices" },
  { id: "home-kitchen", name: "Maison et Cuisine", icon: "home-kitchen" },
  { id: "fashion", name: "Mode", icon: "fashion" },
  { id: "sports", name: "Sports & Loisirs", icon: "sports" },
  { id: "garden", name: "Jardin", icon: "garden" },
]

// Données fictives de produits avec coordonnées géographiques
const products = [
  {
    id: 1,
    title: "iPhone 16 Pro - 256GB",
    price: 999,
    location: "Paris, 75001",
    distance: 2.4,
    category: "phones",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Marie D.", rating: 4.8 },
    date: "Il y a 2 jours",
    coordinates: [48.8566, 2.3522], // Paris
  },
  {
    id: 2,
    title: "Appartement 2 pièces - 45m²",
    price: 295000,
    location: "Lyon, 69002",
    distance: 1.8,
    category: "real-estate",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Thomas L.", rating: 4.9 },
    date: "Il y a 5 jours",
    coordinates: [45.7578, 4.832], // Lyon
  },
  {
    id: 3,
    title: "Renault Clio 2022 - 15000km",
    price: 14500,
    location: "Marseille, 13008",
    distance: 3.5,
    category: "vehicles",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Sophie M.", rating: 4.7 },
    date: "Aujourd'hui",
    coordinates: [43.2965, 5.3698], // Marseille
  },
  {
    id: 4,
    title: "MacBook Air M3 - 512GB",
    price: 1299,
    location: "Bordeaux, 33000",
    distance: 0.9,
    category: "digital-devices",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Pierre D.", rating: 4.6 },
    date: "Il y a 1 jour",
    coordinates: [44.8378, -0.5792], // Bordeaux
  },
  {
    id: 5,
    title: "Robot Cuisine Multifonction",
    price: 349,
    location: "Toulouse, 31000",
    distance: 4.2,
    category: "home-kitchen",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Julie R.", rating: 4.9 },
    date: "Il y a 3 jours",
    coordinates: [43.6047, 1.4442], // Toulouse
  },
  {
    id: 6,
    title: "Samsung Galaxy S24 Ultra",
    price: 1199,
    location: "Lille, 59000",
    distance: 1.5,
    category: "phones",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Nicolas B.", rating: 4.7 },
    date: "Il y a 4 jours",
    coordinates: [50.6292, 3.0573], // Lille
  },
  {
    id: 7,
    title: "Maillot de bain homme",
    price: 29,
    location: "Nice, 06000",
    distance: 2.1,
    category: "fashion",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Léa S.", rating: 4.5 },
    date: "Il y a 2 jours",
    coordinates: [43.7102, 7.262], // Nice
  },
  {
    id: 8,
    title: "Raquette de tennis Wilson",
    price: 89,
    location: "Strasbourg, 67000",
    distance: 3.7,
    category: "sports",
    image: "/placeholder.svg?height=300&width=300",
    seller: { name: "Marc T.", rating: 4.8 },
    date: "Il y a 1 semaine",
    coordinates: [48.5734, 7.7521], // Strasbourg
  },
]

export default function MapPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [distance, setDistance] = useState(1000) // Distance en km (augmentée à 1000km)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showGeolocationRequest, setShowGeolocationRequest] = useState(true)
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState(products)

  // Fonction pour demander la géolocalisation
  const requestGeolocation = useCallback(() => {
    setIsRequestingLocation(true)

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation([position.coords.latitude, position.coords.longitude])
            setLocationError(null)
            setIsRequestingLocation(false)

            // Sauvegarder le consentement à la géolocalisation
            localStorage.setItem("geolocation-consent", "granted")
          },
          (err) => {
            setIsRequestingLocation(false)

            // Messages d'erreur plus spécifiques
            let errorMessage = "La localisation précise n'est pas disponible."

            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage =
                  "Vous avez refusé l'accès à votre position. Veuillez l'activer dans les paramètres de votre navigateur."
                break
              case err.POSITION_UNAVAILABLE:
                errorMessage = "Les informations de localisation ne sont pas disponibles."
                break
              case err.TIMEOUT:
                errorMessage = "La demande de localisation a expiré."
                break
            }

            setLocationError(errorMessage)
            // Position par défaut (centre de la France)
            setUserLocation([46.603354, 1.888334])

            // Sauvegarder le refus de géolocalisation
            localStorage.setItem("geolocation-consent", "denied")
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        )
      } catch (error) {
        setIsRequestingLocation(false)
        setLocationError("Une erreur s'est produite lors de la géolocalisation.")
        setUserLocation([46.603354, 1.888334]) // Position par défaut
      }
    } else {
      setIsRequestingLocation(false)
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.")
      setUserLocation([46.603354, 1.888334]) // Position par défaut
    }
  }, [])

  // Vérifier le consentement à la géolocalisation au chargement
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement pour la géolocalisation
    const geolocationConsent = localStorage.getItem("geolocation-consent")

    if (geolocationConsent === "granted") {
      // Si l'utilisateur a déjà accepté, demander directement la géolocalisation
      requestGeolocation()
      setShowGeolocationRequest(false)
    } else if (geolocationConsent === "denied") {
      // Si l'utilisateur a déjà refusé, ne pas afficher la popup
      setShowGeolocationRequest(false)
      setUserLocation([46.603354, 1.888334]) // Position par défaut
      setLocationError("Vous avez précédemment refusé la géolocalisation.")
    }
    // Sinon, la popup de demande de géolocalisation sera affichée (showGeolocationRequest est true par défaut)
  }, [requestGeolocation])

  // Calculer le nombre de filtres actifs
  useEffect(() => {
    let count = 0
    if (selectedCategories.length > 0) count++
    if (distance < 1000) count++
    if (searchQuery) count++

    setActiveFilters(count)
  }, [selectedCategories, distance, searchQuery])

  // Filtrer les produits lorsque les filtres changent
  useEffect(() => {
    const filtered = products.filter((product) => {
      // Filtre par recherche
      if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Filtre par catégorie
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false
      }
      // Filtre par distance (à implémenter avec de vraies coordonnées)
      // Pour l'instant, on utilise simplement la propriété distance du produit
      if (distance < 1000 && product.distance > distance / 100) {
        return false
      }
      return true
    })

    setFilteredProducts(filtered)
  }, [selectedCategories, distance, searchQuery])

  const handleGeolocationAccept = (position: [number, number]) => {
    setUserLocation(position)
    setLocationError(null)
    setShowGeolocationRequest(false)
    localStorage.setItem("geolocation-consent", "granted")
  }

  const handleGeolocationDecline = () => {
    setShowGeolocationRequest(false)
    setUserLocation([46.603354, 1.888334]) // Position par défaut
    setLocationError("Vous avez refusé la géolocalisation. La carte affiche tous les produits disponibles en France.")
    localStorage.setItem("geolocation-consent", "denied")
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setDistance(1000)
    setSearchQuery("")
  }

  // Fonction pour gérer la recherche avec debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

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
            Retour à l'accueil
          </Link>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher des produits..."
                className="pl-10 pr-4"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilters > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                      {activeFilters}
                    </span>
                  )}
                  <span className="sr-only">Filtres</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                  <SheetDescription>Affinez votre recherche avec les filtres</SheetDescription>
                </SheetHeader>
                <div className="py-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-sm font-medium">Catégories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                              selectedCategories.includes(category.id)
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : "hover:bg-gray-100 border border-gray-100 hover:border-gray-200"
                            }`}
                            onClick={() => toggleCategory(category.id)}
                          >
                            <span className="text-lg">
                              <CategoryIcon category={category.icon} />
                            </span>
                            <span className="text-sm">{category.name}</span>
                            {selectedCategories.includes(category.id) && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="ml-auto"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Distance (km)</h3>
                        <span className="text-sm font-medium text-rose-500">
                          {distance === 1000 ? "Toute la France" : `${distance} km`}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[1000]}
                        max={1000}
                        step={10}
                        value={[distance]}
                        onValueChange={(value) => setDistance(value[0])}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">Proche</span>
                        <span className="text-xs text-gray-500">Toute la France</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full mt-4" onClick={resetFilters}>
                      Réinitialiser les filtres
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="relative md:hidden mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Rechercher des produits..."
            className="pl-10 pr-4"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold">Carte des produits</h1>
          <p className="text-gray-500">Découvrez les produits disponibles près de chez vous</p>
          {locationError && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm flex items-center justify-between">
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
                    Localisation...
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3 mr-1 pulse-location" />
                    Activer ma position
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Affichage des filtres actifs */}
        {activeFilters > 0 && (
          <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
            <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">
              {activeFilters} filtre{activeFilters > 1 ? "s" : ""} actif{activeFilters > 1 ? "s" : ""}
            </Badge>

            {selectedCategories.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId)
              return (
                <Badge
                  key={categoryId}
                  variant="secondary"
                  className="shrink-0 bg-rose-50 text-rose-600 border-rose-200"
                  data-category={categoryId}
                >
                  <span className="mr-1">
                    <CategoryIcon category={category?.icon || ""} />
                  </span>
                  {category?.name}
                  <button
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => toggleCategory(categoryId)}
                  >
                    <span className="sr-only">Supprimer</span>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )
            })}

            {distance < 1000 && (
              <Badge variant="secondary" className="shrink-0 bg-rose-50 text-rose-600 border-rose-200">
                <MapPin className="h-3 w-3 mr-1" />
                {distance} km
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setDistance(1000)}
                >
                  <span className="sr-only">Réinitialiser la distance</span>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {searchQuery && (
              <Badge variant="secondary" className="shrink-0 bg-rose-50 text-rose-600 border-rose-200">
                <Search className="h-3 w-3 mr-1" />"{searchQuery}"
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => setSearchQuery("")}
                >
                  <span className="sr-only">Effacer la recherche</span>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Carte */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden h-[600px]">
              <LeafletMapComponent
                userLocation={userLocation}
                products={filteredProducts}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
              />
            </div>
          </div>

          {/* Liste des produits */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Produits à proximité ({filteredProducts.length})</h2>
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`flex gap-3 p-3 rounded-lg border bg-white cursor-pointer transition-all ${
                    selectedProduct === product.id ? "border-rose-500 shadow-md" : "hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg"}
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
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{product.date}</span>
                      <Link href={`/product/${product.id}`} className="text-xs text-rose-500 hover:underline">
                        Voir
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                  <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <h3 className="font-medium">Aucun produit trouvé</h3>
                  <p className="text-sm text-gray-500 mt-1">Essayez d'ajuster vos filtres</p>
                  <Button variant="outline" className="mt-4" onClick={resetFilters}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
