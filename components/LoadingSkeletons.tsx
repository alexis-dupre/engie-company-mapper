/**
 * Loading Skeleton Components - Modern Airbnb-inspired design
 */

// Company Card Skeleton for list view
export function CompanyCardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md animate-pulse">
      {/* Top colored bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-gray-200 to-gray-300" />

      {/* Header */}
      <div className="mb-4">
        <div className="h-6 bg-gray-200 rounded-lg w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded-lg w-1/3"></div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          <div className="h-4 bg-gray-100 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          <div className="h-4 bg-gray-100 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          <div className="h-4 bg-gray-100 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
          <div className="h-4 bg-gray-100 rounded w-20"></div>
        </div>
      </div>

      {/* Tags section */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}

// Dashboard Metric Card Skeleton
export function MetricCardSkeleton() {
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md overflow-hidden animate-pulse">
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
      </div>

      {/* Value */}
      <div className="h-10 bg-gray-200 rounded-lg w-24 mb-2"></div>

      {/* Label */}
      <div className="h-4 bg-gray-100 rounded-lg w-32"></div>

      {/* Decorative corner */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gray-100 rounded-full"></div>
    </div>
  );
}

// Tree View Item Skeleton
export function TreeItemSkeleton({ depth = 0 }: { depth?: number }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl bg-white/50 animate-pulse"
      style={{ marginLeft: `${depth * 24}px` }}
    >
      {/* Expand icon */}
      <div className="w-5 h-5 bg-gray-200 rounded"></div>

      {/* Folder icon */}
      <div className="w-6 h-6 bg-gray-200 rounded-lg"></div>

      {/* Company name */}
      <div className="h-4 bg-gray-200 rounded-lg flex-1 max-w-xs"></div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="h-4 bg-gray-100 rounded w-16"></div>
        <div className="h-4 bg-gray-100 rounded w-16"></div>
      </div>
    </div>
  );
}

// Dashboard Section Skeleton (full section with multiple metrics)
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-8 shadow-md">
        <div className="h-6 bg-gray-200 rounded-lg w-48 mb-6"></div>

        {/* Bar chart skeleton */}
        <div className="space-y-4">
          {[80, 65, 50, 40, 30].map((width, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="h-4 bg-gray-100 rounded w-24"></div>
              <div className="flex-1 bg-gray-100 rounded-full h-3" style={{ width: `${width}%` }}></div>
              <div className="h-4 bg-gray-100 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-200 p-6 rounded-2xl h-40"></div>
        <div className="bg-gray-200 p-6 rounded-2xl h-40"></div>
        <div className="bg-gray-200 p-6 rounded-2xl h-40"></div>
      </div>
    </div>
  );
}

// List View Skeleton (multiple company cards)
export function CompanyListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CompanyCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Tree View Skeleton (hierarchical items)
export function CompanyTreeSkeleton() {
  return (
    <div className="space-y-2">
      <TreeItemSkeleton depth={0} />
      <TreeItemSkeleton depth={1} />
      <TreeItemSkeleton depth={1} />
      <TreeItemSkeleton depth={2} />
      <TreeItemSkeleton depth={2} />
      <TreeItemSkeleton depth={1} />
      <TreeItemSkeleton depth={0} />
      <TreeItemSkeleton depth={1} />
      <TreeItemSkeleton depth={2} />
      <TreeItemSkeleton depth={3} />
    </div>
  );
}
