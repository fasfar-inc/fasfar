import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductDetail from "./product-detail"
import ProductSkeleton from "./product-skeleton"

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

interface ProductDetailType {
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
  isFavorited?: boolean
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

// Fonction pour récupérer les données du produit côté serveur
async function getProduct(id: string) {
  const productId = Number.parseInt(id, 10)

  if (isNaN(productId)) {
    return null
  }

  try {
    // Incrémenter le compteur de vues
    await prisma.product.update({
      where: { id: productId },
      data: { viewsCount: { increment: 1 } },
    })

    // Récupérer le produit avec ses détails
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
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
            createdAt: true,
            _count: {
              select: {
                products: true,
                reviewsReceived: true,
                transactionsAsSeller: {
                  where: { status: "COMPLETED" },
                },
              },
            },
          },
        },
        images: true,
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    })

    if (!product) {
      return null
    }

    // Calculer la note moyenne du vendeur
    const sellerRating = await prisma.userReview.aggregate({
      where: { userId: product.seller.id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    // Formater la réponse
    const primaryImage = product.images.find((img) => img.isPrimary)

    return {
      ...product,
      id: String(product.id),
      sellerId: String(product.sellerId),
      title: product.title || "",
      description: product.description || "",
      location: product.location || "",
      category: product.category?.name || product.categoryId || "",
      latitude: product.latitude ?? undefined,
      longitude: product.longitude ?? undefined,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
      updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
      images: product.images.map(img => ({
        ...img,
        id: String(img.id),
        productId: String(img.productId),
        imageUrl: img.imageUrl,
        createdAt: img.createdAt instanceof Date ? img.createdAt.toISOString() : img.createdAt,
      })),
      primaryImage: primaryImage?.imageUrl || product.images[0]?.imageUrl || "/placeholder.svg",
      favoritesCount: product._count.favorites,
      seller: {
        ...product.seller,
        id: String(product.seller.id),
        firstName: product.seller.firstName || "",
        lastName: product.seller.lastName || "",
        city: product.seller.city || "",
        profileImage: product.seller.profileImage || "/placeholder.svg",
        createdAt: product.seller.createdAt instanceof Date ? product.seller.createdAt.toISOString() : product.seller.createdAt,
        rating: sellerRating._avg.rating || 0,
        reviewsCount: sellerRating._count.rating,
        productsCount: product.seller._count.products,
        successfulSales: product.seller._count.transactionsAsSeller,
      },
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductDetail product={product} />
    </Suspense>
  )
}
