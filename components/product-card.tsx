import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from "lucide-react"

interface ProductImage {
  id: number
  imageUrl: string
  isPrimary: boolean
}

interface Product {
  id: number
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
}

interface ProductCardProps {
  product: Product
  showDistance?: boolean
}

export default function ProductCard({ product, showDistance }: ProductCardProps) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden h-full transition-all hover:shadow-md">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={primaryImage?.imageUrl || "/placeholder.svg"}
            alt={product.title}
            width={300}
            height={300}
            className="object-cover w-full h-full"
          />
          {product.isSold && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge className="bg-red-500 text-white text-lg py-1 px-3">Sold</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{product.title}</h3>
          <p className="text-xl font-bold mt-1">{product.price.toLocaleString()} €</p>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1">{product.location || "Location not specified"}</span>
          </div>
          {product.distance !== undefined && showDistance && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin size={14} className="mr-1" />
              <span>{product.distance} km</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center text-sm">
            <Badge variant="outline" className="font-normal">
              {product.condition}
            </Badge>
          </div>
          {product.seller && (
            <div className="flex items-center text-sm">
              <Star className="h-3 w-3 mr-1 text-amber-500" />
              <span>{product.seller.rating?.toFixed(1) || "4.5"}</span>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}
