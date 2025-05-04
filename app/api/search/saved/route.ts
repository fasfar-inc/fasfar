import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/search/saved - Récupérer les recherches sauvegardées de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)

    // Récupérer les recherches sauvegardées
    const savedSearches = await prisma.savedSearchUser.findMany({
      where: { userId },
      include: {
        search: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Formater les recherches
    const formattedSearches = savedSearches.map((item) => item.search)

    return NextResponse.json(formattedSearches)
  } catch (error) {
    console.error("Error fetching saved searches:", error)
    return NextResponse.json({ error: "Failed to fetch saved searches" }, { status: 500 })
  }
}

// POST /api/search/saved - Créer une nouvelle recherche sauvegardée
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const data = await request.json()

    // Validation des données
    if (!data.name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Créer la recherche
    const search = await prisma.savedSearch.create({
      data: {
        name: data.name,
        category: data.category,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        location: data.location,
        radius: data.radius,
        keywords: data.keywords,
        users: {
          create: {
            userId,
          },
        },
      },
    })

    return NextResponse.json(search)
  } catch (error) {
    console.error("Error creating saved search:", error)
    return NextResponse.json({ error: "Failed to create saved search" }, { status: 500 })
  }
}
