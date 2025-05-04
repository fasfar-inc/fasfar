import { prisma } from "@/lib/prisma"
import { FeaturedProductsClient } from "./featured-products-client"

export async function FeaturedProductsServer() {
  // Récupérer les produits les plus récents avec leurs images
  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isSold: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
    include: {
      images: {
        where: {
          isPrimary: true,
        },
        take: 1,
      },
      seller: {
        select: {
          id: true,
          username: true,
          city: true,
        },
      },
      _count: {
        select: {
          favorites: true,
        },
      },
    },
  })

  // Formater les produits pour le composant client
  const formattedProducts = featuredProducts.map((product) => {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      location: product.location || product.seller?.city || "Non spécifié",
      distance: null, // On laisse le client calculer la distance
      image: product.images[0]?.imageUrl || "/diverse-products-still-life.png",
      favoritesCount: product._count.favorites,
      latitude: product.latitude,
      longitude: product.longitude,
    }
  })

  return <FeaturedProductsClient products={formattedProducts} />
}
