import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { NearbyProducts } from "./nearby-products"
import { calculateDistance } from "@/lib/utils"

export async function NearbyProductsServer() {
  // Récupérer les coordonnées de l'utilisateur depuis les cookies
  const cookieStore = cookies()
  const userLatCookie = cookieStore.get("user-latitude")
  const userLngCookie = cookieStore.get("user-longitude")

  // Si les coordonnées ne sont pas disponibles, retourner des produits vides
  if (!userLatCookie || !userLngCookie) {
    return <NearbyProducts initialProducts={[]} />
  }

  const userLat = Number.parseFloat(userLatCookie.value)
  const userLng = Number.parseFloat(userLngCookie.value)

  // Récupérer les produits les plus proches
  const nearbyProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      isSold: false,
      latitude: { not: null },
      longitude: { not: null },
    },
    include: {
      images: {
        where: {
          isPrimary: true,
        },
        take: 1,
      },
    },
    take: 3,
  })

  // Calculer la distance et trier les produits
  const productsWithDistance = nearbyProducts
    .map((product) => {
      if (!product.latitude || !product.longitude) return null

      const distance = calculateDistance(userLat, userLng, product.latitude, product.longitude)

      return {
        id: product.id,
        title: product.title,
        price: product.price,
        location: product.location || "Non spécifié",
        distance,
        image: product.images[0]?.imageUrl || "/diverse-products-still-life.png",
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)

  return <NearbyProducts initialProducts={productsWithDistance} />
}
