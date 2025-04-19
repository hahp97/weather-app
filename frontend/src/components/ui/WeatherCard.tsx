"use client";

import type { WeatherReport } from "@/context/WeatherContext";
import { useWeather } from "@/context/WeatherContext";

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

  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleSelect = () => {
    if (isSelected) {
      deselectReport(report.id);
    } else {
      selectReport(report);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Weather Report
          </h3>
          {showSelectButton && (
            <button
              onClick={handleSelect}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                isSelected
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {isSelected ? "Selected" : "Select"}
            </button>
          )}
        </div>
        <div className="mt-3 text-sm text-gray-500">{formattedDate}</div>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Temperature</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {temperature}°C
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Pressure</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {pressure} hPa
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Humidity</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {humidity}%
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Cloud Cover</div>
            <div className="mt-1 text-lg font-semibold text-gray-900">
              {cloudCover}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
