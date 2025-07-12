import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProductCard from "@/components/product-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect(`/login?callbackUrl=/favorites`)
  }
  const userId = Number(session.user.id)
  const favorites = await prisma.favoriteProduct.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: true,
          seller: {
            include: {
              reviewsReceived: true,
            }
          },
        },
      },
    },
  })
  return (
    <div className="container py-8">
        <Link href="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Favorites</h1>
        </div>
      

      {favorites.length === 0 ? (
        <div className="text-gray-500 text-center py-16">You have no favorite products yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map(fav => {
            // Calculate seller rating if available
            let rating = null
            if (fav.product.seller && Array.isArray(fav.product.seller.reviewsReceived) && fav.product.seller.reviewsReceived.length > 0) {
              const sum = fav.product.seller.reviewsReceived.reduce((acc: number, r: { rating: number }) => acc + (r.rating || 0), 0)
              rating = sum / fav.product.seller.reviewsReceived.length
            }
            return (
              <ProductCard key={fav.product.id} product={{
                ...fav.product,
                favoritesCount: undefined,
                seller: {
                  rating: rating,
                },
              }} />
            )
          })}
        </div>
      )}
    </div>
  )
} 