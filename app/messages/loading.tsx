export default function Loading() {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>
        <div className="mb-6 relative">
          <div className="h-10 w-full bg-gray-200 animate-pulse rounded-md"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-24 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="h-4 w-10 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
