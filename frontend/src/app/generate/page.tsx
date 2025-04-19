"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/context/ToastContext";
import { useWeather } from "@/context/WeatherContext";
import { cn, formatDate } from "@/utils/common";
import { useMutation, useQuery } from "@apollo/client";
import { AlertTriangle, CalendarIcon, Info } from "lucide-react";
import { useState } from "react";

// Import GraphQL files
import FetchHistoricalWeatherMutation from "@/graphql/mutation/weather/fetch-historical-weather.gql";
import GenerateWeatherReportMutation from "@/graphql/mutation/weather/generate-weather-report.gql";
import CurrentWeatherQuery from "@/graphql/query/weather/current-weather.gql";
import GetWeatherReportsQuery from "@/graphql/query/weather/get-reports.gql";

interface WeatherData {
  id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCover: number;
  windSpeed?: number;
  weatherCondition?: string;
}

interface WeatherReport {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  avgTemperature: number;
  avgPressure: number;
  avgHumidity: number;
  avgCloudCover: number;
  avgWindSpeed: number;
  dataPointsCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function GeneratePage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubscriptionError, setIsSubscriptionError] = useState(false);

  const { addReport } = useWeather();
  const toast = useToast();

  // Current Weather Query
  const { refetch: refetchCurrentWeather } = useQuery(CurrentWeatherQuery, {
    fetchPolicy: "network-only",
    skip: true, // Don't run the query on component mount
  });

  // Weather Reports Query
  const { refetch: refetchWeatherReports } = useQuery(GetWeatherReportsQuery, {
    fetchPolicy: "network-only",
    skip: true, // Don't run the query on component mount
  });

  // Historical Weather Mutation
  const [fetchHistoricalWeather] = useMutation(FetchHistoricalWeatherMutation);

  // Generate Report Mutation
  const [generateWeatherReport] = useMutation(GenerateWeatherReportMutation);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setWeatherData(null);
    setErrorMessage(null);
    setIsSubscriptionError(false);

    try {
      if (!date) {
        // Get current weather
        const { data } = await refetchCurrentWeather();
        if (data?.currentWeather) {
          setWeatherData(data.currentWeather);
          toast.success("Current weather data loaded");
        }
      } else {
        // Get historical weather
        const { data } = await fetchHistoricalWeather({
          variables: { date: date.toISOString() },
        });

        if (data?.fetchHistoricalWeatherData?.success) {
          const historicalData = data.fetchHistoricalWeatherData.extra?.weather;
          if (historicalData) {
            setWeatherData(historicalData);
            toast.success("Historical weather data loaded");
          } else {
            const errorMsg = "No historical weather data available";
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          }
        } else {
          const error =
            data?.fetchHistoricalWeatherData?.errors?.[0]?.message ||
            data?.fetchHistoricalWeatherData?.message ||
            "Failed to load historical weather data";

          if (error.includes("subscription") || error.includes("OpenWeather")) {
            setIsSubscriptionError(true);
            const subscriptionErrorMsg =
              "Historical data requires a paid OpenWeather API subscription. Please use current weather or contact administrator to upgrade.";
            setErrorMessage(subscriptionErrorMsg);
            toast.error(subscriptionErrorMsg);
          } else {
            setErrorMessage(error);
            toast.error(error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      const errorMsg = "Failed to fetch weather data. Please try again later.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!weatherData) return;

    setIsLoading(true);
    try {
      // Create a date range for the report (current day)
      const reportDate = date || new Date();
      const startOfDay = new Date(reportDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(reportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data } = await generateWeatherReport({
        variables: {
          input: {
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
            title: `Weather Report for ${formatDate(reportDate)}`,
          },
        },
      });

      if (data?.generateWeatherReport?.success) {
        console.log("Generate report response:", data.generateWeatherReport);

        // Check for report data in response
        const reportData =
          data.generateWeatherReport.data?.report ||
          data.generateWeatherReport.extra?.report;

        if (reportData) {
          // We have the report data in the response
          handleReportData(reportData);
        } else {
          // The report was generated successfully but data is not in the response
          // Fetch the latest reports to get the just-created report
          try {
            const { data: reportsData } = await refetchWeatherReports();

            if (
              reportsData?.weatherReports &&
              reportsData.weatherReports.length > 0
            ) {
              // Sort reports by creation date (newest first) and take the first one
              const reports = [...reportsData.weatherReports];
              reports.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );

              const latestReport = reports[0];
              handleReportData(latestReport);
            } else {
              // No reports found, but save was successful according to backend
              toast.success(
                "Weather report saved successfully, but couldn't fetch the details"
              );
            }
          } catch (fetchError) {
            console.error(
              "Error fetching reports after generation:",
              fetchError
            );
            // Report was likely saved but we couldn't fetch it
            toast.success(
              "Weather report saved successfully, but couldn't fetch the details"
            );
          }
        }
      } else {
        const error =
          data?.generateWeatherReport?.errors?.[0]?.message ||
          data?.generateWeatherReport?.message ||
          "Failed to generate weather report";
        setErrorMessage(error);
        toast.error(error);
      }
    } catch (error) {
      console.error("Error generating weather report:", error);
      const errorMsg = "Failed to generate weather report";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process report data
  const handleReportData = (reportData: WeatherReport) => {
    // Chuyển đổi dữ liệu báo cáo để phù hợp với interface WeatherReport mới
    const formattedReport = {
      id: reportData.id,
      title: reportData.title,
      startTime: reportData.startTime,
      endTime: reportData.endTime,
      avgTemperature: reportData.avgTemperature || 0,
      avgPressure: reportData.avgPressure || 0,
      avgHumidity: reportData.avgHumidity || 0,
      avgCloudCover: reportData.avgCloudCover || 0,
      avgWindSpeed: reportData.avgWindSpeed || 0,
      dataPointsCount: reportData.dataPointsCount || 0,
      createdAt: reportData.createdAt,
      updatedAt: reportData.updatedAt,
      // Thêm các trường cũ cho khả năng tương thích
      timestamp: reportData.createdAt || new Date().toISOString(),
      temperature: reportData.avgTemperature || 0,
      pressure: reportData.avgPressure || 0,
      humidity: reportData.avgHumidity || 0,
      cloudCover: reportData.avgCloudCover || 0,
    };

    addReport(formattedReport);
    toast.success("Weather report saved successfully");
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Weather Report Generator
      </h1>

      {/* Info banner about historical data */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start">
        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">About Historical Weather Data</p>
          <p>
            This application is using the OpenWeather API. Currently, historical
            weather data (searching by date) requires a paid OpenWeather API
            subscription plan. If you&apos;re experiencing issues with
            historical data, please use the current weather option instead.
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">
                Date (leave empty for current time)
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? formatDate(date) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {date && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDate(undefined)}
                  className="text-xs text-blue-600"
                >
                  Clear (Use current time)
                </Button>
              )}
            </div>
            <Button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={cn(
                "px-8",
                date
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-blue-600 hover:bg-blue-700"
              )}
            >
              {date ? "Generate Historical Data*" : "Generate Current Data"}
            </Button>
          </div>

          {date && (
            <div className="mt-2 text-xs text-amber-600 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              <span>Historical data may require a paid API subscription</span>
            </div>
          )}

          {isSubscriptionError && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Subscription Required</p>
                <p>
                  Historical weather data requires a paid OpenWeather API
                  subscription. Please use current weather data instead or
                  contact administrator.
                </p>
                <p className="mt-2">
                  <a
                    href="https://openweathermap.org/price"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    OpenWeather Subscription Plans
                  </a>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center my-12">
          <LoadingSpinner />
        </div>
      )}

      {errorMessage && !isLoading && !isSubscriptionError && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {weatherData && !isLoading && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Weather Report</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {formatDate(new Date(weatherData.timestamp))}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WeatherMetricCard
                  title="Temperature"
                  value={`${weatherData.temperature.toFixed(1)}°C`}
                  icon="🌡️"
                />
                <WeatherMetricCard
                  title="Pressure"
                  value={`${weatherData.pressure.toFixed(0)} hPa`}
                  icon="📊"
                />
                <WeatherMetricCard
                  title="Humidity"
                  value={`${weatherData.humidity.toFixed(0)}%`}
                  icon="💧"
                />
                <WeatherMetricCard
                  title="Cloud Cover"
                  value={`${weatherData.cloudCover.toFixed(0)}%`}
                  icon="☁️"
                />
              </div>

              {weatherData.weatherCondition && (
                <div className="mt-6 text-center">
                  <p className="text-lg font-medium">
                    {weatherData.weatherCondition}
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <Button onClick={handleSaveReport} disabled={isLoading}>
                  Save Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function WeatherMetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 flex items-center">
      <div className="mr-4 text-2xl">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
