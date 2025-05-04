import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/transactions/[id] - Récupérer une transaction par son ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Récupérer la transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
            isVerified: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
            isVerified: true,
          },
        },
        reviews: {
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
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est impliqué dans la transaction
    if (transaction.buyerId !== userId && transaction.sellerId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to view this transaction" }, { status: 403 })
    }

    // Formater la transaction
    const primaryImage = transaction.product.images.find((img) => img.isPrimary)
    const formattedTransaction = {
      ...transaction,
      product: {
        ...transaction.product,
        primaryImage: primaryImage ? primaryImage.imageUrl : transaction.product.images[0]?.imageUrl || null,
      },
    }

    return NextResponse.json(formattedTransaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}

// PUT /api/transactions/[id] - Mettre à jour une transaction
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const data = await request.json()

    // Récupérer la transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        product: true,
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Vérifier que l'utilisateur est impliqué dans la transaction
    if (transaction.buyerId !== userId && transaction.sellerId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized to update this transaction" }, { status: 403 })
    }

    // Préparer les données à mettre à jour
    const updateData: any = {}

    // Seul le vendeur peut changer le statut en "COMPLETED"
    if (data.status === "COMPLETED" && (transaction.sellerId === userId || session.user.role === "ADMIN")) {
      updateData.status = "COMPLETED"
      updateData.completedAt = new Date()
    }

    // Seul l'acheteur peut changer le statut en "CANCELLED"
    if (data.status === "CANCELLED" && (transaction.buyerId === userId || session.user.role === "ADMIN")) {
      updateData.status = "CANCELLED"
      updateData.cancelledAt = new Date()

      // Si la transaction est annulée, remettre le produit en vente
      await prisma.product.update({
        where: { id: transaction.productId },
        data: { isSold: false },
      })
    }

    // Les deux parties peuvent mettre à jour ces champs
    if (data.meetingLocation) updateData.meetingLocation = data.meetingLocation
    if (data.meetingTime) updateData.meetingTime = new Date(data.meetingTime)
    if (data.paymentMethod) updateData.paymentMethod = data.paymentMethod

    // Mettre à jour la transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        buyer: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
        seller: {
          select: {
            id: true,
            username: true,
            profileImage: true,
            isVerified: true,
          },
        },
      },
    })

    // Créer des notifications pour informer l'autre partie
    const otherUserId = userId === transaction.buyerId ? transaction.sellerId : transaction.buyerId
    let notificationTitle = ""
    let notificationMessage = ""
    let notificationType: "INFO" | "SUCCESS" | "WARNING" | "ERROR" = "INFO"

    if (data.status === "COMPLETED") {
      notificationTitle = "Transaction terminée"
      notificationMessage = `La transaction pour ${transaction.product.title} a été marquée comme terminée`
      notificationType = "SUCCESS"
    } else if (data.status === "CANCELLED") {
      notificationTitle = "Transaction annulée"
      notificationMessage = `La transaction pour ${transaction.product.title} a été annulée`
      notificationType = "WARNING"
    } else {
      notificationTitle = "Transaction mise à jour"
      notificationMessage = `Les détails de la transaction pour ${transaction.product.title} ont été mis à jour`
    }

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        relatedProductId: transaction.productId,
        relatedTransactionId: id,
      },
    })

    // Formater la transaction
    const formattedTransaction = {
      ...updatedTransaction,
      product: {
        ...updatedTransaction.product,
        primaryImage: updatedTransaction.product.images[0]?.imageUrl || null,
      },
    }

    return NextResponse.json(formattedTransaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
  }
}
