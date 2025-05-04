"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getDynamicIcon } from "@/lib/icons"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  productCount: number
}

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/categories")
        const data = await response.json()
        console.log("Categories API response:", data)
        if (Array.isArray(data)) {
          setCategories(data.slice(0, 5))
        } else if (Array.isArray(data.products)) {
          setCategories(data.products.slice(0, 5))
        } else {
          setCategories([])
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Ajouter un style pour les animations
  if (typeof document !== "undefined") {
    const style = document.createElement("style")
    style.innerHTML = `
    @keyframes fadeInCategory {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes rotateIcon {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .rotate-icon {
      animation: rotateIcon 0.5s ease;
    }
  `
    document.head.appendChild(style)
  }

  if (isLoading) {
    return (
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Chargement des catégories...</h2>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-12 md:py-24 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Parcourez par catégorie</h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl">
              Trouvez exactement ce que vous cherchez parmi nos catégories populaires.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => {
            const IconComponent = category.icon ? getDynamicIcon(category.icon) : null
            const colorClass = category.color || "bg-gray-100 text-gray-700"

            return (
              <Link
                key={category.id}
                href={`/marketplace?category=${category.slug}`}
                className="flex flex-col items-center rounded-xl border bg-white p-6 text-center shadow-sm transition-all hover:shadow-md category-card"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: "fadeInCategory 0.5s ease forwards",
                  opacity: 0,
                  transform: "translateY(10px)",
                }}
                onMouseEnter={(e) => {
                  // Effet de surprise: faire tourner l'icône
                  const icon = e.currentTarget.querySelector(".category-icon")
                  if (icon) {
                    icon.classList.add("rotate-icon")
                  }
                }}
                onMouseLeave={(e) => {
                  // Arrêter la rotation
                  const icon = e.currentTarget.querySelector(".category-icon")
                  if (icon) {
                    icon.classList.remove("rotate-icon")
                  }
                }}
              >
                <div className={`rounded-full p-3 ${colorClass} category-icon`}>
                  {IconComponent && <IconComponent className="h-6 w-6" />}
                </div>
                <h3 className="mt-3 font-medium">{category.name}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {category.description || `Explorez tous les produits ${category.name.toLowerCase()}`}
                </p>
              </Link>
            )
          })}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/categories">
            <Button variant="outline">Voir toutes les catégories</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
