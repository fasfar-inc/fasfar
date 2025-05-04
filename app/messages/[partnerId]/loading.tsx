export default function Loading() {
  return (
    <div className="container py-4 md:py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse mr-2"></div>
          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-16 w-16 rounded-md bg-gray-200 animate-pulse"></div>
            <div className="flex-1">
              <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mb-1"></div>
              <div className="h-5 w-40 bg-gray-200 animate-pulse rounded mb-1"></div>
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-end">
              <div className="bg-gray-200 animate-pulse rounded-lg p-3 max-w-[80%] h-16"></div>
            </div>
          ))}
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-start">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                <div className="bg-gray-200 animate-pulse rounded-lg p-3 max-w-[80%] h-12"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-12 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    </div>
  )
}
