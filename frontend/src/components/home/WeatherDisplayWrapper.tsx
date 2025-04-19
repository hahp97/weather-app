"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import dynamic from "next/dynamic";

const WeatherDisplay = dynamic(
  () => import("@/components/weather/WeatherDisplay"),
  {
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <LoadingSpinner size="md" />
      </div>
    ),
    ssr: false,
  }
);

export function WeatherDisplayWrapper() {
  return (
    <div className="px-4 py-4 sm:px-0">
      <WeatherDisplay />
    </div>
  );
}
