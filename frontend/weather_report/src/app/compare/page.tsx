"use client";

import { ComparisonTable } from "@/components/ui/ComparisonTable";
import { useToast } from "@/context/ToastContext";
import { useWeather } from "@/context/WeatherContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ComparePage() {
  const { selectedReports, clearSelectedReports } = useWeather();
  const { showInfoToast, showWarningToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Redirect to history if no reports selected
    if (selectedReports.length === 0) {
      showWarningToast("Please select reports to compare");
      router.push("/history");
    } else if (selectedReports.length === 2) {
      showInfoToast("Comparing the selected reports");
    }
  }, [selectedReports, router, showWarningToast, showInfoToast]);

  // Don't render anything if no reports are selected (will redirect)
  if (selectedReports.length === 0) return null;

  // If only one report is selected, show a message
  if (selectedReports.length === 1) {
    return (
      <div className="py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Compare Reports
        </h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            Please select one more report to compare. Currently you have
            selected only one report.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/history"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to History
            </Link>
            <button
              onClick={() => {
                clearSelectedReports();
                showInfoToast("Selection cleared");
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Compare Reports
        </h2>
        <div className="flex space-x-4">
          <Link
            href="/history"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to History
          </Link>
          <button
            onClick={() => {
              clearSelectedReports();
              showInfoToast("Selection cleared");
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Selection
          </button>
        </div>
      </div>

      <ComparisonTable reports={selectedReports} />
    </div>
  );
}
