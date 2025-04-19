import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeatherData } from "@/hooks/useWeatherReducer";
import { formatDate } from "@/utils/common";
import { WeatherMetricCard } from "./WeatherMetricCard";

interface WeatherReportProps {
  weatherData: WeatherData | null;
  onSaveReport: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export function WeatherReport({
  weatherData,
  onSaveReport,
  isLoading,
  isLoggedIn,
}: WeatherReportProps) {
  if (!weatherData) return null;

  return (
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
          <Button onClick={onSaveReport} disabled={isLoading}>
            {isLoggedIn ? "Save Weather Report" : "Save Report"}
          </Button>
        </div>

        {!isLoggedIn && (
          <div className="mt-4 text-sm text-yellow-600 flex items-center gap-2 bg-yellow-50 p-3 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-alert-triangle"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
            </svg>
            <span>You must be logged in to save weather reports</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
