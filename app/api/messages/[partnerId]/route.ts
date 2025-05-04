import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/messages/[partnerId] - Récupérer les messages avec un utilisateur spécifique
export async function GET(request: NextRequest, { params }: { params: { partnerId: string } }) {
  try {
    const partnerId = Number.parseInt(params.partnerId)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const searchParams = request.nextUrl.searchParams

    // Paramètres de pagination
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 20
    const productId = searchParams.get("productId")
      ? Number.parseInt(searchParams.get("productId") as string)
      : undefined

    // Calcul de la pagination
    const skip = (page - 1) * limit

    // Construire la requête
    const where: any = {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    }

    if (productId) {
      where.productId = productId
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    })

    // Compter le nombre total de messages pour la pagination
    const totalMessages = await prisma.message.count({ where })

    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        status: { not: "READ" },
      },
      data: {
        status: "READ",
        // Pas besoin de mettre à jour readAt car ce champ n'existe pas dans notre modèle
      },
    })

    // Formater les messages
    const formattedMessages = messages.map((message) => ({
      ...message,
      product: message.product
        ? {
            ...message.product,
            primaryImage: message.product.images[0]?.imageUrl || null,
          }
        : null,
    }))

    return NextResponse.json({
      messages: formattedMessages,
      pagination: {
        total: totalMessages,
        page,
        limit,
        pages: Math.ceil(totalMessages / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}