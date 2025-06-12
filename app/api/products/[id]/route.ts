import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  endpoint: process.env.DIGITALOCEAN_SPACES_ENDPOINT,
  region: process.env.DIGITALOCEAN_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DIGITALOCEAN_SPACES_KEY!,
    secretAccessKey: process.env.DIGITALOCEAN_SPACES_SECRET!,
  },
})

// GET /api/products/[id] - Récupérer un produit par son ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const id = Number.parseInt(resolvedParams.id)
    const session = await getServerSession(authOptions)

    // Incrémenter le compteur de vues
    await prisma.product.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    })

    // Récupérer le produit avec ses détails
    const product = await prisma.product.findUnique({
      where: { id },
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
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Calculer la note moyenne du vendeur
    const sellerRating = await prisma.userReview.aggregate({
      where: { userId: product.seller.id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    // Vérifier si l'utilisateur a mis ce produit en favori
    let isFavorited = false
    if (session) {
      const userId = Number.parseInt(session.user.id)
      const favorite = await prisma.favoriteProduct.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: id,
          },
        },
      })
      isFavorited = !!favorite
    }

    // Formater la réponse
    const primaryImage = product.images.find((img) => img.isPrimary)
    const formattedProduct = {
      ...product,
      primaryImage: primaryImage ? primaryImage.imageUrl : product.images[0]?.imageUrl || null,
      favoritesCount: product._count.favorites,
      isFavorited,
      seller: {
        ...product.seller,
        rating: sellerRating._avg.rating || 0,
        reviewsCount: sellerRating._count.rating,
        productsCount: product.seller._count.products,
        successfulSales: product.seller._count.transactionsAsSeller,
      },
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const id = Number.parseInt(resolvedParams.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const data = await request.json()

    // Vérifier que l'utilisateur est le propriétaire du produit
    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.sellerId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to update this product" }, { status: 403 })
    }

    // Mettre à jour le produit
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        isActive: data.isActive,
        isSold: data.isSold,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const id = Number.parseInt(resolvedParams.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Vérifier que l'utilisateur est le propriétaire du produit et récupérer les images
    const productToDelete = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true, images: { select: { imageUrl: true } } },
    })

    if (!productToDelete) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (productToDelete.sellerId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to delete this product" }, { status: 403 })
    }

    // Supprimer les images de DigitalOcean Spaces
    const bucket = process.env.DIGITALOCEAN_SPACES_BUCKET!
    const endpoint = process.env.DIGITALOCEAN_SPACES_ENDPOINT!.replace(/^https?:\/\//, "")

    for (const image of productToDelete.images) {
      try {
        // Extraire la clé (le chemin du fichier) de l'URL
        const urlParts = image.imageUrl.split('/')
        const key = urlParts.slice(3).join('/') // Prend tout après le bucket et l'endpoint

        const command = new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
        await s3Client.send(command)
      } catch (s3Error) {
        console.error(`Failed to delete image ${image.imageUrl} from S3:`, s3Error)
        // Continuer la suppression même si une image échoue
      }
    }

    // Supprimer le produit de la base de données
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
