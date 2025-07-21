export function GradePageLoadingSkeleton() {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Back Button Skeleton */}
        <div className="h-10 w-32 bg-gray-200 rounded-md mb-8 animate-pulse"></div>
        
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 bg-gray-200 rounded-md mb-2 max-w-md animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded-md max-w-48 animate-pulse"></div>
        </div>

        {/* Search Form Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded-md mb-4 max-w-32 animate-pulse"></div>
          <div className="flex gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Instructions Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-6 bg-gray-200 rounded-md mb-4 max-w-48 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
