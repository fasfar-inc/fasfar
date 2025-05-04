import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// POST /api/products/[id]/favorite - Ajouter/retirer un produit des favoris
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const productId = Number.parseInt(resolvedParams.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const { isFavorited } = await request.json()

    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Ajouter ou retirer des favoris
    if (isFavorited) {
      // Ajouter aux favoris s'il n'y est pas déjà
      await prisma.favoriteProduct.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {},
        create: {
          userId,
          productId,
        },
      })
    } else {
      // Retirer des favoris
      await prisma.favoriteProduct.deleteMany({
        where: {
          userId,
          productId,
        },
      })
    }

    return NextResponse.json({ success: true, isFavorited })
  } catch (error) {
    console.error("Error updating favorite status:", error)
    return NextResponse.json({ error: "Failed to update favorite status" }, { status: 500 })
  }
}
