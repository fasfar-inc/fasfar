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
      seller: {
        select: {
          id: true,
          _count: {
            select: {
              reviewsReceived: true,
            },
          },
          reviewsReceived: {
            select: {
              rating: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const productsWithRating = products.map(product => ({
    ...product,
    seller: {
      rating: product.seller.reviewsReceived.length > 0
        ? product.seller.reviewsReceived.reduce((acc, review) => acc + review.rating, 0) / product.seller.reviewsReceived.length
        : null,
    },
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My announcements</h1>
        <Link href="/product/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New announcement
          </Button>
        </Link>
      </div>

      {productsWithRating.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">You don't have any announcements yet</h2>
          <p className="text-gray-500 mb-6">Start selling your items by creating your first announcement.</p>
          <Link href="/product/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create an announcement
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsWithRating.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                id: product.id,
                title: product.title,
                price: product.price,
                location: product.location,
                condition: product.condition,
                isSold: product.isSold,
                images: product.images,
                seller: product.seller,
              }} 
            />
          ))}
        </div>
      )}
    </div>
  )
} 