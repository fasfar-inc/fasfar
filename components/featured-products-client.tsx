"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { calculateDistance } from "@/lib/utils"

interface Product {
  id: number
  title: string
  price: number
  location: string
  distance: number | null
  image: string
  favoritesCount?: number
  latitude?: number | null
  longitude?: number | null
}

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProductsClient({ products }: FeaturedProductsProps) {
  const [mounted, setMounted] = useState(false)
  const [productsWithDistance, setProductsWithDistance] = useState<Product[]>(products)

  useEffect(() => {
    setMounted(true)

    // Récupérer les coordonnées de l'utilisateur depuis localStorage
    const storedLat = localStorage.getItem("user-latitude")
    const storedLng = localStorage.getItem("user-longitude")

    if (storedLat && storedLng) {
      const lat = Number.parseFloat(storedLat)
      const lng = Number.parseFloat(storedLng)

      // Recalculer les distances pour tous les produits
      const updatedProducts = products.map((product) => {
        if (product.latitude && product.longitude) {
          return {
            ...product,
            distance: calculateDistance(lat, lng, product.latitude, product.longitude),
          }
        }
        return product
      })

      setProductsWithDistance(updatedProducts)
    }
  }, [products])

  // Ajouter un style pour l'effet de badge
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
    .featured-product {
      position: relative;
    }
    .badge-pop {
      transition: transform 0.2s ease;
    }
    .scale-100 {
      transform: scale(1);
    }
  `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  if (!mounted) return null

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">New arrivals</h2>
            <p className="text-gray-500">Discover the freshly added products near you.</p>
          </div>
          <Link href="/marketplace">
            <Button variant="link" className="gap-1 text-rose-500">
              See all products
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productsWithDistance.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md featured-product"
              onMouseEnter={(e) => {
                // Effet de surprise: faire apparaître un badge "Populaire"
                if (product.favoritesCount && product.favoritesCount > 0) {
                  const badge = document.createElement("div")
                  badge.className =
                    "absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-medium transform scale-0 badge-pop flex items-center gap-1"

                  const starIcon = document.createElement("span")
                  starIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`

                  const text = document.createTextNode(`${product.favoritesCount}`)

                  badge.appendChild(starIcon)
                  badge.appendChild(text)
                  e.currentTarget.appendChild(badge)

                  setTimeout(() => {
                    badge.classList.add("scale-100")
                  }, 10)
                }
              }}
              onMouseLeave={(e) => {
                // Supprimer le badge au survol
                const badge = e.currentTarget.querySelector(".badge-pop")
                if (badge) {
                  badge.classList.remove("scale-100")
                  setTimeout(() => {
                    badge.remove()
                  }, 200)
                }
              }}
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium line-clamp-1">{product.title}</h3>
                <p className="mt-1 text-lg font-bold text-rose-500">{product.price.toLocaleString()}€</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin className="mr-1 h-3.5 w-3.5" />
                  <span className="line-clamp-1">{product.location}</span>
                  {product.distance !== null ? (
                    <span className="ml-auto">{product.distance} km</span>
                  ) : (
                    <span className="ml-auto text-gray-400">Unknown distance</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
