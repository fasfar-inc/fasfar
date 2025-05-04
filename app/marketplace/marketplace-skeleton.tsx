import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function MarketplaceSkeleton() {
  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Skeleton className="h-8 w-40" />
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          <Skeleton className="h-10 w-full md:w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 md:hidden" />
            <Skeleton className="h-10 w-[180px] hidden md:block" />
            <Skeleton className="h-10 w-[100px] hidden md:block" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[200px] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  )
}
