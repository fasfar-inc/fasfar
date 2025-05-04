import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/messages - Récupérer les conversations de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Récupérer les derniers messages de chaque conversation
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (conversation_partner)
        m.id,
        m.content,
        m.created_at as "createdAt",
        m.status,
        CASE 
          WHEN m.sender_id = ${userId} THEN m.receiver_id
          ELSE m.sender_id
        END as conversation_partner,
        CASE 
          WHEN m.sender_id = ${userId} THEN false
          ELSE true
        END as is_received,
        m.product_id as "productId"
      FROM messages m
      WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
      ORDER BY conversation_partner, m.created_at DESC
    `

    // Récupérer les informations des utilisateurs et des produits
    const conversationsWithDetails = await Promise.all(
      (conversations as any[]).map(async (conv) => {
        const partner = await prisma.user.findUnique({
          where: { id: conv.conversation_partner },
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        })

        let product = null
        if (conv.productId) {
          product = await prisma.product.findUnique({
            where: { id: conv.productId },
            select: {
              id: true,
              title: true,
              price: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          })
        }

        // Compter les messages non lus
        const unreadCount = await prisma.message.count({
          where: {
            senderId: conv.conversation_partner,
            receiverId: userId,
            status: { not: "READ" },
          },
        })

        return {
          id: conv.id,
          content: conv.content,
          createdAt: conv.createdAt,
          status: conv.status,
          isReceived: conv.is_received,
          partner,
          product: product
            ? {
                ...product,
                primaryImage: product.images[0]?.imageUrl || null,
              }
            : null,
          unreadCount,
        }
      }),
    )

    return NextResponse.json(conversationsWithDetails)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

// POST /api/messages - Envoyer un nouveau message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const senderId = Number.parseInt(session.user.id)
    const data = await request.json()

    // Validation des données
    if (!data.receiverId || !data.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Vérifier que le destinataire existe
    const receiver = await prisma.user.findUnique({
      where: { id: data.receiverId },
    })

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Vérifier que le produit existe si spécifié
    if (data.productId) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      })

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId: data.receiverId,
        productId: data.productId,
        content: data.content,
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

    // Formater la réponse
    const formattedMessage = {
      ...message,
      product: message.product
        ? {
            ...message.product,
            primaryImage: message.product.images[0]?.imageUrl || null,
          }
        : null,
    }

    // Créer une notification pour le destinataire
    await prisma.notification.create({
      data: {
        userId: data.receiverId,
        title: "Nouveau message",
        message: `Vous avez reçu un nouveau message de ${session.user.name}`,
        type: "INFO",
        relatedProductId: data.productId,
      },
    })

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
