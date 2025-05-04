import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest, { params }: { params: { partnerId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const partnerId = Number.parseInt(params.partnerId)

    // Récupérer l'ID du produit s'il est spécifié dans la requête
    const url = new URL(request.url)
    const productId = url.searchParams.get("productId")

    // Construire la requête de base
    const whereClause: any = {
      OR: [
        { AND: [{ senderId: userId }, { receiverId: partnerId }] },
        { AND: [{ senderId: partnerId }, { receiverId: userId }] },
      ],
    }

    // Ajouter le filtre par produit si spécifié
    if (productId) {
      whereClause.productId = Number.parseInt(productId)
    }

    // Récupérer les messages entre les deux utilisateurs
    const messages = await prisma.message.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
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
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    // Marquer les messages non lus comme lus
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        status: { not: "READ" },
      },
      data: {
        status: "READ",
      },
    })

    // Formater les messages pour l'affichage
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      receiverId: message.receiverId,
      status: message.status,
      sender: message.sender,
      product: message.product
        ? {
            ...message.product,
            primaryImage: message.product.images[0]?.imageUrl || null,
          }
        : null,
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { partnerId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { content, productId } = await request.json()
    const senderId = Number.parseInt(session.user.id)
    const receiverId = Number.parseInt(params.partnerId)

    if (!content) {
      return NextResponse.json({ error: "Contenu requis" }, { status: 400 })
    }

    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    })

    if (!receiver) {
      return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 })
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        productId: productId ? Number.parseInt(productId) : undefined,
        status: "SENT",
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
