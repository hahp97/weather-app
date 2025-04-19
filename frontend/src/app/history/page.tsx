"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useWeather } from "@/context/WeatherContext";
import { formatDate } from "@/lib/utils";
import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define interfaces
interface BackendWeatherReport {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  avgTemperature: number;
  avgPressure: number;
  avgHumidity: number;
  avgCloudCover: number;
  dataPointsCount: number;
  createdAt: string;
}

interface WeatherReportsMeta {
  count: number;
}

interface QueryResult {
  weatherReports: BackendWeatherReport[];
  weatherReportsMeta: WeatherReportsMeta;
}

// GraphQL query
const GET_WEATHER_REPORTS_QUERY = gql`
  query GetWeatherReports(
    $first: Int
    $skip: Int
    $filter: WeatherReportFilter
    $orderBy: [WeatherReportOrder]
  ) {
    weatherReports(
      first: $first
      skip: $skip
      filter: $filter
      orderBy: $orderBy
    ) {
      id
      title
      startTime
      endTime
      avgTemperature
      avgPressure
      avgHumidity
      avgCloudCover
      dataPointsCount
      createdAt
    }
    weatherReportsMeta {
      count
    }
  }
`;

export default function HistoryPage() {
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const router = useRouter();
  const { setReports } = useWeather();

  // Query for weather reports
  const { data, loading, error } = useQuery<QueryResult>(
    GET_WEATHER_REPORTS_QUERY,
    {
      variables: {
        first: 100,
        orderBy: [`${sortField}_${sortDirection}`],
      },
      fetchPolicy: "network-only",
    }
  );

  useEffect(() => {
    // Update reports in context when data changes
    if (data?.weatherReports) {
      // Convert backend report format to context format
      const contextReports = data.weatherReports.map((report) => ({
        id: report.id,
        timestamp: report.createdAt,
        temperature: report.avgTemperature,
        pressure: report.avgPressure,
        humidity: report.avgHumidity,
        cloudCover: report.avgCloudCover,
      }));
      setReports(contextReports);
    }
  }, [data, setReports]);

  // Handle selection of reports for comparison
  const handleToggleSelect = (reportId: string) => {
    setSelectedReportIds((prev) => {
      if (prev.includes(reportId)) {
        return prev.filter((id) => id !== reportId);
      } else {
        // Only allow selecting up to 2 reports
        if (prev.length >= 2) {
          return [prev[1], reportId]; // Keep the second selected report and add the new one
        }
        return [...prev, reportId];
      }
    });
  };

  // Handle comparison of selected reports
  const handleCompare = () => {
    if (selectedReportIds.length !== 2) {
      return;
    }

    router.push(
      `/comparison?report1=${selectedReportIds[0]}&report2=${selectedReportIds[1]}`
    );
  };

  // Handle sort toggle
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortField(field);
      setSortDirection("ASC");
    }
  };

  // Get sort indicator for header
  const getSortIndicator = (field: string) => {
    if (field !== sortField) return null;
    return sortDirection === "ASC" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-5xl mx-auto flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-5xl mx-auto">
        <div className="text-red-500">
          Error loading weather reports: {error.message}
        </div>
      </div>
    );
  }

  const reports = data?.weatherReports || [];
  const totalReports = data?.weatherReportsMeta?.count || 0;

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">
        Weather Report History
      </h1>

      <div className="mb-8 text-center text-gray-500">
        Showing {reports.length} of {totalReports} total reports
      </div>

      {/* Action bar with compare button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-sm text-gray-500 mr-2">
            {selectedReportIds.length} of 2 reports selected
          </span>
        </div>
        <Button
          onClick={handleCompare}
          disabled={selectedReportIds.length !== 2}
        >
          Compare Selected Reports
        </Button>
      </div>

      {/* Table of reports */}
      <Card>
        <CardHeader className="bg-gray-50">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
            <div className="col-span-1"></div>
            <div
              className="col-span-3 flex items-center cursor-pointer"
              onClick={() => handleSort("title")}
            >
              Title {getSortIndicator("title")}
            </div>
            <div
              className="col-span-2 flex items-center cursor-pointer"
              onClick={() => handleSort("createdAt")}
            >
              Date {getSortIndicator("createdAt")}
            </div>
            <div className="col-span-1 text-center">Temp (°C)</div>
            <div className="col-span-1 text-center">Press (hPa)</div>
            <div className="col-span-1 text-center">Humid (%)</div>
            <div className="col-span-1 text-center">Cloud (%)</div>
            <div className="col-span-2 text-center">Data Points</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No weather reports found. Generate some reports first!
            </div>
          ) : (
            <div className="divide-y">
              {reports.map((report: BackendWeatherReport) => (
                <div
                  key={report.id}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50"
                >
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedReportIds.includes(report.id)}
                      onChange={() => handleToggleSelect(report.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-3 flex items-center font-medium">
                    {report.title}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-gray-600">
                    {formatDate(report.createdAt)}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {report.avgTemperature?.toFixed(1)}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {report.avgPressure?.toFixed(0)}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {report.avgHumidity?.toFixed(0)}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {report.avgCloudCover?.toFixed(0)}
                  </div>
                  <div className="col-span-2 flex items-center justify-center text-sm text-gray-600">
                    {report.dataPointsCount || 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
