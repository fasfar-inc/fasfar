import { Suspense } from "react"
import MarketplaceServer from "./marketplace-server"
import MarketplaceSkeleton from "./marketplace-skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function MarketplacePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <main>
      <Suspense fallback={<MarketplaceSkeleton />}>
        <MarketplaceServer searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
