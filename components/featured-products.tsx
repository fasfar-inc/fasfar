"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"

interface Product {
  id: string
  title: string
  price: number
  location: string
  image: string
}

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  // Ajouter un style pour l'effet de badge
  if (typeof document !== "undefined") {
    const style = document.createElement("style")
    style.innerHTML = `
    .featured-product {
      position: relative;
    }
    .badge-pop {
      transition: transform 0.2s ease;
    }
    .scale-100 {
      transform: scale(1);
    }
  `
    document.head.appendChild(style)
  }

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Produits en vedette</h2>
            <p className="text-gray-500">Découvrez nos produits les plus populaires près de chez vous.</p>
          </div>
          <Link href="/marketplace">
            <Button variant="link" className="gap-1 text-rose-500">
              Voir tous les produits
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md featured-product"
              onMouseEnter={(e) => {
                // Effet de surprise: faire apparaître un badge "Populaire"
                const badge = document.createElement("div")
                badge.className =
                  "absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-medium transform scale-0 badge-pop"
                badge.textContent = "Populaire"
                e.currentTarget.appendChild(badge)

                setTimeout(() => {
                  badge.classList.add("scale-100")
                }, 10)
              }}
              onMouseLeave={(e) => {
                // Supprimer le badge au survol
                const badge = e.currentTarget.querySelector(".badge-pop")
                if (badge) {
                  badge.classList.remove("scale-100")
                  setTimeout(() => {
                    badge.remove()
                  }, 200)
                }
              }}
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{product.title}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold">{product.price}€</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{product.location}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}