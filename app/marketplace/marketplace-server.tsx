import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import type { ProductCategory, ProductCondition } from "@prisma/client"
import MarketplaceClient from "./marketplace-client"
import MarketplaceSkeleton from "./marketplace-skeleton"
import { calculateDistance } from "@/lib/utils"

export interface MarketplaceServerProps {
  searchParams: {
    category?: string
    minPrice?: string
    maxPrice?: string
    condition?: string
    location?: string
    distance?: string
    latitude?: string
    longitude?: string
    search?: string
    sortBy?: string
    page?: string
    limit?: string
  }
}

export default async function MarketplaceServer({ searchParams }: MarketplaceServerProps) {
  // Extraire les paramètres de filtrage
  const filters = {
    category: searchParams.category as ProductCategory | undefined,
    minPrice: searchParams.minPrice ? Number.parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number.parseFloat(searchParams.maxPrice) : undefined,
    condition: searchParams.condition as ProductCondition | undefined,
    location: searchParams.location || undefined,
    distance: searchParams.distance ? Number.parseFloat(searchParams.distance) : 50, // Changé de 100 à 50
    latitude: searchParams.latitude ? Number.parseFloat(searchParams.latitude) : undefined,
    longitude: searchParams.longitude ? Number.parseFloat(searchParams.longitude) : undefined,
    search: searchParams.search || undefined,
    sortBy: searchParams.sortBy || "date_desc",
    page: searchParams.page ? Number.parseInt(searchParams.page) : 1,
    limit: searchParams.limit ? Number.parseInt(searchParams.limit) : 12,
  }

  // Construire la requête avec les filtres
  const where: any = {
    isActive: true,
    isSold: false,
  }

  if (filters.category) {
    where.category = filters.category
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {}
    if (filters.minPrice) where.price.gte = filters.minPrice
    if (filters.maxPrice) where.price.lte = filters.maxPrice
  }

  if (filters.condition) {
    where.condition = filters.condition
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ]
  }

  // Calcul de la pagination
  const skip = (filters.page - 1) * filters.limit

  // Déterminer l'ordre de tri
  let orderBy: any = {}
  switch (filters.sortBy) {
    case "price_asc":
      orderBy = { price: "asc" }
      break
    case "price_desc":
      orderBy = { price: "desc" }
      break
    case "date_asc":
      orderBy = { createdAt: "asc" }
      break
    case "date_desc":
    default:
      orderBy = { createdAt: "desc" }
      break
  }

  // Récupérer les produits
  const products = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: filters.limit,
    include: {
      seller: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          city: true,
          isVerified: true,
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
        },
      },
      images: {
        select: {
          id: true,
          imageUrl: true,
          isPrimary: true,
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  })

  // Compter le nombre total de produits pour la pagination
  const totalProducts = await prisma.product.count({ where })

  // Formater les produits pour inclure l'image principale et la note moyenne du vendeur
  const formattedProducts = products.map((product) => {
    const primaryImage = product.images.find((img) => img.isPrimary)

    // Calculer la note moyenne du vendeur
    const sellerRating =
      product.seller.reviewsReceived.length > 0
        ? product.seller.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) /
          product.seller.reviewsReceived.length
        : null

    // Calculer la distance si les coordonnées sont fournies
    let distance = undefined
    if (filters.latitude && filters.longitude && product.latitude && product.longitude) {
      distance = calculateDistance(filters.latitude, filters.longitude, product.latitude, product.longitude)
    }

    return {
      ...product,
      primaryImage: primaryImage ? primaryImage.imageUrl : product.images[0]?.imageUrl || null,
      favoritesCount: product._count.favorites,
      seller: {
        ...product.seller,
        rating: sellerRating,
        reviewsReceived: undefined, // Ne pas renvoyer les avis individuels
      },
      distance,
    }
  })

  // Si le tri est par distance, trier les produits après avoir calculé les distances
  let sortedProducts = [...formattedProducts]
  if (filters.sortBy === "distance" && filters.latitude && filters.longitude) {
    sortedProducts.sort((a, b) => {
      if (!a.distance) return 1
      if (!b.distance) return -1
      return a.distance - b.distance
    })
  }

  // Filtrer par distance si nécessaire
  if (filters.distance && filters.latitude && filters.longitude) {
    sortedProducts = sortedProducts.filter(
      (product) => product.distance !== undefined && product.distance <= filters.distance,
    )
  }

  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplaceClient
        products={sortedProducts}
        pagination={{
          total: totalProducts,
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(totalProducts / filters.limit),
        }}
        filters={filters}
      />
    </Suspense>
  )
}
