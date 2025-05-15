"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Star, Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

import { ProductFilters, type FilterValues } from "@/components/product-filters"
import { useGeolocation } from "@/hooks/use-geolocation"

interface MarketplaceClientProps {
  products: any[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
  filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
    condition?: string
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
  const { data: session } = useSession()
  const { toast } = useToast()
  const [showExpandedFilters, setShowExpandedFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(pagination.page)
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({})
  const [favoriteLoading, setFavoriteLoading] = useState<Record<string, boolean>>({})

  // Initialiser les filtres avec les valeurs actuelles
  const initialFilters: FilterValues = {
    search: filters.search || "",
    category: filters.category || "",
    condition: filters.condition || "",
    minPrice: filters.minPrice?.toString() || "",
    maxPrice: filters.maxPrice?.toString() || "",
    distance: filters.distance || 1000,
    sortBy: filters.sortBy || "date_desc",
  }

  // Mettre à jour l'URL avec les filtres
  const updateFilters = (newFilters: FilterValues) => {
    const params = new URLSearchParams(searchParams.toString())

    // Gérer la recherche
    if (newFilters.search) {
      params.set("search", newFilters.search)
    } else {
      params.delete("search")
    }

    // Gérer la catégorie
    if (newFilters.category) {
      params.set("category", newFilters.category)
    } else {
      params.delete("category")
    }

    // Gérer la condition
    if (newFilters.condition) {
      params.set("condition", newFilters.condition)
    } else {
      params.delete("condition")
    }

    // Gérer le prix minimum
    if (newFilters.minPrice) {
      params.set("minPrice", newFilters.minPrice)
    } else {
      params.delete("minPrice")
    }

    // Gérer le prix maximum
    if (newFilters.maxPrice) {
      params.set("maxPrice", newFilters.maxPrice)
    } else {
      params.delete("maxPrice")
    }

    // Gérer la distance
    if (newFilters.distance && newFilters.distance !== 1000) {
      params.set("distance", newFilters.distance.toString())
    } else {
      params.delete("distance")
    }

    // Gérer le tri
    if (newFilters.sortBy && newFilters.sortBy !== "date_desc") {
      params.set("sortBy", newFilters.sortBy)
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

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    router.push("/marketplace")
  }

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

  // Check favorite status for all products on mount
  useEffect(() => {
    const checkFavoriteStatuses = async () => {
      if (!session) return
      const newFavoriteStates: Record<string, boolean> = {}
      const newFavoriteLoading: Record<string, boolean> = {}
      
      for (const product of products) {
        try {
          const response = await fetch(`/api/products/${product.id}/favorite`)
          if (response.ok) {
            const data = await response.json()
            newFavoriteStates[product.id] = data.isFavorited
          }
        } catch {}
        newFavoriteLoading[product.id] = false
      }
      
      setFavoriteStates(newFavoriteStates)
      setFavoriteLoading(newFavoriteLoading)
    }
    checkFavoriteStatuses()
  }, [products, session])

  const toggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      router.push(`/login?callbackUrl=/marketplace`)
      return
    }

    setFavoriteLoading(prev => ({ ...prev, [productId]: true }))
    try {
      const isCurrentlyFavorite = favoriteStates[productId]
      const response = await fetch(`/api/products/${productId}/favorite`, {
        method: isCurrentlyFavorite ? "DELETE" : "POST"
      })
      
      if (!response.ok) throw new Error()
      
      setFavoriteStates(prev => ({
        ...prev,
        [productId]: !isCurrentlyFavorite
      }))
      
      toast({
        title: !isCurrentlyFavorite ? "Added to favorites" : "Removed from favorites",
        description: !isCurrentlyFavorite
          ? "This product has been added to your favorites."
          : "This product has been removed from your favorites.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating favorites.",
        variant: "destructive",
      })
    } finally {
      setFavoriteLoading(prev => ({ ...prev, [productId]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container py-6">
        <Link href="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        {/* En-tête avec titre */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Marketplace</h1>
        </div>

        {/* Composant de filtres centralisé */}
        <ProductFilters
          initialValues={initialFilters}
          onFilterChange={updateFilters}
          onResetFilters={resetFilters}
          hasGeolocation={!!latitude && !!longitude}
          onRequestGeolocation={getPosition}
          isRequestingLocation={loading}
          showExpandedFilters={showExpandedFilters}
          onToggleExpandedFilters={() => setShowExpandedFilters(!showExpandedFilters)}
          className="mb-6"
        />

        {/* Contenu principal */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Résultats */}
          <div className="flex-1">
            {/* Nombre de résultats */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">
                {pagination.total} produit{pagination.total > 1 ? "s" : ""} trouvé{pagination.total > 1 ? "s" : ""}
              </h2>
            </div>

            {/* Liste des produits */}
            {products.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed bg-white p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10 text-gray-400"
                  >
                    <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"></path>
                    <circle cx="18" cy="18" r="3"></circle>
                    <path d="m19.5 14.5-3 3"></path>
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold">No result</h3>  
                  <p className="mt-2 text-sm text-gray-500">
                    No product matches your search criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md relative"
                    >
                      <div className="aspect-square overflow-hidden relative bg-gray-50">
                        <Image
                          src={product.primaryImage || "/placeholder.svg?height=300&width=300&query=product"}
                          alt={product.title}
                          width={300}
                          height={300}
                          className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105"
                        />
                        {/* Favorite button */}
                        <button
                          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white shadow border border-gray-200 transition
                            ${favoriteStates[product.id] ? "text-rose-500" : "text-gray-400"} hover:scale-110`}
                          onClick={(e) => toggleFavorite(product.id, e)}
                          disabled={favoriteLoading[product.id]}
                          aria-label={favoriteStates[product.id] ? "Remove from favorites" : "Add to favorites"}
                          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                        >
                          {favoriteLoading[product.id] ? (
                            <svg className="animate-spin h-4 w-4 text-rose-500" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : (
                            <Heart className={`h-4 w-4 ${favoriteStates[product.id] ? "fill-rose-500" : ""}`} />
                          )}
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium line-clamp-1 text-sm">{product.title}</h3>
                        <p className="mt-1 text-base font-bold text-rose-500">{product.price.toLocaleString()}€</p>
                        <div className="mt-1.5 flex items-center text-xs text-gray-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 h-3 w-3"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span className="line-clamp-1">{product.location || "Location not specified"}</span>
                          {product.distance !== undefined && (
                            <span className="ml-auto">{Math.round(product.distance)} km</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {product.createdAt
                              ? new Date(product.createdAt).toLocaleDateString("en-US")
                              : "Unknown date"}
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
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m15 18-6-6 6-6"></path>
                        </svg>
                      </button>

                      {paginationItems.map((item, index) =>
                        typeof item === "string" ? (
                          <span key={`ellipsis-${index}`} className="px-2">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            onClick={() => handlePageChange(item)}
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium ${
                              currentPage === item
                                ? "border-rose-500 bg-rose-500 text-white"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m9 18 6-6-6-6"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
