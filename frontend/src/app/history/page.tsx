"use client";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { WeatherCard } from "@/components/ui/WeatherCard";
import { useToast } from "@/context/ToastContext";
import { useWeather } from "@/context/WeatherContext";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useEffect } from "react";

// GraphQL queries
const GET_WEATHER_REPORTS = gql`
  query GetWeatherReports {
    weatherReports {
      id
      timestamp
      temperature
      pressure
      humidity
      cloudCover
    }
  }
`;

export default function HistoryPage() {
  const { reports, setReports, selectedReports } = useWeather();
  const { showInfoToast, showErrorToast } = useToast();

  const { loading, error, data } = useQuery(GET_WEATHER_REPORTS, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.weatherReports) {
      setReports(data.weatherReports);
      if (data.weatherReports.length > 0) {
        showInfoToast(`Loaded ${data.weatherReports.length} weather reports`);
      }
    }
  }, [data, setReports, showInfoToast]);

  if (loading) return <LoadingSpinner />;

  if (error) {
    showErrorToast("Error loading weather reports");
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">Error loading weather reports</p>
        <p className="text-gray-600">{error.message}</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">No weather reports found</p>
        <Link
          href="/generate"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate a report
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Weather Report History
        </h2>
        {selectedReports.length > 0 && (
          <Link
            href="/compare"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Compare Selected ({selectedReports.length})
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const isSelected = selectedReports.some((r) => r.id === report.id);
          return (
            <WeatherCard
              key={report.id}
              report={report}
              showSelectButton={true}
              isSelected={isSelected}
            />
          );
        })}
      </div>
    </div>
  );
}
