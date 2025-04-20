import { CardSkeleton } from "@/components/ui/skeleton";

export function ComparisonPageSkeleton() {
  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse mx-auto mb-8"></div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="space-y-2 flex flex-col items-center">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
