import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// PUT /api/products/[id]/images/[imageId] - Mettre à jour une image
export async function PUT(request: NextRequest, { params }: { params: { id: string; imageId: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const productId = Number.parseInt(resolvedParams.id)
    const imageId = Number.parseInt(resolvedParams.imageId)
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

    const data = await request.json()

    // Si l'image est définie comme principale, réinitialiser toutes les autres images
    if (data.isPrimary) {
      await prisma.productImage.updateMany({
        where: {
          productId,
          id: { not: imageId },
        },
        data: {
          isPrimary: false,
        },
      })
    }

    // Mettre à jour l'image
    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        isPrimary: data.isPrimary,
      },
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error("Error updating image:", error)
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 })
  }
}

// DELETE /api/products/[id]/images/[imageId] - Supprimer une image
export async function DELETE(request: NextRequest, { params }: { params: { id: string; imageId: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const productId = Number.parseInt(resolvedParams.id)
    const imageId = Number.parseInt(resolvedParams.imageId)
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
      return NextResponse.json({ error: "Not authorized to delete this image" }, { status: 403 })
    }

    // Vérifier si c'est la seule image du produit
    const imagesCount = await prisma.productImage.count({
      where: { productId },
    })

    if (imagesCount <= 1) {
      return NextResponse.json({ error: "Cannot delete the only image of a product" }, { status: 400 })
    }

    // Vérifier si c'est l'image principale
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    })

    // Supprimer l'image
    await prisma.productImage.delete({
      where: { id: imageId },
    })

    // Si c'était l'image principale, définir une autre image comme principale
    if (image?.isPrimary) {
      const firstImage = await prisma.productImage.findFirst({
        where: { productId },
      })

      if (firstImage) {
        await prisma.productImage.update({
          where: { id: firstImage.id },
          data: { isPrimary: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
