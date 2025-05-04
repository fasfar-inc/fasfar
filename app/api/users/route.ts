import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { hash } from "bcrypt"

// GET /api/users - Récupérer tous les utilisateurs (admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") ? Number.parseInt(searchParams.get("page") as string) : 1
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 10
    const search = searchParams.get("search") || undefined

    // Construire la requête avec les filtres
    const where: any = {}
    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ]
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit

    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        isActive: true,
        isVerified: true,
        city: true,
        _count: {
          select: {
            products: true,
            reviewsReceived: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    // Compter le nombre total d'utilisateurs pour la pagination
    const totalUsers = await prisma.user.count({ where })

    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST /api/users - Créer un nouvel utilisateur (inscription)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Validation des données
    if (!data.username || !data.email || !data.password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Vérifier si l'email ou le nom d'utilisateur existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 400 })
    }

    // Hacher le mot de passe
    const hashedPassword = await hash(data.password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        bio: data.bio,
        role: "USER", // Par défaut, tous les nouveaux utilisateurs sont des utilisateurs normaux
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        isActive: true,
        isVerified: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
