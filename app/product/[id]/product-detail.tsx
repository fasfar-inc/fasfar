"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Heart,
  MapPin,
  Share2,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Move,
  Edit,
  Trash2,
  MessageCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useGeolocation } from "@/hooks/use-geolocation"
import { calculateDistance } from "@/lib/utils"
import { LocationPickerMap } from "@/components/location-picker-map"

// Types pour le produit
interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  isPrimary: boolean
}

interface ProductSeller {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  city?: string
  isVerified: boolean
  rating: number
  reviewsCount: number
  productsCount: number
  successfulSales: number
  createdAt: string
}

interface ProductDetail {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  location: string
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt: string
  sellerId: string
  isActive: boolean
  isSold: boolean
  viewsCount: number
  images: ProductImage[]
  seller: ProductSeller
  primaryImage?: string
  favoritesCount: number
}

// Fonction pour formater la date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Today"
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `There are ${diffDays} days ago`
  } else if (diffDays < 30) {
    return `There are ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""}`
  } else if (diffDays < 365) {
    return `There are ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""}`
  } else {
    return `There are ${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? "s" : ""}`
  }
}

// Fonction pour formater les catégories
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    ELECTRONICS: "Electronics",
    CLOTHING: "Clothing",
    FURNITURE: "Furniture",
    BOOKS: "Books",
    TOYS: "Toys",
    SPORTS: "Sports",
    VEHICLES: "Vehicles",
    JEWELRY: "Jewelry",
    HOME_APPLIANCES: "Home appliances",
    BEAUTY: "Beauty",
    GARDEN: "Garden",
    MUSIC: "Music",
    COLLECTIBLES: "Collections",
    OTHER: "Other",
  }

  return categoryMap[category] || category
}

// Fonction pour formater les conditions
function formatCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    NEW: "New",
    LIKE_NEW: "Like new",
    GOOD: "Good",
    FAIR: "Fair",
    POOR: "Poor",
  }

  return conditionMap[condition] || condition
}

