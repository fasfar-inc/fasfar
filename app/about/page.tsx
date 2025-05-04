import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle, ShoppingBag, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container py-6 flex-1">
        <Link href="/" className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="relative h-64 md:h-80 lg:h-96 w-full">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="À propos de Fasfar"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="container p-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white">À propos de Fasfar</h1>
              </div>
            </div>
          </div>

          <div className="container p-6 md:p-8 lg:p-10">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-rose max-w-none">
                <h2>Notre mission</h2>
                <p>
                  Fasfar est née d'une idée simple : créer une plateforme qui connecte directement les acheteurs et les
                  vendeurs locaux, sans intermédiaire. Notre mission est de faciliter les échanges entre particuliers en
                  offrant une expérience utilisateur intuitive, sécurisée et centrée sur la proximité.
                </p>

                <h2>Qui sommes-nous ?</h2>
                <p>
                  Fondée en 2023, Fasfar est une startup française qui révolutionne le commerce entre particuliers.
                  Notre équipe est composée de passionnés de technologie et d'économie collaborative qui croient en un
                  modèle de consommation plus responsable et plus humain.
                </p>

                <div className="my-8 flex flex-col md:flex-row gap-6 md:gap-10 items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Notre vision</h3>
                    <p className="text-gray-600">
                      Nous imaginons un monde où les objets circulent facilement d'une personne à l'autre, où la
                      proximité géographique favorise les rencontres et les échanges, et où la technologie est au
                      service de l'humain et de l'environnement.
                    </p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Nos valeurs</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-rose-500" />
                        <span>Simplicité et transparence</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-rose-500" />
                        <span>Proximité et lien social</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-rose-500" />
                        <span>Économie circulaire et durabilité</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-rose-500" />
                        <span>Innovation et amélioration continue</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <Separator className="my-8" />

                <h2>Pourquoi choisir Fasfar ?</h2>

                <div className="grid md:grid-cols-3 gap-6 my-6">
                  <div className="bg-rose-50 p-4 rounded-lg">
                    <div className="rounded-full bg-rose-100 w-12 h-12 flex items-center justify-center mb-4">
                      <ShoppingBag className="h-6 w-6 text-rose-500" />
                    </div>
                    <h3 className="font-bold mb-2">Simplicité</h3>
                    <p className="text-sm text-gray-600">
                      Une interface intuitive qui rend l'achat et la vente entre particuliers simple et agréable.
                    </p>
                  </div>

                  <div className="bg-rose-50 p-4 rounded-lg">
                    <div className="rounded-full bg-rose-100 w-12 h-12 flex items-center justify-center mb-4">
                      <Users className="h-6 w-6 text-rose-500" />
                    </div>
                    <h3 className="font-bold mb-2">Proximité</h3>
                    <p className="text-sm text-gray-600">
                      Trouvez des vendeurs et des acheteurs près de chez vous pour faciliter les échanges.
                    </p>
                  </div>

                  <div className="bg-rose-50 p-4 rounded-lg">
                    <div className="rounded-full bg-rose-100 w-12 h-12 flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-rose-500"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        <path d="m7 11 2 2 6-6" />
                      </svg>
                    </div>
                    <h3 className="font-bold mb-2">Confiance</h3>
                    <p className="text-sm text-gray-600">
                      Un système de notation et de vérification pour des transactions en toute sécurité.
                    </p>
                  </div>
                </div>

                <h2>Notre équipe</h2>
                <p>
                  Derrière Fasfar, il y a une équipe passionnée et déterminée à créer la meilleure expérience possible
                  pour nos utilisateurs. Nous sommes des experts en développement web, en design d'interface, en
                  marketing digital et en service client.
                </p>

                <div className="mt-8 text-center">
                  <h3 className="text-xl font-bold mb-4">Rejoignez l'aventure Fasfar</h3>
                  <p className="mb-6">
                    Vous souhaitez faire partie de notre équipe ou en savoir plus sur nos opportunités de carrière ?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact">
                      <Button className="bg-rose-500 hover:bg-rose-600">Contactez-nous</Button>
                    </Link>
                    <Link href="/careers">
                      <Button variant="outline">Nos offres d'emploi</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
