import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateDistance } from "@/lib/utils"
import type { ProductCategory, ProductCondition } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    // Extraire les paramètres de la requête
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") as ProductCategory | null
    const condition = searchParams.get("condition") as ProductCondition | null
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
    const search = searchParams.get("search") || undefined
    const sortBy = searchParams.get("sortBy") || "date_desc"
    const latitude = searchParams.get("latitude") ? Number(searchParams.get("latitude")) : undefined
    const longitude = searchParams.get("longitude") ? Number(searchParams.get("longitude")) : undefined
    const distance = searchParams.get("distance") ? Number(searchParams.get("distance")) : undefined

    // Construire la requête avec les filtres
    const where: any = {
      isActive: true,
      isSold: false,
    }

    if (category) {
      where.category = category
    }

    if (condition) {
      where.condition = condition
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = minPrice
      if (maxPrice) where.price.lte = maxPrice
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Déterminer l'ordre de tri
    let orderBy: any = {}
    switch (sortBy) {
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
      include: {
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        images: true,
      },
    })

    // Formater les produits pour inclure l'image principale et calculer la distance
    const formattedProducts = products.map((product) => {
      const primaryImage = product.images.find((img) => img.isPrimary)

      // Calculer la distance si les coordonnées sont fournies
      let distance = null
      if (latitude && longitude && product.latitude && product.longitude) {
        distance = calculateDistance(latitude, longitude, product.latitude, product.longitude)
      }

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        location: product.location || "Emplacement non spécifié",
        category: product.category,
        primaryImage: primaryImage ? primaryImage.imageUrl : product.images[0]?.imageUrl || null,
        latitude: product.latitude,
        longitude: product.longitude,
        coordinates: [product.latitude || 0, product.longitude || 0],
        distance,
        seller: {
          id: product.seller.id,
          username: product.seller.username,
          profileImage: product.seller.profileImage,
        },
        createdAt: product.createdAt.toISOString(),
      }
    })

    // Si le tri est par distance, trier les produits après avoir calculé les distances
    let sortedProducts = [...formattedProducts]
    if (sortBy === "distance" && latitude && longitude) {
      sortedProducts.sort((a, b) => {
        if (!a.distance) return 1
        if (!b.distance) return -1
        return a.distance - b.distance
      })
    }

    // Filtrer par distance si nécessaire
    if (distance && latitude && longitude) {
      sortedProducts = sortedProducts.filter((product) => product.distance !== null && product.distance <= distance)
    }

    return NextResponse.json(sortedProducts)
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des produits" }, { status: 500 })
  }
}
