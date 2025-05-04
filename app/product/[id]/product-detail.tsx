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

// Types pour le produit
interface ProductImage {
  id: number
  productId: number
  imageUrl: string
  isPrimary: boolean
}

interface ProductSeller {
  id: number
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
  id: number
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
  sellerId: number
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
    return "Aujourd'hui"
  } else if (diffDays === 1) {
    return "Hier"
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`
  } else if (diffDays < 30) {
    return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? "s" : ""}`
  } else if (diffDays < 365) {
    return `Il y a ${Math.floor(diffDays / 30)} mois`
  } else {
    return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? "s" : ""}`
  }
}

// Fonction pour formater les catégories
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    ELECTRONICS: "Électronique",
    CLOTHING: "Vêtements",
    FURNITURE: "Mobilier",
    BOOKS: "Livres",
    TOYS: "Jouets",
    SPORTS: "Sports",
    VEHICLES: "Véhicules",
    JEWELRY: "Bijoux",
    HOME_APPLIANCES: "Électroménager",
    BEAUTY: "Beauté",
    GARDEN: "Jardin",
    MUSIC: "Musique",
    COLLECTIBLES: "Collections",
    OTHER: "Autre",
  }

  return categoryMap[category] || category
}

// Fonction pour formater les conditions
function formatCondition(condition: string): string {
  const conditionMap: Record<string, string> = {
    NEW: "Neuf",
    LIKE_NEW: "Comme neuf",
    GOOD: "Bon état",
    FAIR: "État correct",
    POOR: "État moyen",
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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // États pour le zoom
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position2, setPosition2] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showZoomControls, setShowZoomControls] = useState(false)

  // Référence à l'image zoomée
  const zoomedImageRef = useRef<HTMLDivElement>(null)

  // Vérifier si l'utilisateur est le propriétaire du produit
  const isOwner = session?.user?.id && product.sellerId === Number.parseInt(session.user.id)

  // Calculer la distance entre l'utilisateur et le produit
  const distance = useMemo(() => {
    if (latitude && longitude && product.latitude && product.longitude) {
      return calculateDistance(latitude, longitude, product.latitude, product.longitude)
    }
    return null
  }, [latitude, longitude, product.latitude, product.longitude])

  // Vérifier si le produit est dans les favoris de l'utilisateur
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
        console.error("Erreur lors de la vérification des favoris:", error)
      }
    }

    checkFavoriteStatus()
  }, [product.id, session])

  // Ajouter un style pour l'effet d'onde
  if (typeof document !== "undefined") {
    const style = document.createElement("style")
    style.innerHTML = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      background-color: rgba(255, 255, 255, 0.3);
    }

    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
    
    .zoomed-image {
      transition: transform 0.2s ease-out;
      cursor: grab;
    }
    
    .zoomed-image.dragging {
      cursor: grabbing;
      transition: none;
    }
    
    .zoom-controls {
      transition: opacity 0.3s ease;
    }
    
    @keyframes heartBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3); }
    }
    .heart-bounce {
      animation: heartBounce 0.5s ease;
    }
    
    /* Style personnalisé pour les onglets */
    .custom-tabs {
      background-color: #f3f4f6;
      padding: 8px;
      border-radius: 24px;
      position: relative;
      overflow: hidden;
    }
    
    .custom-tab {
      border-radius: 18px !important;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
      padding: 16px 0 !important;
      font-size: 16px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 56px;
    }
    
    .custom-tab[data-state="active"] {
      color: #e11d48;
      background-color: transparent;
    }
    
    .custom-tab:hover:not([data-state="active"]) {
      background-color: rgba(255, 255, 255, 0.5);
    }
    
    /* Indicateur qui glisse */
    .custom-tabs::after {
      content: '';
      position: absolute;
      top: 8px;
      left: 8px;
      width: calc(33.33% - 5.33px);
      height: calc(100% - 16px);
      background-color: white;
      border-radius: 18px;
      transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      z-index: 1;
    }
    
    .custom-tabs[data-state="details"]::after {
      transform: translateX(100%);
    }
    
    .custom-tabs[data-state="shipping"]::after {
      transform: translateX(200%);
    }
    
    .custom-tab-content {
      border-radius: 18px;
      background-color: white;
      margin-top: 20px;
      padding: 24px;
      border: 1px solid #f3f4f6;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
    }
  `
    document.head.appendChild(style)
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

  // Fonction pour basculer l'état favori
  const toggleFavorite = async () => {
    if (!session) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des produits à vos favoris.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFavorited: !isFavorite }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour des favoris")
      }

      setIsFavorite(!isFavorite)

      toast({
        title: isFavorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: isFavorite ? "Ce produit a été retiré de vos favoris." : "Ce produit a été ajouté à vos favoris.",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des favoris.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour supprimer le produit
  const deleteProduct = async () => {
    if (!session || !isOwner) return

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du produit")
      }

      toast({
        title: "Produit supprimé",
        description: "Votre produit a été supprimé avec succès.",
      })

      // Rediriger vers la page de profil
      router.push("/profile")
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du produit.",
        variant: "destructive",
      })
    }
  }

  // Préparer les détails du produit pour l'affichage
  const productDetails = [
    { label: "Catégorie", value: formatCategory(product.category) },
    { label: "État", value: formatCondition(product.condition) },
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
                alt="Image zoomée"
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
                Déplacez l'image
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
          Retour au marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div
              className="overflow-hidden rounded-lg bg-white cursor-zoom-in"
              onClick={() => setZoomedImage(mainImage)}
            >
              <Image
                src={mainImage || "/placeholder.svg?height=600&width=600"}
                alt={product.title}
                width={600}
                height={600}
                className="h-full w-full object-cover"
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
                  }`}
                >
                  <Image
                    src={image.imageUrl || "/placeholder.svg?height=96&width=96"}
                    alt={`${product.title} - Image ${index + 1}`}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="mb-2">
                  {formatCategory(product.category)}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite()

                      // Effet de surprise: faire rebondir le cœur
                      const heart = e.currentTarget.querySelector("svg")
                      if (heart) {
                        heart.classList.add("heart-bounce")
                        setTimeout(() => heart.classList.remove("heart-bounce"), 500)
                      }
                    }}
                    className={isFavorite ? "text-rose-500" : ""}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-rose-500" : ""}`} />
                    <span className="sr-only">Ajouter aux favoris</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Partager</span>
                  </Button>
                </div>
              </div>
              <h1 className="text-2xl font-bold md:text-3xl">{product.title}</h1>
              <p className="mt-2 text-3xl font-bold text-rose-500">{product.price.toLocaleString()}€</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <MapPin className="mr-1 h-4 w-4" />
                <span>{product.location}</span>
                {product.latitude && product.longitude && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{distance !== null ? `${distance.toFixed(1)} km` : "Distance inconnue"}</span>
                  </>
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
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="flex items-center text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
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
                        Membre depuis{" "}
                        {new Date(product.seller.createdAt).toLocaleDateString("fr-FR", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {!isOwner && (
                  <Button
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={() => {
                      if (!session?.user) {
                        router.push(`/login?callbackUrl=/product/${product.id}`)
                        return
                      }
                      router.push(`/messages/${product.seller.id}?productId=${product.id}`)
                    }}
                  >
                    Contacter
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
              onValueChange={(value) => {
                // Mettre à jour l'état de l'indicateur
                const tabsList = document.querySelector(".custom-tabs")
                if (tabsList) {
                  tabsList.setAttribute("data-state", value)
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-3 custom-tabs" data-state="description">
                <TabsTrigger value="description" className="custom-tab">
                  Description
                </TabsTrigger>
                <TabsTrigger value="details" className="custom-tab">
                  Détails
                </TabsTrigger>
                <TabsTrigger value="shipping" className="custom-tab">
                  Livraison
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 space-y-4 custom-tab-content">
                <p className="text-gray-700">{product.description}</p>
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
                  Ce produit est disponible pour un retrait en personne à {product.location}.
                </p>
                <p className="text-gray-700">Le vendeur préfère une rencontre en personne pour la transaction.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Boîte de dialogue de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le produit sera définitivement supprimé de la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteProduct} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
