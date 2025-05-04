import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/notifications - Récupérer les notifications de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const searchParams = request.nextUrl.searchParams

    // Paramètres de filtrage et pagination
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    // Construire la requête
    const where: any = { userId }

    if (unreadOnly) {
      where.isRead = false
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit

    // Récupérer les notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        relatedProduct: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        relatedTransaction: true,
      },
    })

    // Compter le nombre total de notifications pour la pagination
    const totalNotifications = await prisma.notification.count({ where })

    // Compter le nombre de notifications non lues
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })

    // Formater les notifications
    const formattedNotifications = notifications.map((notification) => ({
      ...notification,
      relatedProduct: notification.relatedProduct
        ? {
            ...notification.relatedProduct,
            primaryImage: notification.relatedProduct.images[0]?.imageUrl || null,
          }
        : null,
    }))

    return NextResponse.json({
      notifications: formattedNotifications,
      pagination: {
        total: totalNotifications,
        page,
        limit,
        pages: Math.ceil(totalNotifications / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

// PUT /api/notifications - Marquer toutes les notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Marquer toutes les notifications comme lues
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 })
  }
}
