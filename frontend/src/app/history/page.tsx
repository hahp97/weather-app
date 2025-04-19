"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useWeather } from "@/context/WeatherContext";
import { formatDate } from "@/utils/common";
import { gql, useQuery } from "@apollo/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const router = useRouter();
  const { setReports } = useWeather();

  // Query for weather reports
  const { data, loading, error, refetch } = useQuery<QueryResult>(
    GET_WEATHER_REPORTS_QUERY,
    {
      variables: {
        first: pageSize,
        skip: (currentPage - 1) * pageSize,
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
        title: report.title,
        startTime: report.startTime,
        endTime: report.endTime,
        avgTemperature: report.avgTemperature,
        avgPressure: report.avgPressure,
        avgHumidity: report.avgHumidity,
        avgCloudCover: report.avgCloudCover,
        dataPointsCount: report.dataPointsCount,
        createdAt: report.createdAt,
        timestamp: report.createdAt,
        temperature: report.avgTemperature,
        pressure: report.avgPressure,
        humidity: report.avgHumidity,
        cloudCover: report.avgCloudCover,
      }));
      setReports(contextReports);
    }
  }, [data, setReports]);

  // Update query when pagination or sorting changes
  useEffect(() => {
    refetch({
      first: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy: [`${sortField}_${sortDirection}`],
    });
  }, [currentPage, pageSize, sortField, sortDirection, refetch]);

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
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Get sort indicator for header
  const getSortIndicator = (field: string) => {
    if (field !== sortField) return null;
    return sortDirection === "ASC" ? "↑" : "↓";
  };

  // Pagination controls
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const totalReports = data?.weatherReportsMeta?.count || 0;
  const totalPages = Math.ceil(totalReports / pageSize);

  if (loading && !data) {
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

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">
        Weather Report History
      </h1>

      <div className="mb-8 text-center text-gray-500">
        Showing {(currentPage - 1) * pageSize + 1} to{" "}
        {Math.min(currentPage * pageSize, totalReports)} of {totalReports} total
        reports
      </div>

      {/* Action bar with compare button and page size selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {selectedReportIds.length} of 2 reports selected
          </span>
          <div className="flex items-center">
            <label htmlFor="pageSize" className="text-sm text-gray-500 mr-2">
              Items per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate page numbers to show (max 5)
                let pageNum;
                if (totalPages <= 5) {
                  // Show all pages if 5 or fewer
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // At beginning, show first 5 pages
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // At end, show last 5 pages
                  pageNum = totalPages - 4 + i;
                } else {
                  // In middle, show current +/- 2 pages
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
