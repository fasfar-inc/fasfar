import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import type { ProductFilterInput } from "@/lib/types"
import { ProductCondition } from "@prisma/client"

// GET /api/products - Récupérer tous les produits avec filtres
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Extraire les paramètres de filtrage
    const filters: ProductFilterInput = {
      category: (searchParams.get("category") as any) || undefined,
      minPrice: searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice") as string) : undefined,
      maxPrice: searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice") as string) : undefined,
      condition: (searchParams.get("condition") as any) || undefined,
      location: searchParams.get("location") || undefined,
      distance: searchParams.get("distance") ? Number.parseFloat(searchParams.get("distance") as string) : undefined,
      latitude: searchParams.get("latitude") ? Number.parseFloat(searchParams.get("latitude") as string) : undefined,
      longitude: searchParams.get("longitude") ? Number.parseFloat(searchParams.get("longitude") as string) : undefined,
      sellerId: searchParams.get("sellerId") ? Number.parseInt(searchParams.get("sellerId") as string) : undefined,
      search: searchParams.get("search") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "date_desc",
      page: searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1,
      limit: searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10,
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

    if (filters.sellerId) {
      where.sellerId = filters.sellerId
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    // Calcul de la pagination
    const skip = ((filters.page || 1) - 1) * (filters.limit || 10)

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
      take: filters.limit || 10,
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

    // Compter le nombre total de produits pour la pagination
    const totalProducts = await prisma.product.count({ where })

    // Formater les produits pour inclure l'image principale
    const formattedProducts = products.map((product) => {
      const primaryImage = product.images.find((img) => img.isPrimary)
      return {
        ...product,
        primaryImage: primaryImage ? primaryImage.imageUrl : product.images[0]?.imageUrl || null,
        favoritesCount: product._count.favorites,
        // Calculer la distance si les coordonnées sont fournies
        ...(filters.latitude && filters.longitude && product.latitude && product.longitude
          ? {
              distance: calculateDistance(filters.latitude, filters.longitude, product.latitude, product.longitude),
            }
          : {}),
      }
    })

    // Si le tri est par distance, trier les produits après avoir calculé les distances
    if (filters.sortBy === "distance" && filters.latitude && filters.longitude) {
      formattedProducts.sort((a, b) => {
        if (!a.distance) return 1
        if (!b.distance) return -1
        return a.distance - b.distance
      })
    }

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total: totalProducts,
        page: filters.page || 1,
        limit: filters.limit || 10,
        pages: Math.ceil(totalProducts / (filters.limit || 10)),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

// POST /api/products - Créer un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // S'assurer que l'ID utilisateur est un nombre
    let userId: number
    try {
      userId = Number.parseInt(session.user.id as string, 10)
      if (isNaN(userId)) {
        throw new Error("Invalid user ID")
      }
    } catch (error) {
      console.error("Erreur de conversion d'ID utilisateur:", error)
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    // Récupérer et valider les données
    let data
    try {
      data = await request.json()
    } catch (error) {
      console.error("Erreur de parsing JSON:", error)
      return NextResponse.json({ error: "Invalid JSON data" }, { status: 400 })
    }

    // Validation des données requises
    if (!data.title || data.title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!data.price || isNaN(Number.parseFloat(data.price)) || Number.parseFloat(data.price) <= 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 })
    }

    // Vérifier que la catégorie existe
    if (!data.categoryId) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    try {
      // Créer le produit de base
      const product = await prisma.product.create({
        data: {
          title: data.title,
          description: data.description || "",
          price: Number.parseFloat(data.price.toString()),
          categoryId: data.categoryId,
          condition: data.condition as ProductCondition,
          location: data.location || "",
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          sellerId: userId,
        },
      })


      // Traiter les images si elles existent
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        try {
          // Préparer les données d'images
          const imageData = data.images
            .map((image: { imageUrl: string; isPrimary?: boolean }, index: number) => {
              if (!image.imageUrl || image.imageUrl.startsWith("blob:")) {
                console.warn(`Image sans URL valide à l'index ${index}`)
                return null
              }
              return {
                productId: product.id,
                imageUrl: image.imageUrl,
                isPrimary: image.isPrimary === true,
              }
            })
            .filter(Boolean) // Filtrer les entrées nulles

          if (imageData.length > 0) {
            // S'assurer qu'il y a au moins une image principale
            const hasPrimary = imageData.some((img: { isPrimary?: boolean }) => img.isPrimary)
            if (!hasPrimary && imageData.length > 0) {
              imageData[0].isPrimary = true
            }

            await prisma.productImage.createMany({
              data: imageData,
            })
          }
        } catch (imageError) {
          console.error("Erreur lors de la création des images:", imageError)
          // Ne pas échouer complètement si les images échouent
        }
      }

      // Récupérer le produit complet avec ses relations
      const createdProduct = await prisma.product.findUnique({
        where: { id: product.id },
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
            },
          },
          images: true,
        },
      })

      return NextResponse.json(createdProduct)
    } catch (dbError: any) {
      console.error("Erreur de base de données:", dbError)
      return NextResponse.json(
        {
          error: "Database error",
          details: dbError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Erreur générale:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // Arrondir à 2 décimales
}
