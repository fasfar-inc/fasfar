import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Supprimer les données existantes
  await prisma.subcategory.deleteMany({})
  await prisma.category.deleteMany({})

  // Créer les catégories
  const categories = [
    {
      name: "Immobilier",
      slug: "immobilier",
      description: "Appartements, maisons, terrains, locations, ventes",
      icon: "building",
      color: "bg-blue-100 text-blue-700",
      subcategories: ["Appartements", "Maisons", "Terrains", "Locations", "Bureaux", "Commerces"],
    },
    {
      name: "Véhicules",
      slug: "vehicules",
      description: "Voitures, motos, vélos, pièces détachées",
      icon: "car",
      color: "bg-green-100 text-green-700",
      subcategories: ["Voitures", "Motos", "Vélos", "Pièces détachées", "Caravanes", "Bateaux"],
    },
    {
      name: "Téléphones",
      slug: "telephones",
      description: "Smartphones, accessoires, pièces détachées",
      icon: "smartphone",
      color: "bg-rose-100 text-rose-700",
      subcategories: ["Smartphones", "Accessoires", "Pièces détachées", "Téléphones fixes"],
    },
    {
      name: "Appareils numériques",
      slug: "appareils-numeriques",
      description: "Ordinateurs, tablettes, consoles, accessoires",
      icon: "laptop",
      color: "bg-purple-100 text-purple-700",
      subcategories: ["Ordinateurs", "Tablettes", "Consoles", "Accessoires", "Appareils photo"],
    },
    {
      name: "Maison et Cuisine",
      slug: "maison-cuisine",
      description: "Meubles, électroménager, décoration, vaisselle",
      icon: "home",
      color: "bg-amber-100 text-amber-700",
      subcategories: ["Meubles", "Électroménager", "Décoration", "Vaisselle", "Literie"],
    },
    {
      name: "Mode",
      slug: "mode",
      description: "Vêtements, chaussures, accessoires, bijoux",
      icon: "shirt",
      color: "bg-pink-100 text-pink-700",
      subcategories: ["Vêtements", "Chaussures", "Accessoires", "Bijoux", "Montres", "Sacs"],
    },
    {
      name: "Électronique",
      slug: "electronique",
      description: "TV, audio, vidéo, accessoires",
      icon: "tv",
      color: "bg-indigo-100 text-indigo-700",
      subcategories: ["TV", "Audio", "Vidéo", "Accessoires", "Câbles", "Enceintes"],
    },
    {
      name: "Sports & Loisirs",
      slug: "sports-loisirs",
      description: "Équipements sportifs, jeux, instruments de musique",
      icon: "dumbbell",
      color: "bg-cyan-100 text-cyan-700",
      subcategories: ["Équipements sportifs", "Jeux", "Instruments de musique", "Livres", "Films"],
    },
  ]

  for (const categoryData of categories) {
    const { subcategories, ...categoryInfo } = categoryData

    // Créer la catégorie
    const category = await prisma.category.create({
      data: {
        ...categoryInfo,
        order: categories.indexOf(categoryData),
      },
    })

    // Créer les sous-catégories
    for (const subcategoryName of subcategories) {
      await prisma.subcategory.create({
        data: {
          name: subcategoryName,
          slug: subcategoryName.toLowerCase().replace(/\s+/g, "-"),
          categoryId: category.id,
          order: subcategories.indexOf(subcategoryName),
        },
      })
    }
  }

  console.log("Seed data created successfully")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
