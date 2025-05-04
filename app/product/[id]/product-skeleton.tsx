import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function ProductSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="container py-6 flex-1">
        <Link
          href="/marketplace"
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full rounded-lg" />
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-10 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>

            <Separator />

            <div>
              <Skeleton className="h-12 w-full rounded-lg mb-4" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
