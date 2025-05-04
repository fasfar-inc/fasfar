import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Récupérer toutes les conversations où l'utilisateur est impliqué
    // Utiliser les noms de tables et de colonnes du schéma Prisma
    const conversations = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: {
        createdAt: "desc",
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
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    // Regrouper les messages par conversation (partenaire + produit)
    const conversationMap = new Map()

    for (const message of conversations) {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId
      const partner = message.senderId === userId ? message.receiver : message.sender
      const key = `${partnerId}-${message.productId || "general"}`

      if (!conversationMap.has(key) || new Date(message.createdAt) > new Date(conversationMap.get(key).createdAt)) {
        conversationMap.set(key, {
          id: message.id,
          content: message.content,
          createdAt: message.createdAt,
          isReceived: message.receiverId === userId,
          status: message.status || "SENT",
          partner: {
            id: partner.id,
            username: partner.username,
            profileImage: partner.profileImage,
            isVerified: partner.isVerified,
          },
          product: message.product
            ? {
                id: message.product.id,
                title: message.product.title,
                price: message.product.price,
                primaryImage: message.product.images[0]?.imageUrl || null,
              }
            : null,
          unreadCount: 0, // Nous allons calculer cela ci-dessous
        })
      }
    }

    // Calculer le nombre de messages non lus pour chaque conversation
    const unreadCounts = await prisma.message.groupBy({
      by: ["senderId"],
      where: {
        receiverId: userId,
        status: { not: "READ" },
      },
      _count: {
        id: true,
      },
    })

    // Mettre à jour les compteurs de messages non lus
    for (const count of unreadCounts) {
      const partnerId = count.senderId
      for (const [key, conversation] of conversationMap.entries()) {
        if (key.startsWith(`${partnerId}-`)) {
          conversation.unreadCount = count._count.id
        }
      }
    }

    // Convertir la Map en tableau
    const formattedConversations = Array.from(conversationMap.values())

    return NextResponse.json(formattedConversations)
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { receiverId, content, productId } = await request.json()

    if (!receiverId || !content) {
      return NextResponse.json({ error: "Destinataire et contenu requis" }, { status: 400 })
    }

    const senderId = Number.parseInt(session.user.id)

    // Vérifier que l'utilisateur n'essaie pas de s'envoyer un message à lui-même
    if (senderId === Number.parseInt(receiverId)) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même" }, { status: 400 })
    }

    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: Number.parseInt(receiverId) },
    })

    if (!receiver) {
      return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 })
    }

    // Vérifier que le produit existe si un productId est fourni
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: Number.parseInt(productId) },
      })

      if (!product) {
        return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
      }
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId: Number.parseInt(receiverId),
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
