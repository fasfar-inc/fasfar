import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { Footer } from "@/components/footer"
import CategoryCard from "./category-card"

// Fonction pour récupérer toutes les catégories avec leurs sous-catégories
async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
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

    return categories.map((category) => ({
      ...category,
      productCount: category._count.products,
      _count: undefined,
    }))
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        <Link href="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Catégories</h1>
          <p className="text-gray-500 mt-2">Parcourez toutes nos catégories pour trouver ce que vous cherchez</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