export default function ProductDetail({ product }: { product: ProductDetail }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { latitude, longitude } = useGeolocation()

  const [mainImage, setMainImage] = useState<string | null>(product.primaryImage || product.images[0]?.imageUrl || null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const [favoritesCount, setFavoritesCount] = useState(product.favoritesCount || 0)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("description")

  // États pour le zoom
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position2, setPosition2] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showZoomControls, setShowZoomControls] = useState(false)

  // Référence à l'image zoomée
  const zoomedImageRef = useRef<HTMLDivElement>(null)

  // Vérifier si l'utilisateur est le propriétaire du produit
  const isOwner = session?.user?.id && product.sellerId === session.user.id

  // Calculer la distance entre l'utilisateur et le produit
  const distance = useMemo(() => {
    if (latitude && longitude && product.latitude && product.longitude) {
      return calculateDistance(latitude, longitude, product.latitude, product.longitude)
    }
    return null
  }, [latitude, longitude, product.latitude, product.longitude])

  // Check if product is favorited on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session) return
      try {
        const response = await fetch(`/api/products/${product.id}/favorite`)
        if (response.ok) {
          const data = await response.json()
          setIsFavorite(data.isFavorited)
        }
      } catch (error) {
        setFavoriteError("Failed to check favorite status.")
      }
    }
    checkFavoriteStatus()
  }, [product.id, session])

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!session) {
      toast({
        title: "Connection required",
        description: "Please connect to add products to your favorites.",
        variant: "destructive",
      })
      return
    }
    setFavoriteLoading(true)
    setFavoriteError(null)
    try {
      let response
      if (!isFavorite) {
        response = await fetch(`/api/products/${product.id}/favorite`, { method: "POST" })
      } else {
        response = await fetch(`/api/products/${product.id}/favorite`, { method: "DELETE" })
      }
      if (!response.ok) throw new Error("Failed to update favorite.")
      setIsFavorite(!isFavorite)
      setFavoritesCount((count) => count + (!isFavorite ? 1 : -1))
      toast({
        title: !isFavorite ? "Added to favorites" : "Removed from favorites",
        description: !isFavorite
          ? "This product has been added to your favorites."
          : "This product has been removed from your favorites.",
      })
    } catch (error) {
      setFavoriteError("Failed to update favorite.")
      toast({
        title: "Error",
        description: "An error occurred while updating favorites.",
        variant: "destructive",
      })
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Fonction pour naviguer entre les images en mode plein écran
  const navigateImages = useCallback(
    (direction: "next" | "prev") => {
      if (!zoomedImage || !product.images) return

      // Réinitialiser le zoom et la position lors du changement d'image
      setZoomLevel(1)
      setPosition2({ x: 0, y: 0 })

      const currentIndex = product.images.findIndex((img) => img.imageUrl === zoomedImage)
      let newIndex

      if (direction === "next") {
        newIndex = (currentIndex + 1) % product.images.length
      } else {
        newIndex = (currentIndex - 1 + product.images.length) % product.images.length
      }

      setZoomedImage(product.images[newIndex].imageUrl)
      setCurrentImageIndex(newIndex)
    },
    [zoomedImage, product.images],
  )

  // Fonctions de zoom
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 5))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1)
      if (newZoom === 1) {
        setPosition2({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const resetZoom = () => {
    setZoomLevel(1)
    setPosition2({ x: 0, y: 0 })
  }

  // Gestion du déplacement de l'image zoomée
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position2.x, y: e.clientY - position2.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const maxOffsetX = (zoomLevel - 1) * 300 // Valeur approximative, à ajuster selon la taille de l'image
      const maxOffsetY = (zoomLevel - 1) * 300

      let newX = e.clientX - dragStart.x
      let newY = e.clientY - dragStart.y

      // Limiter le déplacement pour ne pas sortir de l'image
      newX = Math.max(Math.min(newX, maxOffsetX), -maxOffsetX)
      newY = Math.max(Math.min(newY, maxOffsetY), -maxOffsetY)

      setPosition2({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Gestion de la molette de la souris pour le zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (zoomedImage) {
      e.preventDefault()
      if (e.deltaY < 0) {
        handleZoomIn()
      } else {
        handleZoomOut()
      }
    }
  }

  // Préparer les détails du produit pour l'affichage
  const productDetails = [
    { label: "Category", value: formatCategory(product.category) },
    { label: "Condition", value: formatCondition(product.condition) },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Overlay de zoom d'image */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => {
            if (zoomLevel === 1) {
              setZoomedImage(null)
            } else {
              resetZoom()
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            ref={zoomedImageRef}
            className="relative max-h-[90vh] max-w-[90vw] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`zoomed-image ${isDragging ? "dragging" : ""}`}
              style={{
                transform: `scale(${zoomLevel}) translate(${position2.x / zoomLevel}px, ${position2.y / zoomLevel}px)`,
                transformOrigin: "center",
                cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
              onMouseDown={handleMouseDown}
            >
              <Image
                src={zoomedImage || "/placeholder.svg"}
                alt="Zoomed image"
                width={1200}
                height={1200}
                className="max-h-[90vh] max-w-[90vw] object-contain"
                draggable={false}
              />
            </div>

            {/* Contrôles de zoom */}
            <div
              className={`absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/60 text-white rounded-full flex items-center space-x-2 p-1 zoom-controls ${showZoomControls ? "opacity-100" : "opacity-0"}`}
            >
              <button
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut className="h-5 w-5" />
              </button>

              <div className="px-2 min-w-[60px] text-center">{Math.round(zoomLevel * 100)}%</div>

              <button
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 5}
              >
                <ZoomIn className="h-5 w-5" />
              </button>

              <button
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={resetZoom}
                disabled={zoomLevel === 1}
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>

            <button
              className="absolute -top-4 -right-4 rounded-full bg-white p-2 shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                setZoomedImage(null)
                resetZoom()
              }}
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
                className="h-5 w-5"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            {/* Navigation buttons */}
            <button
              className="absolute left-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all"
              onClick={(e) => {
                e.stopPropagation()
                navigateImages("prev")
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              className="absolute right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all"
              onClick={(e) => {
                e.stopPropagation()
                navigateImages("next")
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {product.images.length}
            </div>

            {/* Indicateur de zoom */}
            {zoomLevel > 1 && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center">
                <Move className="h-4 w-4 mr-2" />
                Move the image
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container py-6 flex-1">
        <Link
          href="/marketplace"
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to the marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div
              className="overflow-hidden rounded-lg bg-white cursor-zoom-in aspect-[1/1] w-full flex items-center justify-center"
              onClick={() => setZoomedImage(mainImage)}
            >
              <Image
                src={mainImage || "/placeholder.svg?height=600&width=600"}
                alt={product.title}
                width={600}
                height={600}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(image.imageUrl)}
                  className={`relative overflow-hidden rounded-md transition-all ${
                    mainImage === image.imageUrl
                      ? "border-2 border-rose-500 h-24 w-24"
                      : "border border-gray-200 h-20 w-20"
                  } aspect-[1/1] flex items-center justify-center bg-white`}
                >
                  <Image
                    src={image.imageUrl || "/placeholder.svg?height=96&width=96"}
                    alt={`${product.title} - Image ${index + 1}`}
                    width={96}
                    height={96}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="mb-2 flex items-center gap-2">
              <Link href={`/marketplace?category=${encodeURIComponent(product.category)}`}>
                <Badge variant="outline" className="mb-2 bg-rose-50 text-rose-600 border-rose-200 px-4 py-2 text-base font-semibold hover:bg-rose-100 cursor-pointer transition">
                  {formatCategory(product.category)}
                </Badge>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={async (e) => {
                  e.preventDefault()
                  if (!session) {
                    router.push(`/login?callbackUrl=/product/${product.id}`)
                    return
                  }
                  await toggleFavorite()
                  // Only add animation if we're not in loading state
                  if (!favoriteLoading) {
                    const heart = e.currentTarget.querySelector("svg")
                    if (heart) {
                      heart.classList.add("heart-bounce")
                      setTimeout(() => heart.classList.remove("heart-bounce"), 500)
                    }
                  }
                }}
                className={isFavorite ? "text-rose-500" : ""}
                disabled={favoriteLoading}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {favoriteLoading ? (
                  <svg className="animate-spin h-5 w-5 text-rose-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-rose-500" : ""}`} />
                )}
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
              <p className="mt-2 text-3xl font-bold text-rose-500">{product.price.toLocaleString()}€</p>
              <div className="mt-2 flex items-center text-sm text-gray-500 flex-wrap gap-2">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{product.location || "Nicosia, Cyprus"}</span>
                {product.latitude && product.longitude && (
                  <div className="w-full mt-2">
                    <LocationPickerMap
                      latitude={product.latitude}
                      longitude={product.longitude}
                      address={product.location}
                      onLocationChange={() => {}}
                      height="180px"
                    />
                  </div>
                )}
                <span className="mx-2">•</span>
                <span>{formatDate(product.createdAt)}</span>
              </div>

              {/* Options de modification/suppression pour le propriétaire */}
              {isOwner && (
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/product/edit/${product.id}`)}
                    className="flex items-center"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modify
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={product.seller.profileImage || "/placeholder.svg?height=100&width=100"}
                      alt={product.seller.username}
                    />
                    <AvatarFallback>{product.seller.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{product.seller.username}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="mr-1 h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{product.seller.rating.toFixed(1)}</span>
                      </div>
                      <span className="mx-2">•</span>
                      <span>
                        Member since{" "}
                        {new Date(product.seller.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {!isOwner && (
                  <Button
                    variant="default"
                    className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center gap-2 shadow-md"
                    onClick={() => {
                      if (!session?.user) {
                        router.push(`/login?callbackUrl=/product/${product.id}`)
                        return
                      }
                      router.push(`/messages/${product.seller.id}?productId=${product.id}`)
                    }}
                  >
                    <MessageCircle className="h-5 w-5 mr-1" />
                    Contact Seller
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border bg-gray-50 p-4 text-sm">
                <div>
                  <p className="text-gray-500">Produits</p>
                  <p className="font-medium">{product.seller.productsCount}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avis</p>
                  <p className="font-medium">{product.seller.reviewsCount}</p>
                </div>
              </div>
            </div>

            <Separator />

            <Tabs
              defaultValue="description"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <div className="relative">
                <TabsList className="flex w-full bg-gray-100 rounded-2xl p-1 mb-2 shadow-sm">
                  <TabsTrigger value="description" className="flex-1 py-3 font-semibold text-base rounded-2xl data-[state=active]:bg-white data-[state=active]:text-rose-500 data-[state=active]:shadow-md transition-all">
                    Description
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex-1 py-3 font-semibold text-base rounded-2xl data-[state=active]:bg-white data-[state=active]:text-rose-500 data-[state=active]:shadow-md transition-all">
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="shipping" className="flex-1 py-3 font-semibold text-base rounded-2xl data-[state=active]:bg-white data-[state=active]:text-rose-500 data-[state=active]:shadow-md transition-all">
                    Shipping
                  </TabsTrigger>
                </TabsList>
                <span
                  className="absolute bottom-0 left-0 h-1 bg-rose-500 rounded-full transition-all duration-300"
                  style={{
                    width: '33.33%',
                    transform: `translateX(${['description','details','shipping'].indexOf(activeTab) * 100}%)`
                  }}
                ></span>
              </div>
              <TabsContent value="description" className="mt-4 space-y-4 custom-tab-content">
                <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
              </TabsContent>
              <TabsContent value="details" className="mt-4 custom-tab-content">
                <dl className="grid grid-cols-2 gap-4">
                  {productDetails.map((detail, index) => (
                    <div key={index}>
                      <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                      <dd className="text-gray-900">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4 space-y-4 custom-tab-content">
                <p className="text-gray-700">
                  This product is available for a face-to-face meeting at {product.location}.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is irreversible. The product will be permanently deleted from the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              try {
                const response = await fetch(`/api/products/${product.id}`, {
                  method: "DELETE",
                })

                if (!response.ok) {
                  throw new Error("Failed to delete product")
                }

                toast({
                  title: "Product deleted",
                  description: "Your product has been successfully deleted.",
                })

                router.push("/marketplace")
              } catch (error) {
                console.error("Error deleting product:", error)
                toast({
                  title: "Error",
                  description: "An error occurred while deleting the product.",
                  variant: "destructive",
                })
              }
            }} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
