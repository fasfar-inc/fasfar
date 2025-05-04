import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/transactions - Récupérer les transactions de l'utilisateur
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
    const role = searchParams.get("role") || "all" // "buyer", "seller", "all"
    const status = searchParams.get("status") || undefined // "PENDING", "COMPLETED", "CANCELLED"

    // Construire la requête
    const where: any = {}

    if (role === "buyer") {
      where.buyerId = userId
    } else if (role === "seller") {
      where.sellerId = userId
    } else {
      where.OR = [{ buyerId: userId }, { sellerId: userId }]
    }

    if (status) {
      where.status = status
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit

    // Récupérer les transactions
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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

    // Compter le nombre total de transactions pour la pagination
    const totalTransactions = await prisma.transaction.count({ where })

    // Formater les transactions
    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      product: {
        ...transaction.product,
        primaryImage: transaction.product.images[0]?.imageUrl || null,
      },
    }))

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        total: totalTransactions,
        page,
        limit,
        pages: Math.ceil(totalTransactions / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

// POST /api/transactions - Créer une nouvelle transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const buyerId = Number.parseInt(session.user.id)
    const data = await request.json()

    // Validation des données
    if (!data.productId || !data.paymentMethod) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Vérifier que le produit existe et n'est pas déjà vendu
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.isSold) {
      return NextResponse.json({ error: "Product is already sold" }, { status: 400 })
    }

    // Vérifier que l'acheteur n'est pas le vendeur
    if (product.sellerId === buyerId) {
      return NextResponse.json({ error: "You cannot buy your own product" }, { status: 400 })
    }

    // Vérifier qu'il n'existe pas déjà une transaction pour ce produit
    const existingTransaction = await prisma.transaction.findUnique({
      where: { productId: data.productId },
    })

    if (existingTransaction) {
      return NextResponse.json({ error: "A transaction already exists for this product" }, { status: 400 })
    }

    // Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        productId: data.productId,
        buyerId,
        sellerId: product.sellerId,
        price: product.price,
        paymentMethod: data.paymentMethod,
        meetingLocation: data.meetingLocation,
        meetingTime: data.meetingTime ? new Date(data.meetingTime) : undefined,
        status: "PENDING",
      },
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

    // Marquer le produit comme vendu
    await prisma.product.update({
      where: { id: data.productId },
      data: { isSold: true },
    })

    // Créer des notifications pour l'acheteur et le vendeur
    await prisma.notification.createMany({
      data: [
        {
          userId: buyerId,
          title: "Transaction créée",
          message: `Vous avez initié une transaction pour ${product.title}`,
          type: "SUCCESS",
          relatedProductId: data.productId,
          relatedTransactionId: transaction.id,
        },
        {
          userId: product.sellerId,
          title: "Nouvelle transaction",
          message: `${session.user.name} souhaite acheter votre produit ${product.title}`,
          type: "INFO",
          relatedProductId: data.productId,
          relatedTransactionId: transaction.id,
        },
      ],
    })

    // Formater la transaction
    const formattedTransaction = {
      ...transaction,
      product: {
        ...transaction.product,
        primaryImage: transaction.product.images[0]?.imageUrl || null,
      },
    }

    return NextResponse.json(formattedTransaction)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
