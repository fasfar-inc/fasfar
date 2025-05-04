import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/users/[id]/products - Récupérer les produits d'un utilisateur
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const searchParams = request.nextUrl.searchParams

    // Paramètres de filtrage et pagination
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10
    const includeInactive = searchParams.get("includeInactive") === "true"
    const includeSold = searchParams.get("includeSold") === "true"

    // Construire la requête
    const where: any = { sellerId: id }

    if (!includeInactive) {
      where.isActive = true
    }

    if (!includeSold) {
      where.isSold = false
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit

    // Récupérer les produits
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
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
      }
    })

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching user products:", error)
    return NextResponse.json({ error: "Failed to fetch user products" }, { status: 500 })
  }
}
