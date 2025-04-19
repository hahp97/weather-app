"use client";

import type { WeatherReport } from "@/context/WeatherContext";

interface ComparisonTableProps {
  reports: WeatherReport[];
}

export function ComparisonTable({ reports }: ComparisonTableProps) {
  if (reports.length !== 2) {
    return (
      <div className="text-center p-6 bg-white shadow rounded-lg">
        <p className="text-gray-600">
          Please select exactly two reports to compare
        </p>
      </div>
    );
  }

  const [report1, report2] = reports;

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const calculateDeviation = (value1: number, value2: number) => {
    return Math.abs(value1 - value2).toFixed(1);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Weather Report Comparison
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Comparing weather data between two reports
        </p>
      </div>
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Parameter
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Report 1
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Report 2
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Deviation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Timestamp
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(report1.timestamp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(report2.timestamp)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                -
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Temperature (°C)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report1.temperature}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report2.temperature}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {calculateDeviation(report1.temperature, report2.temperature)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Pressure (hPa)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report1.pressure}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report2.pressure}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {calculateDeviation(report1.pressure, report2.pressure)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Humidity (%)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report1.humidity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report2.humidity}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {calculateDeviation(report1.humidity, report2.humidity)}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Cloud Cover (%)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report1.cloudCover}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {report2.cloudCover}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                {calculateDeviation(report1.cloudCover, report2.cloudCover)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
