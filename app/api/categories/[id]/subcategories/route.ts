import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/categories/[id]/subcategories - Récupérer toutes les sous-catégories d'une catégorie
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const categoryId = resolvedParams.id
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get("includeInactive") === "true"

    const where = {
      categoryId,
      ...(includeInactive ? {} : { isActive: true }),
    }

    const subcategories = await prisma.subcategory.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
                isSold: false,
              },
            },
          },
        },
      },
    })

    // Formater les sous-catégories pour inclure le nombre de produits
    const formattedSubcategories = subcategories.map((subcategory) => ({
      ...subcategory,
      productCount: subcategory._count.products,
      _count: undefined,
    }))

    return NextResponse.json(formattedSubcategories)
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return NextResponse.json({ error: "Failed to fetch subcategories" }, { status: 500 })
  }
}

// POST /api/categories/[id]/subcategories - Créer une nouvelle sous-catégorie
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const categoryId = resolvedParams.id
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const data = await request.json()

    // Validation des données
    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 })
    }

    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Vérifier si la sous-catégorie existe déjà dans cette catégorie
    const existingSubcategory = await prisma.subcategory.findFirst({
      where: {
        categoryId,
        slug: data.slug,
      },
    })

    if (existingSubcategory) {
      return NextResponse.json({ error: "Subcategory with this slug already exists in this category" }, { status: 400 })
    }

    // Créer la sous-catégorie
    const subcategory = await prisma.subcategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        categoryId,
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error("Error creating subcategory:", error)
    return NextResponse.json({ error: "Failed to create subcategory" }, { status: 500 })
  }
}
