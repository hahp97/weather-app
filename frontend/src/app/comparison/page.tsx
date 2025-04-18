"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";
import { gql, useQuery } from "@apollo/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// GraphQL query to compare weather reports
const COMPARE_WEATHER_REPORTS_QUERY = gql`
  query CompareWeatherReports($reportId1: ID!, $reportId2: ID!) {
    compareWeatherReports(reportId1: $reportId1, reportId2: $reportId2) {
      report1 {
        id
        title
        startTime
        endTime
        avgTemperature
        avgPressure
        avgHumidity
        avgCloudCover
        dataPointsCount
        createdAt
      }
      report2 {
        id
        title
        startTime
        endTime
        avgTemperature
        avgPressure
        avgHumidity
        avgCloudCover
        dataPointsCount
        createdAt
      }
      deviations {
        temperature
        pressure
        humidity
        cloudCover
        windSpeed
      }
    }
  }
`;

interface BackendReport {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  avgTemperature: number;
  avgPressure: number;
  avgHumidity: number;
  avgCloudCover: number;
  dataPointsCount: number;
  createdAt: string;
}

interface ComparisonData {
  report1: BackendReport;
  report2: BackendReport;
  deviations: {
    temperature: number;
    pressure: number;
    humidity: number;
    cloudCover: number;
    windSpeed: number;
  };
}

export default function ComparisonPage() {
  const searchParams = useSearchParams();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );

  const report1Id = searchParams.get("report1");
  const report2Id = searchParams.get("report2");

  const { data, loading, error } = useQuery(COMPARE_WEATHER_REPORTS_QUERY, {
    variables: {
      reportId1: report1Id,
      reportId2: report2Id,
    },
    skip: !report1Id || !report2Id,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data?.compareWeatherReports) {
      setComparisonData(data.compareWeatherReports);
    }
  }, [data]);

  if (!report1Id || !report2Id) {
    return (
      <div className="container py-8 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Weather Report Comparison</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6">
          Please select two reports to compare from the History page.
        </div>
        <Link href="/history">
          <Button>Go to History</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl mx-auto flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Weather Report Comparison</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          Error loading comparison: {error.message}
        </div>
        <div className="mt-6">
          <Link href="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Weather Report Comparison</h1>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
          No comparison data available for the selected reports.
        </div>
        <div className="mt-6">
          <Link href="/history">
            <Button>Back to History</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { report1, report2, deviations } = comparisonData;

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-center">
        Weather Report Comparison
      </h1>

      <div className="mb-8 flex justify-between items-center">
        <Link href="/history">
          <Button variant="outline">Back to History</Button>
        </Link>
      </div>

      {/* Report titles and dates */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-lg">{report1.title}</CardTitle>
            <div className="text-sm text-gray-500">
              {formatDate(report1.createdAt)}
            </div>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-lg">Difference</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="text-lg">{report2.title}</CardTitle>
            <div className="text-sm text-gray-500">
              {formatDate(report2.createdAt)}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Comparison metrics */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {/* Temperature */}
            <ComparisonRow
              label="Temperature (°C)"
              value1={report1.avgTemperature}
              value2={report2.avgTemperature}
              deviation={deviations.temperature}
              formatValue={(val) => val?.toFixed(1)}
              icon="🌡️"
            />

            {/* Pressure */}
            <ComparisonRow
              label="Pressure (hPa)"
              value1={report1.avgPressure}
              value2={report2.avgPressure}
              deviation={deviations.pressure}
              formatValue={(val) => val?.toFixed(0)}
              icon="📊"
            />

            {/* Humidity */}
            <ComparisonRow
              label="Humidity (%)"
              value1={report1.avgHumidity}
              value2={report2.avgHumidity}
              deviation={deviations.humidity}
              formatValue={(val) => val?.toFixed(0)}
              icon="💧"
            />

            {/* Cloud Cover */}
            <ComparisonRow
              label="Cloud Cover (%)"
              value1={report1.avgCloudCover}
              value2={report2.avgCloudCover}
              deviation={deviations.cloudCover}
              formatValue={(val) => val?.toFixed(0)}
              icon="☁️"
            />

            {/* Data Points */}
            <div className="grid grid-cols-3 gap-6 p-4">
              <div className="flex items-center">
                <div className="mr-4 text-xl">📊</div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Data Points
                  </h3>
                  <p className="text-lg font-semibold">
                    {report1.dataPointsCount || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-500">
                    Difference
                  </h3>
                  <p className="text-lg font-semibold">
                    {Math.abs(
                      (report1.dataPointsCount || 0) -
                        (report2.dataPointsCount || 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-4 text-xl">📊</div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Data Points
                  </h3>
                  <p className="text-lg font-semibold">
                    {report2.dataPointsCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for a comparison row
function ComparisonRow({
  label,
  value1,
  value2,
  deviation,
  formatValue = (val: number) => val?.toString(),
  icon = "📈",
}: {
  label: string;
  value1: number;
  value2: number;
  deviation: number;
  formatValue?: (val: number) => string;
  icon?: string;
}) {
  // Determine if value1 is higher, lower, or same as value2
  const getComparisonIndicator = () => {
    if (value1 > value2) return <span className="text-red-500">↑</span>;
    if (value1 < value2) return <span className="text-green-500">↓</span>;
    return null;
  };

  return (
    <div className="grid grid-cols-3 gap-6 p-4">
      <div className="flex items-center">
        <div className="mr-4 text-xl">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <p className="text-lg font-semibold">{formatValue(value1)}</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-500">Difference</h3>
          <p className="text-lg font-semibold">
            {formatValue(deviation)} {getComparisonIndicator()}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <div className="mr-4 text-xl">{icon}</div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{label}</h3>
          <p className="text-lg font-semibold">{formatValue(value2)}</p>
        </div>
      </div>
    </div>
  );
}
