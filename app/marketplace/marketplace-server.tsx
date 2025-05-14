import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import type { ProductCondition } from "@prisma/client"
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

export default async function MarketplaceServer({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extraire les paramètres de filtrage
  const params = await Promise.resolve(searchParams)
  const filters = {
    category: typeof params.category === 'string' ? params.category : undefined,
    minPrice: typeof params.minPrice === 'string' ? Number.parseFloat(params.minPrice) : undefined,
    maxPrice: typeof params.maxPrice === 'string' ? Number.parseFloat(params.maxPrice) : undefined,
    condition: typeof params.condition === 'string' ? params.condition as ProductCondition : undefined,
    location: typeof params.location === 'string' ? params.location : undefined,
    distance: typeof params.distance === 'string' ? Number.parseFloat(params.distance) : undefined,
    latitude: typeof params.latitude === 'string' ? Number.parseFloat(params.latitude) : undefined,
    longitude: typeof params.longitude === 'string' ? Number.parseFloat(params.longitude) : undefined,
    search: typeof params.search === 'string' ? params.search : undefined,
    sortBy: typeof params.sortBy === 'string' ? params.sortBy : "date_desc",
    page: typeof params.page === 'string' ? Number.parseInt(params.page) : 1,
    limit: typeof params.limit === 'string' ? Number.parseInt(params.limit) : 12,
  }

  // Construire la requête avec les filtres
  const where: any = {
    isActive: true,
    isSold: false,
  }

  if (filters.category) {
    // First find the category by slug
    const category = await prisma.category.findFirst({
      where: { slug: filters.category },
      select: { id: true }
    })
    
    if (category) {
      where.categoryId = category.id
    }
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
      (product) => product.distance !== undefined && product.distance <= filters.distance!,
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
