"use client"

import { CheckCircle, Search, ShoppingBag, UserCircle } from "lucide-react"
import { useEffect } from "react"

export function HowItWorks() {
  useEffect(() => {
    // Ajouter un style pour les animations
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.innerHTML = `
        .step-card {
          position: relative;
          transition: transform 0.3s ease;
        }
        
        .step-card:hover {
          transform: translateY(-5px);
        }
        
        .step-icon {
          transition: background-color 0.3s ease;
        }
        
        .step-card:hover .step-icon {
          background-color: #ffe4e6;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Comment ça marche</h2>
            <p className="max-w-[600px] text-gray-500 md:text-xl">
              Fasfar rend l'achat et la vente entre particuliers simple et sécurisé.
            </p>
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: UserCircle,
              title: "1. Créez un compte",
              description: "Inscrivez-vous gratuitement et complétez votre profil en quelques minutes.",
            },
            {
              icon: ShoppingBag,
              title: "2. Publiez ou recherchez",
              description: "Mettez en vente vos articles ou parcourez les annonces près de chez vous.",
            },
            {
              icon: Search,
              title: "3. Contactez et négociez",
              description: "Discutez avec les vendeurs ou acheteurs et convenez d'un prix et d'un lieu de rencontre.",
            },
            {
              icon: CheckCircle,
              title: "4. Finalisez la transaction",
              description: "Rencontrez-vous en personne pour échanger l'article et le paiement en toute sécurité.",
            },
          ].map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center step-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700 step-icon">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}