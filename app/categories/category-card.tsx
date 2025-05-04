"use client"

import Link from "next/link"
import React from "react"
import { Button } from "@/components/ui/button"
import { ICON_MAP, getIconColor } from "@/lib/icons"

interface Subcategory {
  id: string
  name: string
  slug: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  productCount: number
  subcategories: Subcategory[]
}

export default function CategoryCard({ category }: { category: Category }) {
  const iconDef = category.icon ? ICON_MAP[category.icon.toLowerCase()] : null
  const colorClass = category.color || getIconColor(category.icon || '')

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className={`rounded-full p-3 ${colorClass}`}>
            {iconDef?.icon && React.createElement(iconDef.icon, { className: "h-6 w-6" })}
          </div>
          <span className="text-sm text-gray-500">{category.productCount} annonces</span>
        </div>
        <h2 className="text-xl font-bold mt-4">{category.name}</h2>
        <p className="text-gray-500 text-sm mt-1">
          {category.description || `Explorez tous les produits ${category.name.toLowerCase()}`}
        </p>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Sous-catégories populaires</h3>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.slice(0, 4).map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/marketplace?category=${category.slug}&subcategory=${subcategory.slug}`}
                className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
              >
                {subcategory.name}
              </Link>
            ))}
            {category.subcategories.length > 4 && (
              <span className="text-xs text-gray-500 flex items-center">
                +{category.subcategories.length - 4} autres
              </span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link href={`/marketplace?category=${category.slug}`}>
            <Button variant="outline" className="w-full">
              Voir tous les {category.name.toLowerCase()}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
