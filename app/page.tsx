import { Header } from "@/components/header"
import { HowItWorks } from "@/components/how-it-works"
import { CategoryShowcase } from "@/components/category-showcase"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeaturedProductsServer } from "@/components/featured-products-server"
import { NearbyProductsServer } from "@/components/nearby-products-server"
import { Suspense } from "react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Achetez et vendez directement entre particuliers
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Fasfar connecte les vendeurs et acheteurs locaux. Trouvez ce que vous cherchez près de chez vous.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/marketplace">
                    <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
                      Explorer le marketplace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/map">
                    <Button size="lg" variant="outline">
                      <MapPin className="mr-2 h-4 w-4" />
                      Voir la carte
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Suspense fallback={<NearbyProductsSkeleton />}>
                  <NearbyProductsServer />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProductsServer />
        </Suspense>

        <CategoryShowcase />

        <HowItWorks />

        <section className="w-full py-12 md:py-24 lg:py-32 bg-rose-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Rejoignez la communauté Fasfar</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl">
                  Inscrivez-vous aujourd'hui et commencez à acheter et vendre dans votre région.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
                    Créer un compte
                  </Button>
                </Link>
                <Link href="/map">
                  <Button size="lg" variant="outline">
                    <MapPin className="mr-2 h-4 w-4" />
                    Explorer la carte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

// Composant de chargement pour les produits en vedette
function FeaturedProductsSkeleton() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="aspect-square bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}

// Composant de chargement pour les produits à proximité
function NearbyProductsSkeleton() {
  return (
    <div className="relative w-full max-w-[500px] overflow-hidden rounded-xl border bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="relative mb-6">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg">
                <div className="h-16 w-16 rounded-md bg-gray-200 animate-pulse"></div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
