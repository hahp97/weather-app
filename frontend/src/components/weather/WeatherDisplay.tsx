"use client";

import { useUser } from "@/context/UserContext";
import CurrentWeatherQuery from "@/graphql/query/weather/current-weather.gql";
import { useQuery } from "@apollo/client";
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

  if (loading && !weatherData)
    return (
      <div className="animate-pulse bg-blue-50 p-6 rounded-lg shadow-md">
        <div className="h-4 bg-blue-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-blue-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-blue-200 rounded w-2/3"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-md text-red-700">
        <p>Error loading weather data</p>
      </div>
    );

  if (!weatherData) return null;

  return (
    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-blue-900 mb-2">
        Current Weather at Changi Airport
      </h3>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <p className="text-sm text-gray-500">Temperature</p>
          <p className="text-xl font-semibold">{weatherData.temperature}°C</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Humidity</p>
          <p className="text-xl font-semibold">{weatherData.humidity}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Wind Speed</p>
          <p className="text-xl font-semibold">{weatherData.windSpeed} m/s</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Condition</p>
          <p className="text-xl font-semibold">
            {weatherData.weatherCondition}
          </p>
        </div>
      </div>

      {lastUpdated && (
        <div className="mt-4 text-xs text-gray-500">
          <p>Last updated: {formatLastUpdated(lastUpdated)}</p>
          <p className="text-xs mt-1">
            {user ? "Updates every 5 minutes" : "Updates every 2 hours"}
          </p>
        </div>
      )}
    </div>
  );
}
