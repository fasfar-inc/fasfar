export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-gray-200"></div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg bg-gray-200 animate-pulse"></div>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="h-20 w-20 shrink-0 rounded-md bg-gray-200 animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="h-4 w-20 mb-2 rounded bg-gray-200 animate-pulse"></div>
              <div className="h-8 w-3/4 mb-2 rounded bg-gray-200 animate-pulse"></div>
              <div className="h-8 w-1/3 mb-2 rounded bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-full mt-2 rounded bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-px w-full bg-gray-200"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="h-5 w-32 mb-1 rounded bg-gray-200 animate-pulse"></div>
                  <div className="h-4 w-40 rounded bg-gray-200 animate-pulse"></div>
                </div>
              </div>
              <div className="h-10 w-28 rounded bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Ajouter un style pour l'animation de chargement
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.innerHTML = `
    @keyframes shimmer {
      0% {
        opacity: 0.5;
      }
      50% {
        opacity: 0.8;
      }
      100% {
        opacity: 0.5;
      }
    }
  `
  document.head.appendChild(style)
}
