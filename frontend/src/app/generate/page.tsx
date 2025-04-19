"use client";

import { DatePickerForm } from "@/components/forms/DatePickerForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { WeatherCard } from "@/components/ui/WeatherCard";
import { useToast } from "@/context/ToastContext";
import type { WeatherReport } from "@/context/WeatherContext";
import { useWeather } from "@/context/WeatherContext";
import type { WeatherRequestFormData } from "@/schemas/weather";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

// GraphQL queries and mutations
const GET_WEATHER_REPORT = gql`
  query GetWeatherReport($date: String) {
    weatherReport(date: $date) {
      id
      timestamp
      temperature
      pressure
      humidity
      cloudCover
    }
  }
`;

const SAVE_WEATHER_REPORT = gql`
  mutation SaveWeatherReport($input: WeatherReportInput!) {
    saveWeatherReport(input: $input) {
      success
      message
      report {
        id
        timestamp
        temperature
        pressure
        humidity
        cloudCover
      }
    }
  }
`;

export default function GeneratePage() {
  const [currentReport, setCurrentReport] = useState<WeatherReport | null>(
    null
  );
  const { addReport } = useWeather();
  const { showSuccessToast, showErrorToast, showInfoToast } = useToast();

  const [getWeatherReport, { loading: loadingGet }] = useMutation(
    GET_WEATHER_REPORT,
    {
      onCompleted: (data) => {
        if (data?.weatherReport) {
          setCurrentReport(data.weatherReport);
          showInfoToast("Weather report generated");
        }
      },
      onError: (error) => {
        console.error("Error fetching weather report:", error);
        showErrorToast("Failed to fetch weather report. Please try again.");
      },
    }
  );

  const [saveWeatherReport, { loading: loadingSave }] = useMutation(
    SAVE_WEATHER_REPORT,
    {
      onCompleted: (data) => {
        if (
          data?.saveWeatherReport?.success &&
          data?.saveWeatherReport?.report
        ) {
          addReport(data.saveWeatherReport.report);
          showSuccessToast("Weather report saved successfully!");
        }
      },
      onError: (error) => {
        console.error("Error saving weather report:", error);
        showErrorToast("Failed to save weather report. Please try again.");
      },
    }
  );

  const handleGenerateReport = async (data: WeatherRequestFormData) => {
    await getWeatherReport({
      variables: {
        date: data.date?.toISOString(),
      },
    });
  };

  const handleSaveReport = async () => {
    if (!currentReport) return;

    await saveWeatherReport({
      variables: {
        input: {
          timestamp: currentReport.timestamp,
          temperature: currentReport.temperature,
          pressure: currentReport.pressure,
          humidity: currentReport.humidity,
          cloudCover: currentReport.cloudCover,
        },
      },
    });
  };

  const isLoading = loadingGet || loadingSave;

  return (
    <div className="py-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Generate Weather Report
      </h2>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
        <div className="max-w-md">
          <DatePickerForm
            onSubmit={handleGenerateReport}
            isLoading={isLoading}
          />
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && currentReport && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Current Weather Report
            </h3>
            <button
              onClick={handleSaveReport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Report
            </button>
          </div>
          <WeatherCard report={currentReport} />
        </div>
      )}
    </div>
  );
}
