import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/users/[id] - Récupérer un utilisateur par son ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    // Vérifier si l'utilisateur est autorisé à voir ce profil
    const isOwnProfile = session && Number.parseInt(session.user.id) === id
    const isAdmin = session && session.user.role === "ADMIN"

    // Récupérer l'utilisateur avec ses détails
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: (isOwnProfile || isAdmin) ?? false, // Email visible uniquement par le propriétaire ou l'admin
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        city: true,
        createdAt: true,
        isVerified: true,
        // Champs sensibles visibles uniquement par le propriétaire ou l'admin
        phone: (isOwnProfile || isAdmin) ?? false,
        address: (isOwnProfile || isAdmin) ?? false,
        postalCode: (isOwnProfile || isAdmin) ?? false,
        role: (isOwnProfile || isAdmin) ?? undefined,
        isActive: (isOwnProfile || isAdmin) ?? undefined,
        lastLogin: (isOwnProfile || isAdmin) ?? undefined,
        _count: {
          select: {
            products: true,
            reviewsReceived: true,
            transactionsAsSeller: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculer la note moyenne de l'utilisateur
    const userRating = await prisma.userReview.aggregate({
      where: { userId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    // Formater la réponse
    const formattedUser = {
      ...user,
      rating: userRating._avg.rating || 0,
      reviewsCount: userRating._count.rating,
      productsCount: user._count.products,
      successfulSales: user._count.transactionsAsSeller,
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Mettre à jour un utilisateur
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const isOwnProfile = Number.parseInt(session.user.id) === id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to update this user" }, { status: 403 })
    }

    const data = await request.json()

    // Vérifier si l'email ou le nom d'utilisateur existe déjà
    if (data.email || data.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [data.email ? { email: data.email } : {}, data.username ? { username: data.username } : {}],
          NOT: { id },
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Email or username already exists" }, { status: 400 })
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        profileImage: data.profileImage,
        bio: data.bio,
        // Seul l'admin peut modifier ces champs
        ...(isAdmin
          ? {
              role: data.role,
              isActive: data.isActive,
              isVerified: data.isVerified,
            }
          : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        city: true,
        phone: true,
        address: true,
        postalCode: true,
        role: true,
        createdAt: true,
        isActive: true,
        isVerified: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur (admin uniquement)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
