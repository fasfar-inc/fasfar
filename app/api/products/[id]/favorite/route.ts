import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/products/[id]/favorite - Check if product is favorited
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const productId = Number.parseInt(resolvedParams.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ isFavorited: false }, { status: 200 })
    }

    const userId = Number.parseInt(session.user.id)
    const favorite = await prisma.favoriteProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return NextResponse.json({ isFavorited: !!favorite })
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return NextResponse.json({ error: "Failed to check favorite status" }, { status: 500 })
  }
}

// POST /api/products/[id]/favorite - Add to favorites
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const productId = Number.parseInt(resolvedParams.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Add to favorites
    await prisma.favoriteProduct.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {},
      create: {
        userId,
        productId,
      },
    })

    return NextResponse.json({ success: true, isFavorited: true })
  } catch (error) {
    console.error("Error adding favorite:", error)
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
  }
}

// DELETE /api/products/[id]/favorite - Remove from favorites
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const productId = Number.parseInt(resolvedParams.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Remove from favorites
    await prisma.favoriteProduct.deleteMany({
      where: {
        userId,
        productId,
      },
    })

    return NextResponse.json({ success: true, isFavorited: false })
  } catch (error) {
    console.error("Error removing favorite:", error)
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
  }
}
