"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Heart } from "lucide-react"

interface ProductImage {
  id: number | string
  imageUrl: string
  isPrimary: boolean
}

interface Product {
  id: number | string
  title: string
  price: number
  location: string | null
  condition: string
  isSold: boolean
  images: ProductImage[]
  seller?: {
    rating: number | null
  }
  distance?: number
  favoritesCount?: number
}

interface ProductCardProps {
  product: Product
  showDistance?: boolean
}

export default function ProductCard({ product, showDistance }: ProductCardProps) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
  const { data: session } = useSession()
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(product.favoritesCount || 0)

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!session) return
      try {
        const response = await fetch(`/api/products/${product.id}/favorite`)
        if (response.ok) {
          const data = await response.json()
          setIsFavorite(data.isFavorited)
        }
      } catch {}
    }
    checkFavoriteStatus()
  }, [product.id, session])

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) {
      router.push(`/login?callbackUrl=/product/${product.id}`)
      return
    }
    setFavoriteLoading(true)
    try {
      let response
      if (!isFavorite) {
        response = await fetch(`/api/products/${product.id}/favorite`, { method: "POST" })
      } else {
        response = await fetch(`/api/products/${product.id}/favorite`, { method: "DELETE" })
      }
      if (!response.ok) {
        throw new Error('Favorite operation failed')
      }
      const data = await response.json()
      setIsFavorite(data.isFavorited)
      setFavoritesCount((count) => count + (data.isFavorited ? 1 : -1))
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setFavoriteLoading(false)
    }
  }

  return (
    <div className="relative group">
      <Link href={`/product/${product.id}`}>
        <Card className="overflow-hidden h-full transition-all hover:shadow-md">
          <div className="aspect-square relative overflow-hidden bg-gray-50">
            <Image
              src={primaryImage?.imageUrl || "/placeholder.svg"}
              alt={product.title}
              width={300}
              height={300}
              className="object-contain w-full h-full p-2"
              unoptimized={primaryImage?.imageUrl?.startsWith('https://')}
            />
            {product.isSold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge className="bg-red-500 text-white text-lg py-1 px-3">Sold</Badge>
              </div>
            )}
            {/* Like button */}
            <button
              className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white shadow border border-gray-200 transition
                ${isFavorite ? "text-rose-500" : "text-gray-400"} hover:scale-110`}
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500" : ""}`} />
              {favoritesCount > 0 && (
                <span className="ml-1 text-xs font-semibold align-middle">{favoritesCount}</span>
              )}
            </button>
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium text-sm line-clamp-1">{product.title}</h3>
            <p className="text-base font-bold mt-1 text-rose-500">{product.price.toLocaleString()} €</p>
            <div className="flex items-center mt-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{product.location || "Nicosia, Cyprus"}</span>
            </div>
            {product.distance !== undefined && showDistance && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin size={12} className="mr-1" />
                <span>{product.distance} km</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-between items-center">
            <div className="flex items-center text-xs">
              <Badge variant="outline" className="font-normal text-xs">
                {product.condition}
              </Badge>
            </div>
            {product.seller && (
              <div className="flex items-center text-xs">
                <Star className="h-3 w-3 mr-1 text-amber-500" />
                <span>{product.seller.rating?.toFixed(1) || "4.5"}</span>
              </div>
            )}
          </CardFooter>
        </Card>
      </Link>
    </div>
  )
}
