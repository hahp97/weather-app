"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeatherReport } from "@/context/WeatherContext";
import { useWeather } from "@/context/WeatherContext";
import { cn } from "@/utils/common";
import { Cloud, Droplets, Sun, Thermometer } from "lucide-react";

interface WeatherCardProps {
  report: WeatherReport;
  showSelectButton?: boolean;
  isSelected?: boolean;
}

export function WeatherCard({
  report,
  showSelectButton = false,
  isSelected = false,
}: WeatherCardProps) {
  const { selectReport, deselectReport } = useWeather();
  const { timestamp, temperature, pressure, humidity, cloudCover } = report;

  const formattedDate = timestamp
    ? new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "No timestamp available";

  const handleSelect = () => {
    if (isSelected) {
      deselectReport(report.id);
    } else {
      selectReport(report);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500/50 shadow-md"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Weather Report
          </CardTitle>
          {showSelectButton && (
            <button
              onClick={handleSelect}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200",
                isSelected
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {isSelected ? "Selected" : "Select"}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{formattedDate}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <Thermometer className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-sm font-medium text-gray-500">
                Temperature
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {temperature}°C
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <Sun className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-sm font-medium text-gray-500">Pressure</div>
              <div className="text-lg font-semibold text-gray-900">
                {pressure} hPa
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-500">Humidity</div>
              <div className="text-lg font-semibold text-gray-900">
                {humidity}%
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
            <Cloud className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-500">
                Cloud Cover
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {cloudCover}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
