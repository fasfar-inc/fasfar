import { prisma } from "@/lib/prisma"
import { NotificationType } from "@prisma/client"

export async function createNotification({
  title,
  description,
  type,
  userId,
}: {
  title: string
  description: string
  type: NotificationType
  userId: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        description,
        type,
        userId,
      },
    })

    return notification
  } catch (error) {
    console.error("[CREATE_NOTIFICATION]", error)
    throw error
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    })

    return notification
  } catch (error) {
    console.error("[MARK_NOTIFICATION_AS_READ]", error)
    throw error
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return notifications
  } catch (error) {
    console.error("[GET_UNREAD_NOTIFICATIONS]", error)
    throw error
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    })
  } catch (error) {
    console.error("[MARK_ALL_NOTIFICATIONS_AS_READ]", error)
    throw error
  }
} 