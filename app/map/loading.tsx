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
  
          <div className="mb-4">
            <div className="h-8 w-64 animate-pulse rounded-md bg-gray-200 mb-2"></div>
            <div className="h-5 w-96 animate-pulse rounded-md bg-gray-200"></div>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden h-[600px] animate-pulse bg-gray-200"></div>
            </div>
  
            <div className="space-y-4">
              <div className="h-7 w-48 animate-pulse rounded-md bg-gray-200"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex gap-3 p-3 rounded-lg border bg-gray-100 animate-pulse">
                    <div className="w-20 h-20 shrink-0 rounded-md bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
                        <div className="h-3 w-1/6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  