import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET /api/categories/[id] - Récupérer une catégorie par son ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id
    const searchParams = request.nextUrl.searchParams
    const includeSubcategories = searchParams.get("includeSubcategories") === "true"
    const includeProducts = searchParams.get("includeProducts") === "true"

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: includeSubcategories
          ? {
              orderBy: { order: "asc" },
              where: { isActive: true },
            }
          : false,
        products: includeProducts
          ? {
              where: {
                isActive: true,
                isSold: false,
              },
              include: {
                images: true,
                seller: {
                  select: {
                    id: true,
                    username: true,
                    profileImage: true,
                    city: true,
                  },
                },
              },
              take: 10,
              orderBy: { createdAt: "desc" },
            }
          : false,
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

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Formater la catégorie pour inclure le nombre de produits
    const formattedCategory = {
      ...category,
      productCount: category._count.products,
      _count: undefined,
    }

    return NextResponse.json(formattedCategory)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

// PUT /api/categories/[id] - Mettre à jour une catégorie
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const data = await request.json()

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Vérifier si le nom ou le slug est déjà utilisé par une autre catégorie
    if (data.name || data.slug) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          OR: [data.name ? { name: data.name } : {}, data.slug ? { slug: data.slug } : {}],
          NOT: { id },
        },
      })

      if (duplicateCategory) {
        return NextResponse.json({ error: "Category with this name or slug already exists" }, { status: 400 })
      }
    }

    // Mettre à jour la catégorie
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        color: data.color,
        order: data.order,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE /api/categories/[id] - Supprimer une catégorie
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Attendre que params soit résolu avant d'accéder à ses propriétés
    const resolvedParams = await Promise.resolve(params)
    const id = resolvedParams.id
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Vérifier si la catégorie a des produits associés
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products", productCount: existingCategory._count.products },
        { status: 400 },
      )
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
