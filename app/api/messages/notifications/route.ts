import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get unread messages count
    const unreadMessages = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        status: "SENT"
      }
    })

    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      where: {
        receiverId: session.user.id,
        status: "SENT"
      },
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            primaryImage: true
          }
        }
      }
    })

    return NextResponse.json({
      unreadCount: unreadMessages,
      messages: recentMessages
    })
  } catch (error) {
    console.error("[MESSAGES_NOTIFICATIONS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { messageIds } = body

    if (!messageIds || !Array.isArray(messageIds)) {
      return new NextResponse("Invalid request", { status: 400 })
    }

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: session.user.id
      },
      data: {
        status: "READ"
      }
    })

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("[MESSAGES_NOTIFICATIONS_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 