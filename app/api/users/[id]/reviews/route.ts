import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/users/[id]/reviews - Récupérer les avis d'un utilisateur
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const searchParams = request.nextUrl.searchParams

    // Paramètres de pagination
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10

    // Calcul de la pagination
    const skip = (page - 1) * limit

    // Récupérer les avis
    const reviews = await prisma.userReview.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
      },
    })

    // Compter le nombre total d'avis pour la pagination
    const totalReviews = await prisma.userReview.count({
      where: { userId: id },
    })

    // Calculer la note moyenne
    const averageRating = await prisma.userReview.aggregate({
      where: { userId: id },
      _avg: { rating: true },
    })

    return NextResponse.json({
      reviews,
      pagination: {
        total: totalReviews,
        page,
        limit,
        pages: Math.ceil(totalReviews / limit),
      },
      averageRating: averageRating._avg.rating || 0,
    })
  } catch (error) {
    console.error("Error fetching user reviews:", error)
    return NextResponse.json({ error: "Failed to fetch user reviews" }, { status: 500 })
  }
}

// POST /api/users/[id]/reviews - Ajouter un avis sur un utilisateur
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const reviewerId = Number.parseInt(session.user.id)

    // Vérifier que l'utilisateur ne s'évalue pas lui-même
    if (reviewerId === id) {
      return NextResponse.json({ error: "You cannot review yourself" }, { status: 400 })
    }

    const data = await request.json()

    // Validation des données
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Vérifier si une transaction existe entre les deux utilisateurs
    let transactionId = data.transactionId

    if (!transactionId) {
      // Rechercher une transaction entre les deux utilisateurs
      const transaction = await prisma.transaction.findFirst({
        where: {
          OR: [
            { buyerId: reviewerId, sellerId: id },
            { buyerId: id, sellerId: reviewerId },
          ],
          status: "COMPLETED",
        },
        orderBy: { completedAt: "desc" },
      })

      if (transaction) {
        transactionId = transaction.id
      }
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.userReview.findFirst({
      where: {
        userId: id,
        reviewerId,
        ...(transactionId ? { transactionId } : {}),
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this user" }, { status: 400 })
    }

    // Créer l'avis
    const review = await prisma.userReview.create({
      data: {
        userId: id,
        reviewerId,
        rating: data.rating,
        comment: data.comment,
        transactionId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
