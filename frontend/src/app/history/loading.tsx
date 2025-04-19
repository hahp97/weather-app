import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Card className="border-0 shadow-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4 py-10">
              <LoadingSpinner size="lg" />
              <p className="text-lg font-medium text-gray-600">
                Loading weather reports...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
