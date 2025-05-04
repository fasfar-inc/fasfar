import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// POST /api/products/[id]/images - Ajouter des images à un produit
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

    // Vérifier que l'utilisateur est le propriétaire du produit
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.sellerId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to update this product" }, { status: 403 })
    }

    const { images } = await request.json()

    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid images data" }, { status: 400 })
    }

    // Vérifier si les URLs des images sont valides (pas des URLs blob)
    for (const image of images) {
      if (image.imageUrl.startsWith("blob:")) {
        return NextResponse.json({ error: "Invalid image URL. Blob URLs are not supported." }, { status: 400 })
      }
    }

    // Ajouter les images au produit
    const createdImages = await Promise.all(
      images.map((image: { imageUrl: string; isPrimary: boolean }) =>
        prisma.productImage.create({
          data: {
            productId,
            imageUrl: image.imageUrl,
            isPrimary: image.isPrimary,
          },
        }),
      ),
    )

    return NextResponse.json(createdImages)
  } catch (error) {
    console.error("Error adding images:", error)
    return NextResponse.json({ error: "Failed to add images" }, { status: 500 })
  }
}
