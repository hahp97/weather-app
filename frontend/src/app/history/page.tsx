"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import { useWeather } from "@/context/WeatherContext";
import GetWeatherReportsQuery from "@/graphql/query/weather/get-reports.gql";
import { cn, formatDate, formatDateTime } from "@/utils/common";
import { useQuery } from "@apollo/client";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const { user } = useUser();
  const { setReports } = useWeather();
  const toast = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<string>("createdAt_DESC");

  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  const {
    loading: reportsLoading,
    error: reportsError,
    data: reportsData,
  } = useQuery(GetWeatherReportsQuery, {
    variables: {
      first: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy: [sortOrder],
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (reportsData?.weatherReports) {
      setReports(reportsData.weatherReports);
    }
  }, [reportsData, setReports]);

  const toggleSortOrder = () => {
    const newOrder =
      sortOrder === "createdAt_DESC" ? "createdAt_ASC" : "createdAt_DESC";
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      (reportsData?.weatherReportsMeta &&
        page > Math.ceil(reportsData.weatherReportsMeta.count / pageSize))
    )
      return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleToggleSelect = (reportId: string) => {
    setSelectedReportIds((prev) => {
      if (prev.includes(reportId)) {
        return prev.filter((id) => id !== reportId);
      } else {
        if (prev.length >= 2) {
          return [prev[1], reportId];
        }
        return [...prev, reportId];
      }
    });
  };

  const totalReports = reportsData?.weatherReportsMeta?.count || 0;
  const totalPages = Math.ceil(totalReports / pageSize);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weather Report History</h1>
        <div className="flex items-center space-x-2">
          <Link href="/generate">
            <Button size="sm" variant="outline">
              View Data and Generate
            </Button>
          </Link>
          <Link
            href={
              selectedReportIds.length === 2
                ? `/comparison?report1=${selectedReportIds[0]}&report2=${selectedReportIds[1]}`
                : "#"
            }
            onClick={(e) => {
              if (selectedReportIds.length !== 2) {
                e.preventDefault();
                toast.error("Please select exactly 2 reports to compare");
              }
            }}
          >
            <Button
              size="sm"
              variant={selectedReportIds.length === 2 ? "default" : "outline"}
              disabled={selectedReportIds.length !== 2}
            >
              Compare Selected
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span>Saved Weather Reports</span>
              <span className="text-sm font-normal text-gray-500">
                ({selectedReportIds.length} of 2 reports selected)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <Button variant="outline" size="sm" onClick={toggleSortOrder}>
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "createdAt_DESC"
                  ? "Newest First"
                  : "Oldest First"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : reportsError ? (
            <div className="text-red-500 py-4">
              Error loading reports: {reportsError.message}
            </div>
          ) : reportsData?.weatherReports?.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left w-10"></th>
                      <th className="border p-2 text-left">Title</th>
                      <th className="border p-2 text-left">Date Range</th>
                      <th className="border p-2 text-left">Temperature (°C)</th>
                      <th className="border p-2 text-left">Data Points</th>
                      <th className="border p-2 text-left">Created</th>
                      <th className="border p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsData.weatherReports.map((report: WeatherReport) => (
                      <tr
                        key={report.id}
                        className={cn(
                          "hover:bg-gray-50",
                          selectedReportIds.includes(report.id) &&
                            "bg-blue-50 hover:bg-blue-50"
                        )}
                      >
                        <td className="border p-2 text-center">
                          <input
                            type="checkbox"
                            checked={selectedReportIds.includes(report.id)}
                            onChange={() => handleToggleSelect(report.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="border p-2 font-medium">
                          {report.title}
                        </td>
                        <td className="border p-2">
                          {formatDate(new Date(report.startTime))}
                          {new Date(report.startTime).toDateString() !==
                          new Date(report.endTime).toDateString()
                            ? ` - ${formatDate(new Date(report.endTime))}`
                            : ""}
                        </td>
                        <td className="border p-2">
                          {report.avgTemperature.toFixed(1)}
                        </td>
                        <td className="border p-2">{report.dataPointsCount}</td>
                        <td className="border p-2">
                          {formatDateTime(new Date(report.createdAt))}
                        </td>
                        <td className="border p-2">
                          <div className="flex items-center space-x-2">
                            <Link href={`/report/${report.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500 text-center">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, totalReports)} of{" "}
                {totalReports} saved reports
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">
              {user ? (
                <div>
                  <p>You don&apos;t have any saved reports yet.</p>
                  <Link
                    href="/generate"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Generate your first report
                  </Link>
                </div>
              ) : (
                <div>
                  <p>Please log in to view your saved reports.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
