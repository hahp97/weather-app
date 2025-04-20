"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { AuthModal } from "@/components/modal/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherDataTable } from "@/components/weather/WeatherDataTable";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import { useWeather, WeatherReport } from "@/context/WeatherContext";
import GetWeatherReportsQuery from "@/graphql/query/weather/get-reports.gql";
import { UTCToLocalDate } from "@/utils/common";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const { user, loading: userLoading, initialized } = useUser();
  const { setReports } = useWeather();
  const toast = useToast();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortOrder, setSortOrder] = useState<string>("createdAt_DESC");
  const [sortField, setSortField] = useState<string>("createdAt");

  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  // Only show auth modal if initialization is complete and user is not logged in
  useEffect(() => {
    if (initialized && !user) {
      setShowAuthModal(true);
    }
  }, [user, initialized]);

  const {
    loading: reportsLoading,
    error: reportsError,
    data: reportsData,
  } = useQuery(GetWeatherReportsQuery, {
    variables: {
      first: pageSize,
      skip: (currentPage - 1) * pageSize,
      orderBy: [sortOrder],
      filter: {
        userId: user?.id,
      },
    },
    fetchPolicy: "network-only",
    skip: !user,
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

  const handleSortFieldChange = (field: string) => {
    // GraphQL query expects field_ORDER format
    const baseName = field === "timestamp" ? "createdAt" : field;
    setSortField(baseName);
    setSortOrder(`${baseName}_${sortOrder.endsWith("DESC") ? "DESC" : "ASC"}`);
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

  // Transform the reports data into the format expected by WeatherDataTable
  // and convert UTC timestamps to local time
  const mapReportsToDataPoints = (reports: WeatherReport[]) => {
    return reports.map((report) => {
      // Convert UTC timestamp to local time
      const localTimestamp = report.createdAt
        ? UTCToLocalDate(report.createdAt)
        : new Date();

      return {
        id: report.id,
        timestamp: localTimestamp.toISOString(), // Pass as ISO string
        temperature: report.avgTemperature,
        humidity: report.avgHumidity || 0,
        pressure: report.avgPressure || 0,
        weatherCondition: report.title || "",
        windSpeed: report.avgWindSpeed,
        selected: selectedReportIds.includes(report.id),
        cloudCover: report.cloudCover || 0,
      };
    });
  };

  const errorMessage = reportsError ? reportsError.message : null;

  // Handle click on a report row to view details
  const handleRowClick = (reportId: string) => {
    window.location.href = `/history/${reportId}`;
  };

  // Custom row action for the WeatherDataTable
  const onRowAction = (dataPoint: WeatherData) => {
    handleToggleSelect(dataPoint.id);
    return false; // Prevent default action
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        returnUrl="/history"
        featureName="History"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-2xl font-bold">Weather Report History</span>
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
                  variant={
                    selectedReportIds.length === 2 ? "default" : "outline"
                  }
                  disabled={selectedReportIds.length !== 2}
                >
                  Compare Selected
                </Button>
              </Link>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 bg-gray-100 p-4 rounded-md shadow-sm my-4">
            <span className="text-lg font-semibold text-gray-700">
              Saved Weather Reports
            </span>
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {selectedReportIds.length} of 2 reports selected
            </span>
          </div>
          {userLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : user ? (
            reportsData?.weatherReports &&
            reportsData.weatherReports.length > 0 ? (
              <WeatherDataTable
                isLoading={reportsLoading}
                errorMessage={errorMessage}
                historicalDataPoints={mapReportsToDataPoints(
                  reportsData.weatherReports
                )}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalReports}
                sortField={sortField}
                sortOrder={sortOrder.endsWith("DESC") ? "desc" : "asc"}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onSortFieldChange={handleSortFieldChange}
                onToggleSortOrder={toggleSortOrder}
                showSaveAction={false}
                title="Saved Weather Reports"
                onRowAction={onRowAction}
                onRowClick={handleRowClick}
              />
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p className="text-lg mb-2">
                  You don&apos;t have any saved reports yet.
                </p>
                <p className="mb-4">
                  Generate a weather report to see your historical data here.
                </p>
                <Link href="/generate" className="inline-block">
                  <Button variant="default">Generate Your First Report</Button>
                </Link>
              </div>
            )
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="text-lg mb-2">
                Please log in to view your saved reports.
              </p>
              <p className="mb-4">
                Login or create an account to save and manage your weather
                reports.
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="mt-4"
                variant="default"
              >
                Sign In or Register
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
