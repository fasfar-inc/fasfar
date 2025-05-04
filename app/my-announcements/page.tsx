import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function MyAnnouncementsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/login")
  }

  const products = await prisma.product.findMany({
    where: {
      sellerId: parseInt(session.user.id),
    },
    include: {
      images: {
        select: {
          id: true,
          imageUrl: true,
          isPrimary: true,
        },
      },
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mes annonces</h1>
        <Link href="/create-product">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Vous n'avez pas encore d'annonces</h2>
          <p className="text-gray-500 mb-6">Commencez à vendre vos articles en créant votre première annonce.</p>
          <Link href="/create-product">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Créer une annonce
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
} 