import Link from "next/link"
import { ArrowLeft, Building2, Car, Home, Laptop, Shirt, Smartphone, Tv, Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

const categories = [
  {
    id: "real-estate",
    name: "Immobilier",
    description: "Appartements, maisons, terrains, locations, ventes",
    icon: Building2,
    color: "bg-blue-100 text-blue-700",
    subcategories: ["Appartements", "Maisons", "Terrains", "Locations", "Bureaux", "Commerces"],
    count: 1245,
  },
  {
    id: "vehicles",
    name: "Véhicules",
    description: "Voitures, motos, vélos, pièces détachées",
    icon: Car,
    color: "bg-green-100 text-green-700",
    subcategories: ["Voitures", "Motos", "Vélos", "Pièces détachées", "Caravanes", "Bateaux"],
    count: 3567,
  },
  {
    id: "phones",
    name: "Téléphones",
    description: "Smartphones, accessoires, pièces détachées",
    icon: Smartphone,
    color: "bg-rose-100 text-rose-700",
    subcategories: ["Smartphones", "Accessoires", "Pièces détachées", "Téléphones fixes"],
    count: 2189,
  },
  {
    id: "digital-devices",
    name: "Appareils numériques",
    description: "Ordinateurs, tablettes, consoles, accessoires",
    icon: Laptop,
    color: "bg-purple-100 text-purple-700",
    subcategories: ["Ordinateurs", "Tablettes", "Consoles", "Accessoires", "Appareils photo"],
    count: 1876,
  },
  {
    id: "home-kitchen",
    name: "Maison et Cuisine",
    description: "Meubles, électroménager, décoration, vaisselle",
    icon: Home,
    color: "bg-amber-100 text-amber-700",
    subcategories: ["Meubles", "Électroménager", "Décoration", "Vaisselle", "Literie"],
    count: 2543,
  },
  {
    id: "fashion",
    name: "Mode",
    description: "Vêtements, chaussures, accessoires, bijoux",
    icon: Shirt,
    color: "bg-pink-100 text-pink-700",
    subcategories: ["Vêtements", "Chaussures", "Accessoires", "Bijoux", "Montres", "Sacs"],
    count: 4321,
  },
  {
    id: "electronics",
    name: "Électronique",
    description: "TV, audio, vidéo, accessoires",
    icon: Tv,
    color: "bg-indigo-100 text-indigo-700",
    subcategories: ["TV", "Audio", "Vidéo", "Accessoires", "Câbles", "Enceintes"],
    count: 1654,
  },
  {
    id: "sports",
    name: "Sports & Loisirs",
    description: "Équipements sportifs, jeux, instruments de musique",
    icon: Dumbbell,
    color: "bg-cyan-100 text-cyan-700",
    subcategories: ["Équipements sportifs", "Jeux", "Instruments de musique", "Livres", "Films"],
    count: 1987,
  },
]

export default function CategoriesPage() {
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
            <div key={category.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`rounded-full p-3 ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm text-gray-500">{category.count} annonces</span>
                </div>
                <h2 className="text-xl font-bold mt-4">{category.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{category.description}</p>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Sous-catégories populaires</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.slice(0, 4).map((subcategory, index) => (
                      <Link
                        key={index}
                        href={`/marketplace?category=${category.id}&subcategory=${subcategory.toLowerCase()}`}
                        className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1 transition-colors"
                      >
                        {subcategory}
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
                  <Link href={`/marketplace?category=${category.id}`}>
                    <Button variant="outline" className="w-full">
                      Voir tous les {category.name.toLowerCase()}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}