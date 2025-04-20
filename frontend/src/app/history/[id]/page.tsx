"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { AuthModal } from "@/components/modal/AuthModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import GetWeatherReportQuery from "@/graphql/query/weather/get-report.gql";
import { formatDate, formatDateTime } from "@/utils/common";
import { useQuery } from "@apollo/client";
import {
  ArrowLeft,
  Calendar,
  Cloud,
  Droplets,
  Info,
  Sun,
  Thermometer,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReportDetailPage() {
  const { id } = useParams();
  const reportId = Array.isArray(id) ? id[0] : id;
  const { user, loading: userLoading, initialized } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (initialized && !user) {
      setShowAuthModal(true);
    }
  }, [user, initialized]);

  const {
    loading: reportLoading,
    error: reportError,
    data: reportData,
  } = useQuery(GetWeatherReportQuery, {
    variables: {
      id: reportId,
    },
    fetchPolicy: "network-only",
    skip: !user || !reportId,
  });

  const report = reportData?.weatherReport;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        returnUrl={`/history/${reportId}`}
        featureName="Weather Report Details"
      />

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/history">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to History
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Weather Report Details</h1>
          </div>
        </div>

        {userLoading || reportLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : reportError ? (
          <Card className="p-6">
            <div className="text-red-500 flex flex-col items-center">
              <Info className="h-12 w-12 mb-2 text-red-500" />
              <text className="text-xl font-medium mb-2">
                Error Loading Report
              </text>
              <p>{reportError.message}</p>
              <p className="mt-4">
                Please try refreshing the page or go back to the history list.
              </p>
              <Link href="/history" className="mt-4">
                <Button>Return to History</Button>
              </Link>
            </div>
          </Card>
        ) : report ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>
                  Created on {formatDateTime(new Date(report.createdAt))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Date Range
                      </div>
                      <div className="font-medium">
                        {report.startTime &&
                          formatDate(new Date(report.startTime))}
                        {report.startTime && report.endTime && " to "}
                        {report.endTime && formatDate(new Date(report.endTime))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Info className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Data Points
                      </div>
                      <div className="font-medium">
                        {report.dataPointsCount} measurements
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weather Measurements</CardTitle>
                <CardDescription>Average values during period</CardDescription>
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
                        {report.avgTemperature !== null
                          ? report.avgTemperature.toFixed(1)
                          : "N/A"}
                        °C
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                    <Sun className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Pressure
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {report.avgPressure !== null
                          ? report.avgPressure.toFixed(0)
                          : "N/A"}{" "}
                        hPa
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                    <Droplets className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        Humidity
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {report.avgHumidity !== null
                          ? report.avgHumidity.toFixed(1)
                          : "N/A"}
                        %
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
                        {report.avgCloudCover !== null
                          ? report.avgCloudCover.toFixed(1)
                          : "N/A"}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Link href="/generate">
                    <Button variant="outline">Generate New Report</Button>
                  </Link>
                  <Link href={`/comparison?report1=${report.id}`}>
                    <Button>Compare With Another Report</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
