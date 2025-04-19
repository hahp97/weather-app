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
import { cn, formatDate } from "@/lib/utils";
import { gql, useMutation, useQuery } from "@apollo/client";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

// GraphQL queries
const CURRENT_WEATHER_QUERY = gql`
  query CurrentWeather {
    currentWeather {
      id
      timestamp
      temperature
      pressure
      humidity
      cloudCover
      windSpeed
      weatherCondition
    }
  }
`;

// GraphQL mutations
const FETCH_HISTORICAL_WEATHER_MUTATION = gql`
  mutation FetchHistoricalWeather($date: DateTime!) {
    fetchHistoricalWeatherData(date: $date) {
      success
      message
      errors {
        message
      }
      extra
    }
  }
`;

const GENERATE_WEATHER_REPORT_MUTATION = gql`
  mutation GenerateWeatherReport($input: GenerateWeatherReportInput!) {
    generateWeatherReport(input: $input) {
      success
      message
      errors {
        message
      }
      extra
    }
  }
`;

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

export default function GeneratePage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { addReport } = useWeather();
  const toast = useToast();

  // Current Weather Query
  const { refetch: refetchCurrentWeather } = useQuery(CURRENT_WEATHER_QUERY, {
    fetchPolicy: "network-only",
    skip: true, // Don't run the query on component mount
  });

  // Historical Weather Mutation
  const [fetchHistoricalWeather] = useMutation(
    FETCH_HISTORICAL_WEATHER_MUTATION
  );

  // Generate Report Mutation
  const [generateWeatherReport] = useMutation(GENERATE_WEATHER_REPORT_MUTATION);

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setWeatherData(null);

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
            toast.error("No historical weather data available");
          }
        } else {
          const errorMessage =
            data?.fetchHistoricalWeatherData?.errors?.[0]?.message ||
            data?.fetchHistoricalWeatherData?.message ||
            "Failed to load historical weather data";

          if (errorMessage.includes("subscription")) {
            toast.error(
              "Historical data requires a paid OpenWeather API subscription"
            );
          } else {
            toast.error(errorMessage);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      toast.error("Failed to fetch weather data");
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
        const reportData = data.generateWeatherReport.extra?.report;
        if (reportData) {
          addReport(reportData);
          toast.success("Weather report saved successfully");
        } else {
          toast.error("Report generated but no data was returned");
        }
      } else {
        const errorMessage =
          data?.generateWeatherReport?.errors?.[0]?.message ||
          data?.generateWeatherReport?.message ||
          "Failed to generate weather report";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error generating weather report:", error);
      toast.error("Failed to generate weather report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Weather Report Generator
      </h1>

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
              className="px-8"
            >
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center my-12">
          <LoadingSpinner />
        </div>
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
