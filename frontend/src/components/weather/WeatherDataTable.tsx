/* eslint-disable @typescript-eslint/no-explicit-any */
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from "@/hooks/useWeatherReducer";
import { UTCToLocalDate, formatDateTime } from "@/utils/common";
import {
  ArrowUpDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";

interface WeatherDataTableProps {
  isLoading: boolean;
  errorMessage: string | null;
  historicalDataPoints: WeatherData[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  sortField: string;
  sortOrder: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortFieldChange: (field: string) => void;
  onToggleSortOrder: () => void;
  onSaveDataPoint?: (dataPoint: WeatherData) => void;
  onRowAction?: (dataPoint: WeatherData) => boolean;
  onRowClick?: (id: string) => void;
  showSaveAction?: boolean;
  title?: string;
}

export function WeatherDataTable({
  isLoading,
  errorMessage,
  historicalDataPoints,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  sortField,
  sortOrder,
  onPageChange,
  onPageSizeChange,
  onSortFieldChange,
  onToggleSortOrder,
  onSaveDataPoint,
  onRowAction,
  onRowClick,
  showSaveAction = true,
  title = "Weather Data Points",
}: WeatherDataTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center flex-wrap gap-2">
          <span className="text-xl font-semibold">
            {title}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Collected every 5 minutes)
            </span>
          </span>
          <div className="flex items-center space-x-2">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border rounded px-2 py-1 text-sm bg-background"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <Button variant="outline" size="sm" onClick={onToggleSortOrder}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : errorMessage ? (
          <div className="text-destructive py-4 text-center font-medium">
            Error loading data: {errorMessage}
          </div>
        ) : historicalDataPoints.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th
                      className="border-b p-2 text-left cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onSortFieldChange("ts")}
                    >
                      <div className="flex items-center">
                        Time{" "}
                        {sortField === "ts" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="border-b p-2 text-left cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onSortFieldChange("temperature")}
                    >
                      <div className="flex items-center">
                        Temperature (°C){" "}
                        {sortField === "temperature" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="border-b p-2 text-left cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onSortFieldChange("humidity")}
                    >
                      <div className="flex items-center">
                        Humidity (%){" "}
                        {sortField === "humidity" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="border-b p-2 text-left cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => onSortFieldChange("pressure")}
                    >
                      <div className="flex items-center">
                        Pressure (hPa){" "}
                        {sortField === "pressure" && (
                          <span className="ml-1">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="border-b p-2 text-left">Wind Speed (m/s)</th>
                    <th className="border-b p-2 text-left">Description</th>
                    {(showSaveAction || onRowAction) && (
                      <th className="border-b p-2 text-left">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {historicalDataPoints.map((point, index) => {
                    // Ensure timestamps are properly converted to local time
                    const pointTime = UTCToLocalDate(new Date(point.timestamp));
                    return (
                      <tr
                        key={point.id || index}
                        className={`transition-colors ${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50 dark:bg-gray-800"
                        } hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                          (point as any).selected
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        } ${onRowClick ? "cursor-pointer" : ""}`}
                        onClick={(e) => {
                          // Prevent navigation if clicking on the checkbox or save button
                          if (
                            e.target instanceof HTMLElement &&
                            (e.target.tagName === "INPUT" ||
                              e.target.closest("button"))
                          ) {
                            return;
                          }

                          if (onRowClick && point.id) {
                            onRowClick(point.id);
                          }
                        }}
                      >
                        <td className="border-b p-2">
                          {formatDateTime(pointTime)}
                        </td>
                        <td className="border-b p-2">
                          {point.temperature.toFixed(1)}
                        </td>
                        <td className="border-b p-2">
                          {point.humidity.toFixed(0)}
                        </td>
                        <td className="border-b p-2">
                          {point.pressure.toFixed(0)}
                        </td>
                        <td className="border-b p-2">
                          {point.windSpeed?.toFixed(1) || "N/A"}
                        </td>
                        <td className="border-b p-2">
                          {point.weatherCondition || "N/A"}
                        </td>
                        {(showSaveAction || onRowAction) && (
                          <td className="border-b p-2 text-center">
                            {showSaveAction && onSaveDataPoint && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSaveDataPoint?.(point)}
                                title="Save this data point as a report"
                                className="hover:bg-primary/10 cursor-pointer mr-1"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            )}
                            {onRowAction && (
                              <input
                                type="checkbox"
                                checked={(point as any).selected || false}
                                onChange={() => onRowAction(point)}
                                title={
                                  (point as any).selected
                                    ? "Unselect"
                                    : "Select for comparison"
                                }
                                className="cursor-pointer h-4 w-4 accent-blue-600"
                              />
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage <= 1}
                    className="h-8 w-8"
                    title="First Page"
                  >
                    <ChevronFirst className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="h-8 w-8"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 py-1 bg-muted/30 rounded-md text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage >= totalPages}
                    className="h-8 w-8"
                    title="Last Page"
                  >
                    <ChevronLast className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground text-center">
              {totalItems > 0 ? (
                <>
                  Showing{" "}
                  {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to{" "}
                  {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
                  entries
                </>
              ) : (
                "No entries to show"
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No weather data points found for the selected date range.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
