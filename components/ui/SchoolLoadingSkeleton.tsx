interface SchoolLoadingSkeletonProps {
  showGrades?: boolean
}

export function SchoolLoadingSkeleton({ showGrades = false }: SchoolLoadingSkeletonProps) {
  return (
    <div className="bg-gradient-to-br from-slate-100 to-blue-50 h-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button Skeleton */}
        <div className="h-10 w-32 bg-gray-200 rounded-md mb-8 animate-pulse"></div>

        {/* Header Skeleton */}
        <div className="text-center mb-12">
          {/* Logo Skeleton */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
          
          {/* Title Skeleton */}
          <div className="h-12 bg-gray-200 rounded-md mb-4 max-w-md mx-auto animate-pulse"></div>
          
          {/* Subtitle Skeletons */}
          <div className="h-6 bg-gray-200 rounded-md mb-2 max-w-48 mx-auto animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded-md max-w-64 mx-auto animate-pulse"></div>
        </div>

        {/* Grade Selection Skeleton */}
        {showGrades && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex justify-center mb-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-9 bg-gray-200 rounded-md"></div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section Skeleton */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="h-6 bg-gray-200 rounded-md mb-4 max-w-48 mx-auto animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
