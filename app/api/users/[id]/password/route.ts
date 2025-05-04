import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hash, compare } from "bcrypt"
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

// PUT /api/users/[id]/password - Changer le mot de passe
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const isOwnProfile = Number.parseInt(session.user.id) === id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwnProfile && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to change this user's password" }, { status: 403 })
    }

    const data = await request.json()

    // Validation des données
    if (!data.oldPassword || !data.newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Vérifier l'ancien mot de passe
    const isPasswordValid = await compare(data.oldPassword, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid old password" }, { status: 400 })
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await hash(data.newPassword, 10)

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 })
  }
}
