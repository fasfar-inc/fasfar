"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MapPin, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: number
  title: string
  price: number
  location: string
  distance: number
  image: string
}

interface NearbyProductsProps {
  initialProducts: Product[]
}

export function NearbyProducts({ initialProducts }: NearbyProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [])

  // Recherche de produits à proximité lorsque la position de l'utilisateur change
  useEffect(() => {
    if (userLocation) {
      fetchNearbyProducts()
    }
  }, [userLocation])

  // Fonction pour récupérer les produits à proximité
  const fetchNearbyProducts = async () => {
    if (!userLocation) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/products?latitude=${userLocation.lat}&longitude=${userLocation.lng}&sortBy=distance&limit=3`,
      )
      if (response.ok) {
        const data = await response.json()
        if (data.products && Array.isArray(data.products)) {
          const formattedProducts = data.products.map((product: any) => ({
            id: product.id,
            title: product.title,
            price: product.price,
            location: product.location,
            distance: product.distance || 0,
            image: product.primaryImage || "/diverse-products-still-life.png",
          }))
          setProducts(formattedProducts)
        }
      }
    } catch (error) {
      console.error("Error fetching nearby products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour gérer la recherche
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Filtrer les produits en fonction du terme de recherche
  const filteredProducts = products.filter((product) => product.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="relative w-full max-w-[500px] overflow-hidden rounded-xl border bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="h-5 w-5 text-rose-500" />
          <span className="text-sm text-gray-500">
            {userLocation ? "Products near you" : "Enable geolocation to see products nearby"}
          </span>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search for products..."
            className="w-full pl-10 bg-gray-50 border-gray-200"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="space-y-4">
          {isLoading ? (
            // Afficher un état de chargement
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg">
                  <div className="h-16 w-16 rounded-md bg-gray-200 animate-pulse"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
              ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.title}</p>
                  <p className="text-sm text-gray-500 truncate">About {product.distance} km from you</p>
                </div>
                <div className="font-medium text-rose-500">{product.price.toLocaleString()}€</div>
              </Link>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              {searchTerm ? "No products match your search" : "No products nearby"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
