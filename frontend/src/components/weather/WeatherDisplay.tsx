"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import CurrentWeatherQuery from "@/graphql/query/weather/current-weather.gql";
import { useQuery } from "@apollo/client";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Droplets,
  Gauge,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";

interface WeatherData {
  id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCover: number;
  windSpeed: number;
  weatherCondition: string;
}

export default function WeatherDisplay() {
  const { user } = useUser();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { loading, error, data, refetch } = useQuery(CurrentWeatherQuery, {
    fetchPolicy: "network-only",
    skip: false,
  });

  useEffect(() => {
    if (data?.currentWeather) {
      setWeatherData(data.currentWeather);
      setLastUpdated(new Date());
    }
  }, [data]);

  // Set up polling based on login status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (user) {
      // If logged in, update every 5 minutes
      interval = setInterval(() => {
        refetch();
      }, 5 * 60 * 1000); // 5 minutes
    } else {
      // If not logged in, update every 2 hours
      interval = setInterval(() => {
        refetch();
      }, 2 * 60 * 60 * 1000); // 2 hours
    }

    return () => clearInterval(interval);
  }, [user, refetch]);

  // Format the last updated time using native Date methods
  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  // Function to get appropriate weather icon
  const getWeatherIcon = () => {
    if (!weatherData) return <Cloud className="h-10 w-10 text-blue-400" />;

    const condition = weatherData.weatherCondition?.toLowerCase() || "";

    if (condition.includes("clear") || condition.includes("sunny")) {
      return <Sun className="h-10 w-10 text-yellow-500" />;
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return <CloudRain className="h-10 w-10 text-blue-400" />;
    } else if (condition.includes("snow")) {
      return <CloudSnow className="h-10 w-10 text-blue-300" />;
    } else if (condition.includes("cloud")) {
      return <Cloud className="h-10 w-10 text-gray-400" />;
    }

    // Default icon if no specific condition matches
    return <Cloud className="h-10 w-10 text-blue-400" />;
  };

  if (loading && !weatherData)
    return (
      <Card className="w-full shadow-lg border-0">
        <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Card className="border-red-200 bg-red-50 shadow-lg">
        <CardContent className="p-6 text-center text-red-600">
          <p className="font-medium">Error loading weather data</p>
          <p className="text-sm mt-2">Please refresh and try again</p>
        </CardContent>
      </Card>
    );

  if (!weatherData) return null;

  return (
    <Card className="overflow-hidden shadow-lg border-0 rounded-xl bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-2 border-b border-blue-100">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center">
            {getWeatherIcon()}
            <span className="ml-2 text-blue-800">
              Current Weather at Changi Airport
            </span>
          </div>
          {user && (
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 transition-colors"
              aria-label="Refresh weather data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </CardTitle>
        <p className="text-sm text-blue-600 mt-1 font-medium">
          {weatherData.weatherCondition}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WeatherMetric
            icon={<Thermometer className="h-6 w-6 text-red-500" />}
            label="Temperature"
            value={`${weatherData.temperature}°C`}
            bgColor="bg-red-50"
            textColor="text-red-700"
          />

          <WeatherMetric
            icon={<Droplets className="h-6 w-6 text-blue-500" />}
            label="Humidity"
            value={`${weatherData.humidity}%`}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />

          <WeatherMetric
            icon={<Wind className="h-6 w-6 text-teal-500" />}
            label="Wind Speed"
            value={`${weatherData.windSpeed} m/s`}
            bgColor="bg-teal-50"
            textColor="text-teal-700"
          />

          <WeatherMetric
            icon={<Cloud className="h-6 w-6 text-slate-500" />}
            label="Cloud Cover"
            value={`${weatherData.cloudCover}%`}
            bgColor="bg-slate-50"
            textColor="text-slate-700"
          />

          <div className="col-span-2 md:col-span-4">
            <WeatherMetric
              icon={<Gauge className="h-6 w-6 text-purple-500" />}
              label="Pressure"
              value={`${weatherData.pressure} hPa`}
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
          </div>
        </div>

        {lastUpdated && (
          <div className="mt-6 pt-3 border-t border-blue-100 flex items-center justify-between text-xs text-blue-600">
            <p>Last updated: {formatLastUpdated(lastUpdated)}</p>
            <p>{user ? "Updates every 5 minutes" : "Updates every 2 hours"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface WeatherMetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
}

function WeatherMetric({
  icon,
  label,
  value,
  bgColor,
  textColor,
}: WeatherMetricProps) {
  return (
    <div
      className={`flex items-center space-x-3 ${bgColor} p-4 rounded-lg shadow-sm`}
    >
      {icon}
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className={`text-lg font-semibold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
}
