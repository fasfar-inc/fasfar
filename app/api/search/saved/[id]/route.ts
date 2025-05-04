import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/search/saved/[id] - Récupérer une recherche sauvegardée par son ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Vérifier que la recherche appartient à l'utilisateur
    const savedSearch = await prisma.savedSearchUser.findFirst({
      where: {
        searchId: id,
        userId,
      },
      include: {
        search: true,
      },
    })

    if (!savedSearch) {
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 })
    }

    return NextResponse.json(savedSearch.search)
  } catch (error) {
    console.error("Error fetching saved search:", error)
    return NextResponse.json({ error: "Failed to fetch saved search" }, { status: 500 })
  }
}

// PUT /api/search/saved/[id] - Mettre à jour une recherche sauvegardée
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const data = await request.json()

    // Vérifier que la recherche appartient à l'utilisateur
    const savedSearch = await prisma.savedSearchUser.findFirst({
      where: {
        searchId: id,
        userId,
      },
    })

    if (!savedSearch) {
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 })
    }

    // Mettre à jour la recherche
    const updatedSearch = await prisma.savedSearch.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        location: data.location,
        radius: data.radius,
        keywords: data.keywords,
        lastExecutedAt: new Date(),
      },
    })

    return NextResponse.json(updatedSearch)
  } catch (error) {
    console.error("Error updating saved search:", error)
    return NextResponse.json({ error: "Failed to update saved search" }, { status: 500 })
  }
}

// DELETE /api/search/saved/[id] - Supprimer une recherche sauvegardée
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Vérifier que la recherche appartient à l'utilisateur
    const savedSearch = await prisma.savedSearchUser.findFirst({
      where: {
        searchId: id,
        userId,
      },
    })

    if (!savedSearch) {
      return NextResponse.json({ error: "Saved search not found" }, { status: 404 })
    }

    // Supprimer l'association entre l'utilisateur et la recherche
    await prisma.savedSearchUser.delete({
      where: {
        searchId_userId: {
          searchId: id,
          userId,
        },
      },
    })

    // Vérifier si d'autres utilisateurs utilisent cette recherche
    const otherUsers = await prisma.savedSearchUser.findFirst({
      where: { searchId: id },
    })

    // Si personne d'autre n'utilise cette recherche, la supprimer
    if (!otherUsers) {
      await prisma.savedSearch.delete({
        where: { id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting saved search:", error)
    return NextResponse.json({ error: "Failed to delete saved search" }, { status: 500 })
  }
}
