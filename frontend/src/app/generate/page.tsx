"use client";

import { AuthModal } from "@/components/modal/AuthModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRangeFilter } from "@/components/weather/DateRangeFilter";
import { HourFilter } from "@/components/weather/HourFilter";
import { WeatherDataTable } from "@/components/weather/WeatherDataTable";
import { WeatherReport } from "@/components/weather/WeatherReport";
import { useUser } from "@/context/UserContext";
import { useWeatherData } from "@/hooks/useWeatherData";
import { cn, formatDate } from "@/utils/common";
import { AlertTriangle, CalendarIcon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function GeneratePage() {
  const { user } = useUser();
  const {
    state,
    handleCalendarSelect,
    handleGenerateReport,
    handleSaveReport,
    filterByHour,
    handleToggleSortOrder,
    changeSortField,
    handlePageChange,
    handlePageSizeChange,
    saveDataPointAsReport,
    handleDataPointsDateChange,
    applyDateRangeFilter,
    toggleDataPointsView,
    setShowAuthModal,
    isPremiumUser,
    refetchWeatherDataInRange,
  } = useWeatherData();

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [nextRefresh, setNextRefresh] = useState(refreshInterval);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!autoRefresh || !state.showDataPointsView) {
      return;
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1) {
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    // Data refresh interval
    const refreshTimer = setInterval(() => {
      if (autoRefresh && state.showDataPointsView) {
        refreshDataPoints();
      }
    }, refreshInterval * 1000);

    return () => {
      clearInterval(refreshTimer);
      clearInterval(countdownInterval);
    };
  }, [autoRefresh, refreshInterval, state.showDataPointsView]);

  useEffect(() => {
    if (state.showDataPointsView) {
      setNextRefresh(refreshInterval);
    }
  }, [state.showDataPointsView]);

  const refreshDataPoints = async () => {
    if (!state.showDataPointsView) return;

    setIsRefreshing(true);
    try {
      // Only refresh data points view
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: dataPointsData } = await refetchWeatherDataInRange({
        variables: {
          range: {
            startTime: state.dataPointsDateRange.startTime.toISOString(),
            endTime: state.dataPointsDateRange.endTime.toISOString(),
          },
          first: state.pageSize,
          skip: (state.currentPage - 1) * state.pageSize,
          sortField: state.sortField,
          sortOrder: state.sortOrder,
        },
      });
    } catch (error) {
      console.error("Error refreshing data points:", error);
    } finally {
      setIsRefreshing(false);
      setNextRefresh(refreshInterval);
    }
  };

  // Handle manual refresh
  const handleManualRefresh = () => {
    refreshDataPoints();
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold flex justify-between items-center">
            <span>Weather Report Generator</span>
            {/* Show auto-refresh controls only when data points view is active */}
            {state.showDataPointsView && (
              <div className="flex items-center gap-2">
                <div className="text-sm font-normal flex items-center">
                  <div
                    className={`flex items-center ${
                      autoRefresh ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-1 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    {autoRefresh
                      ? `Auto-refresh in ${nextRefresh}s`
                      : "Auto-refresh off"}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    {autoRefresh ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                  >
                    Refresh Now
                  </Button>
                </div>
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={refreshInterval}
                  onChange={(e) => {
                    const newInterval = parseInt(e.target.value);
                    setRefreshInterval(newInterval);
                    setNextRefresh(newInterval);
                  }}
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-0">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <Card className="w-full md:w-1/2 bg-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span>Current Weather</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-2">
                  Get the latest weather data for your location
                </p>
                <Button
                  onClick={() => {
                    handleCalendarSelect(undefined);
                    handleGenerateReport();
                  }}
                  className="w-full"
                >
                  Get Current Weather
                </Button>
              </CardContent>
              <CardContent className="pt-2 pb-4">
                <Button
                  onClick={toggleDataPointsView}
                  variant="outline"
                  className="w-full"
                >
                  {state.showDataPointsView
                    ? "Hide Historical Data"
                    : "View All Historical Data"}
                </Button>
              </CardContent>
            </Card>

            <Card
              className={`w-full md:w-1/2 ${
                !isPremiumUser
                  ? "bg-amber-100/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                  : "bg-muted/40"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span>
                    {!isPremiumUser ? "Premium Feature" : "Historical Weather"}
                  </span>
                  {!isPremiumUser && (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {!isPremiumUser ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Historical weather data requires a paid OpenWeather API
                      subscription. This feature is currently disabled as it
                      requires payment for API access.
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal opacity-70 cursor-not-allowed"
                          disabled={true}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>Select Date (Premium Only)</span>
                        </Button>
                      </PopoverTrigger>
                    </Popover>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose a date to retrieve historical weather data
                    </p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={state.date ? "outline" : "outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !state.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {state.date ? (
                            formatDate(state.date)
                          ) : (
                            <span>Select a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={state.date}
                          onSelect={handleCalendarSelect}
                          disabled={!isPremiumUser}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardContent>
              <CardContent className="pb-4 pt-0">
                <Button
                  onClick={handleGenerateReport}
                  disabled={
                    (!state.date && !isPremiumUser) ||
                    state.isLoading ||
                    (!state.date && isPremiumUser)
                  }
                  className="w-full"
                >
                  {state.isLoading
                    ? "Loading..."
                    : state.date
                    ? "Get Historical Weather"
                    : "Select a Date"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {state.isSubscriptionError && (
        <Card className="border-amber-400 bg-amber-100/40 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Subscription Required for Historical Weather API</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Historical weather data from the OpenWeather API requires a paid
              subscription. This feature is currently disabled as it requires
              payment for API access.
            </p>
            <p className="mt-2">
              However, you can still view our stored historical data (collected
              every 5 minutes) by clicking the &quot;View All Historical
              Data&quot; button.
            </p>
          </CardContent>
        </Card>
      )}

      {state.errorMessage && !state.isSubscriptionError && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{state.errorMessage}</p>
          </CardContent>
        </Card>
      )}

      {state.weatherData && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">
              {state.date
                ? `Weather on ${formatDate(state.date)}`
                : "Current Weather"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <WeatherReport
              weatherData={state.weatherData}
              onSaveReport={handleSaveReport}
              isLoading={state.isLoading}
              isLoggedIn={!!user}
            />
          </CardContent>
        </Card>
      )}

      {state.weatherData && state.showHistoricalData && (
        <>
          <div className="my-4 border-t border-border" />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {state.selectedHour !== null
                  ? `Weather Data for ${formatDate(state.date!)} at ${
                      state.selectedHour
                    }:00`
                  : `Weather Data for ${formatDate(state.date!)}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="space-y-4">
                <HourFilter
                  selectedHour={state.selectedHour}
                  onHourSelect={filterByHour}
                />

                <WeatherDataTable
                  historicalDataPoints={state.historicalDataPoints}
                  isLoading={state.isLoading}
                  errorMessage={state.errorMessage}
                  sortField={state.sortField}
                  sortOrder={state.sortOrder}
                  onSortFieldChange={changeSortField}
                  onToggleSortOrder={handleToggleSortOrder}
                  currentPage={state.currentPage}
                  pageSize={state.pageSize}
                  totalItems={state.totalItems}
                  totalPages={state.totalPages}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onSaveDataPoint={saveDataPointAsReport}
                  showSaveAction={!!user}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {state.showDataPointsView && (
        <>
          <div className="my-4 border-t border-border" />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Stored Weather Data History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Access historical weather data collected every 5 minutes.
              </p>
            </CardHeader>
            <CardContent>
              <DateRangeFilter
                dateRange={state.dataPointsDateRange}
                onDateChange={handleDataPointsDateChange}
                onApplyFilter={applyDateRangeFilter}
                isLoading={state.isLoading || isRefreshing}
                title="Select Date Range"
              />

              <div className="mt-4">
                <WeatherDataTable
                  historicalDataPoints={state.historicalDataPoints}
                  isLoading={state.isLoading || isRefreshing}
                  errorMessage={state.errorMessage}
                  sortField={state.sortField}
                  sortOrder={state.sortOrder}
                  onSortFieldChange={changeSortField}
                  onToggleSortOrder={handleToggleSortOrder}
                  currentPage={state.currentPage}
                  pageSize={state.pageSize}
                  totalItems={state.totalItems}
                  totalPages={state.totalPages}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  onSaveDataPoint={saveDataPointAsReport}
                  showSaveAction={!!user}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {state.showAuthModal && (
        <AuthModal
          isOpen={state.showAuthModal}
          onClose={() => setShowAuthModal(false)}
          returnUrl="/generate"
          featureName={
            state.weatherData ? "Save Weather Report" : "View Weather Data"
          }
        />
      )}
    </div>
  );
}
