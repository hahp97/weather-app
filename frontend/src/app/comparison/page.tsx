"use client";

import { ComparisonRow } from "@/components/ComparisonRow";
import { AuthModal } from "@/components/modal/AuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ComparisonPageSkeleton } from "@/components/weather/ComparisonPageSkeleton";
import { useUser } from "@/context/UserContext";
import GqlCompareWeatherReports from "@/graphql/query/weather/compare-weather-reports.gql";
import { formatDate } from "@/utils/common";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ComparisonPage() {
  const { user, loading: userLoading, initialized } = useUser();
  const searchParams = useSearchParams();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );
  const [showAuthModal, setShowAuthModal] = useState(false);

  const report1Id = searchParams.get("report1");
  const report2Id = searchParams.get("report2");

  // Show auth modal if user is not authenticated and initialization is complete
  useEffect(() => {
    if (initialized && !user) {
      setShowAuthModal(true);
    }
  }, [user, initialized]);

  const { data, loading, error } = useQuery(GqlCompareWeatherReports, {
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

  // If still loading user, show loading state
  if (userLoading || loading) {
    return <ComparisonPageSkeleton />;
  }

  if (!report1Id || !report2Id) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container py-12 max-w-4xl mx-auto text-center">
          <div className="mx-auto bg-gradient-to-r from-sky-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
            Weather Report Comparison
          </h1>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl mb-8 shadow-sm">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 mr-2 text-amber-600"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-lg font-semibold">Selection Needed</h2>
            </div>
            <p className="mb-4">
              Please select two reports to compare from the History page.
            </p>
            <Link href="/history">
              <Button className="group transition-all duration-300 ease-in-out">
                <span className="mr-2">Go to History</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container py-12 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
            Weather Report Comparison
          </h1>
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl mb-8 shadow-sm">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 mr-2 text-red-600"
              >
                <path
                  fillRule="evenodd"
                  d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-lg font-semibold">
                Error Loading Comparison
              </h2>
            </div>
            <p className="mb-4">Error loading comparison: {error.message}</p>
            <div className="mt-6">
              <Link href="/history">
                <Button
                  variant="outline"
                  className="group transition-all duration-300 ease-in-out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container py-12 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
            Weather Report Comparison
          </h1>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl mb-8 shadow-sm">
            <div className="flex items-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 mr-2 text-amber-600"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-lg font-semibold">No Comparison Data</h2>
            </div>
            <p className="mb-4">
              No comparison data available for the selected reports.
            </p>
            <div className="mt-6">
              <Link href="/history">
                <Button
                  variant="outline"
                  className="group transition-all duration-300 ease-in-out"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                  >
                    <path
                      fillRule="evenodd"
                      d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back to History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { report1, report2, deviations } = comparisonData;

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white pb-16">
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        returnUrl="/comparison"
        featureName="Compare Weather Reports"
      />

      <div className="container py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
          Weather Report Comparison
        </h1>

        <div className="mb-8 flex justify-between items-center">
          <Link href="/history">
            <Button
              variant="outline"
              className="group transition-all duration-300 ease-in-out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
              >
                <path
                  fillRule="evenodd"
                  d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                  clipRule="evenodd"
                />
              </svg>
              Back to History
            </Button>
          </Link>
        </div>

        {/* Report titles and dates */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {report1.title}
              </CardTitle>
              <div className="text-sm text-blue-100">
                {formatDate(report1.createdAt)}
              </div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-gray-500 to-gray-600 text-white text-center overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Difference</CardTitle>
              <div className="text-sm text-gray-200">Comparison Analysis</div>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {report2.title}
              </CardTitle>
              <div className="text-sm text-green-100">
                {formatDate(report2.createdAt)}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Comparison metrics */}
        <Card className="border-0 shadow-lg bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-green-500"></div>
          <CardContent>
            <div className="divide-y">
              {/* Temperature */}
              <ComparisonRow
                label="Temperature (°C)"
                value1={report1.avgTemperature}
                value2={report2.avgTemperature}
                deviation={deviations.temperature}
                formatValue={(val) => val?.toFixed(1)}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-red-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"
                    />
                    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                  </svg>
                }
                color1="blue"
                color2="green"
              />

              {/* Pressure */}
              <ComparisonRow
                label="Pressure (hPa)"
                value1={report1.avgPressure}
                value2={report2.avgPressure}
                deviation={deviations.pressure}
                formatValue={(val) => val?.toFixed(0)}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-purple-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                color1="blue"
                color2="green"
              />

              {/* Humidity */}
              <ComparisonRow
                label="Humidity (%)"
                value1={report1.avgHumidity}
                value2={report2.avgHumidity}
                deviation={deviations.humidity}
                formatValue={(val) => val?.toFixed(0)}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-blue-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM8.547 4.505a8.25 8.25 0 1011.672 8.214l-.46-.46a2.252 2.252 0 01-.422-.586l-1.08-2.16a.414.414 0 00-.663-.107.827.827 0 01-.812.21l-1.273-.363a.89.89 0 00-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.211.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 01-1.81 1.025 1.055 1.055 0 01-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.654-.261a2.25 2.25 0 01-1.384-2.46l.007-.042a2.25 2.25 0 01.29-.787l.09-.15a2.25 2.25 0 012.37-1.048l1.178.236a1.125 1.125 0 001.302-.795l.208-.73a1.125 1.125 0 00-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 01-1.591.659h-.18c-.249 0-.487.1-.662.274a.931.931 0 01-1.458-1.137l1.279-2.132z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                color1="blue"
                color2="green"
              />

              {/* Cloud Cover */}
              <ComparisonRow
                label="Cloud Cover (%)"
                value1={report1.avgCloudCover}
                value2={report2.avgCloudCover}
                deviation={deviations.cloudCover}
                formatValue={(val) => val?.toFixed(0)}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-gray-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 9.75a6 6 0 0111.573-2.226 3.75 3.75 0 014.133 4.303A4.5 4.5 0 0118 20.25H6.75a5.25 5.25 0 01-2.23-10.004 6.072 6.072 0 01-.02-.496z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
                color1="blue"
                color2="green"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
