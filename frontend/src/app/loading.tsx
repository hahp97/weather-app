import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="py-10 container bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-xl font-medium text-gray-600">
            Loading weather data...
          </p>
        </div>
      </main>
    </div>
  );
}
