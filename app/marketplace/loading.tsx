export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse rounded-md bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-[300px] animate-pulse rounded-md bg-gray-200"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="overflow-hidden rounded-lg border bg-white shadow-sm"
              style={{
                animationDelay: `${item * 0.1}s`,
                animation: "shimmer 1.5s infinite",
              }}
            >
              <div className="aspect-square animate-pulse bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200"></div>
                <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
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
