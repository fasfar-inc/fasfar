import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// PUT /api/notifications/[id] - Marquer une notification comme lue
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to update this notification" }, { status: 403 })
    }

    // Marquer la notification comme lue
    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}

// DELETE /api/notifications/[id] - Supprimer une notification
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this notification" }, { status: 403 })
    }

    // Supprimer la notification
    await prisma.notification.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 })
  }
}
