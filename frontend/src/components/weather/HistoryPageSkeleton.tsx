import { CardSkeleton } from "@/components/ui/skeleton";

export function HistoryPageSkeleton() {
  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-12 flex items-center justify-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
}
