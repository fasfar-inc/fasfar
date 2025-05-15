import { Suspense } from "react"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProductEditForm from "./product-edit-form"
import { Loader2 } from "lucide-react"
import type { Product } from "./product-edit-form"

// Fonction pour récupérer les données du produit côté serveur
async function getProduct(id: string): Promise<Product | null> {
  const productId = Number.parseInt(id, 10)

  if (isNaN(productId)) {
    return null
  }

  try {
    // Récupérer le produit avec ses détails
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
      },
    })

    if (!product) {
      return null
    }

    // Transform the data structure to match the component's expectations
    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId || undefined,
      condition: product.condition,
      location: product.location || undefined,
      latitude: product.latitude || undefined,
      longitude: product.longitude || undefined,
      userId: product.sellerId.toString(),
      productImages: product.images.map(img => ({
        id: img.id.toString(),
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary
      }))
    }
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="container py-12 flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500 mx-auto mb-4" />
            <p>Loading product...</p>
          </div>
        </div>
      }
    >
      <ProductEditForm product={product} />
    </Suspense>
  )
}
