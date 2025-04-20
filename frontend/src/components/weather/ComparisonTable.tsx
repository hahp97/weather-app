"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WeatherReport } from "@/context/WeatherContext";
import { cn } from "@/utils/common";
import {
  ArrowRightLeft,
  Cloud,
  Droplets,
  Sun,
  Thermometer,
} from "lucide-react";

interface ComparisonTableProps {
  reports: WeatherReport[];
}

export function ComparisonTable({ reports }: ComparisonTableProps) {
  if (reports.length !== 2) {
    return (
      <Card className="text-center p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <ArrowRightLeft className="h-10 w-10 text-gray-400" />
          <p className="text-gray-600">
            Please select exactly two reports to compare
          </p>
        </div>
      </Card>
    );
  }

  const [report1, report2] = reports;

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) {
      return "N/A";
    }

    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const calculateDeviation = (
    value1: number | undefined,
    value2: number | undefined
  ) => {
    if (value1 === undefined || value2 === undefined) {
      return "N/A";
    }

    return Math.abs(value1 - value2).toFixed(1);
  };

  // Function to determine the color of the deviation cell
  const getDeviationColor = (
    value1: number | undefined,
    value2: number | undefined
  ) => {
    if (value1 === undefined || value2 === undefined) {
      return "text-gray-400";
    }

    const diff = Math.abs(value1 - value2);

    // Different thresholds for different metrics
    if (diff === 0) return "text-green-600";

    // Different colors based on how significant the deviation is
    return diff > 5 ? "text-red-600" : "text-yellow-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ArrowRightLeft className="h-5 w-5 mr-2 text-blue-600" />
          Weather Report Comparison
        </CardTitle>
        <CardDescription>
          Comparing weather data between two reports
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report 1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report 2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deviation
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Timestamp
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(report1.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(report2.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  -
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <Thermometer className="h-4 w-4 mr-2 text-red-500" />
                  Temperature (°C)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report1.temperature}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report2.temperature}
                </td>
                <td
                  className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm font-medium",
                    getDeviationColor(report1.temperature, report2.temperature)
                  )}
                >
                  {calculateDeviation(report1.temperature, report2.temperature)}
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <Sun className="h-4 w-4 mr-2 text-orange-500" />
                  Pressure (hPa)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report1.pressure}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report2.pressure}
                </td>
                <td
                  className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm font-medium",
                    getDeviationColor(report1.pressure, report2.pressure)
                  )}
                >
                  {calculateDeviation(report1.pressure, report2.pressure)}
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                  Humidity (%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report1.humidity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report2.humidity}
                </td>
                <td
                  className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm font-medium",
                    getDeviationColor(report1.humidity, report2.humidity)
                  )}
                >
                  {calculateDeviation(report1.humidity, report2.humidity)}
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <Cloud className="h-4 w-4 mr-2 text-gray-500" />
                  Cloud Cover (%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report1.cloudCover}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {report2.cloudCover}
                </td>
                <td
                  className={cn(
                    "px-6 py-4 whitespace-nowrap text-sm font-medium",
                    getDeviationColor(report1.cloudCover, report2.cloudCover)
                  )}
                >
                  {calculateDeviation(report1.cloudCover, report2.cloudCover)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
