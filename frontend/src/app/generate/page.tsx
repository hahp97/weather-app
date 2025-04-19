"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { AuthModal } from "@/components/modal/AuthModal";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import { useWeather } from "@/context/WeatherContext";
import FetchHistoricalWeatherMutation from "@/graphql/mutation/weather/fetch-historical-weather.gql";
import GenerateWeatherReportMutation from "@/graphql/mutation/weather/generate-weather-report.gql";
import CurrentWeatherQuery from "@/graphql/query/weather/current-weather.gql";
import GetWeatherReportsQuery from "@/graphql/query/weather/get-reports.gql";
import GetWeatherDataInRangeQuery from "@/graphql/query/weather/get-weather-data-in-range.gql";
import {
  cn,
  formatDate,
  formatDateForInput,
  formatDateTime,
} from "@/utils/common";
import { useMutation, useQuery } from "@apollo/client";
import {
  AlertTriangle,
  ArrowUpDown,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GeneratePage() {
  const { user, loading: userLoading } = useUser();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubscriptionError, setIsSubscriptionError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoricalData, setShowHistoricalData] = useState(false);
  const [historicalDataPoints, setHistoricalDataPoints] = useState<
    WeatherData[]
  >([]);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [sortField, setSortField] = useState("ts");
  const [sortOrder, setSortOrder] = useState("desc");

  const [showDataPointsView, setShowDataPointsView] = useState(false);

  const [dataPointsDateRange, setDataPointsDateRange] = useState({
    startTime: new Date(new Date().setHours(0, 0, 0, 0)),
    endTime: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  const { addReport } = useWeather();
  const toast = useToast();

  useEffect(() => {
    if (!userLoading && !user) {
    }
  }, [user, userLoading]);

  const { refetch: refetchCurrentWeather } = useQuery(CurrentWeatherQuery, {
    fetchPolicy: "network-only",
    skip: true,
  });

  const { refetch: refetchWeatherReports } = useQuery(GetWeatherReportsQuery, {
    fetchPolicy: "network-only",
    skip: true,
  });

  const { refetch: refetchWeatherDataInRange } = useQuery(
    GetWeatherDataInRangeQuery,
    {
      fetchPolicy: "network-only",
      skip: true,
      variables: {
        range: {
          startTime: dataPointsDateRange.startTime.toISOString(),
          endTime: dataPointsDateRange.endTime.toISOString(),
        },
        first: pageSize,
        skip: (currentPage - 1) * pageSize,
        sortField: sortField,
        sortOrder: sortOrder,
      },
    }
  );

  const [fetchHistoricalWeather] = useMutation(FetchHistoricalWeatherMutation);
  const [generateWeatherReport] = useMutation(GenerateWeatherReportMutation);

  const filterByHour = (hour: number | null) => {
    setSelectedHour(hour);

    if (!date) return;

    const selectedDate = new Date(date);

    if (hour === null) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      setIsLoading(true);
      refetchWeatherDataInRange({
        variables: {
          range: {
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
          },
          first: pageSize,
          skip: 0,
          sortField: sortField,
          sortOrder: sortOrder,
        },
      })
        .then(({ data: dataPointsData }) => {
          if (
            dataPointsData?.weatherDataInRange &&
            dataPointsData.weatherDataInRange.length > 0
          ) {
            setHistoricalDataPoints(dataPointsData.weatherDataInRange);
            setTotalItems(dataPointsData.weatherDataMeta.count);
            setTotalPages(
              Math.ceil(dataPointsData.weatherDataMeta.count / pageSize)
            );
            toast.success(
              `Found ${dataPointsData.weatherDataMeta.count} data points`
            );
          } else {
            setHistoricalDataPoints([]);
            setTotalItems(0);
            setTotalPages(1);
            toast.info("No data points found for the selected date range");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data points:", error);
          setErrorMessage("Failed to fetch data points. Please try again.");
          toast.error("Failed to fetch data points. Please try again.");
          setIsLoading(false);
        });
    } else {
      const hourStart = new Date(selectedDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(selectedDate);
      hourEnd.setHours(hour, 59, 59, 999);

      setIsLoading(true);
      refetchWeatherDataInRange({
        variables: {
          range: {
            startTime: hourStart.toISOString(),
            endTime: hourEnd.toISOString(),
          },
          first: pageSize,
          skip: 0,
          sortField: sortField,
          sortOrder: sortOrder,
        },
      })
        .then(({ data: historicalData }) => {
          if (
            historicalData?.weatherDataInRange &&
            historicalData.weatherDataInRange.length > 0
          ) {
            setHistoricalDataPoints(historicalData.weatherDataInRange);
            setTotalItems(historicalData.weatherDataMeta.count);
            setTotalPages(
              Math.ceil(historicalData.weatherDataMeta.count / pageSize)
            );
          } else {
            setHistoricalDataPoints([]);
            setTotalItems(0);
            setTotalPages(1);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(`Error fetching hour ${hour} data:`, error);
          setIsLoading(false);
        });
    }
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);

    setCurrentPage(1);
  };

  const changeSortField = (field: string) => {
    if (field === sortField) {
      toggleSortOrder();
    } else {
      setSortField(field);
      setSortOrder("desc");

      setCurrentPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleGenerateReport = async () => {
    setErrorMessage(null);
    setIsSubscriptionError(false);
    setIsLoading(true);
    setWeatherData(null);
    setHistoricalDataPoints([]);
    setShowHistoricalData(false);

    try {
      if (!date) {
        const { data } = await refetchCurrentWeather();
        if (data?.currentWeather) {
          setWeatherData(data.currentWeather);
          toast.success("Current weather data loaded");

          setHistoricalDataPoints([]);
          setShowHistoricalData(false);
          setSelectedHour(null);
        }
      } else {
        setShowHistoricalData(true);

        const selectedDate = new Date(date);
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        try {
          const { data: historicalData } = await refetchWeatherDataInRange({
            variables: {
              range: {
                startTime: startOfDay.toISOString(),
                endTime: endOfDay.toISOString(),
              },
              first: pageSize,
              skip: 0,
              sortField: sortField,
              sortOrder: sortOrder,
            },
          });

          if (
            historicalData?.weatherDataInRange &&
            historicalData.weatherDataInRange.length > 0
          ) {
            setHistoricalDataPoints(historicalData.weatherDataInRange);

            if (historicalData.weatherDataMeta?.count !== undefined) {
              setTotalItems(historicalData.weatherDataMeta.count);
              setTotalPages(
                Math.ceil(historicalData.weatherDataMeta.count / pageSize)
              );
            }

            const mostRecent = [...historicalData.weatherDataInRange].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )[0];
            setWeatherData(mostRecent);

            toast.success(
              `Found ${
                historicalData.weatherDataMeta?.count || "multiple"
              } historical data points`
            );
          } else {
            if (!user) {
              await fetchHistoricalWeatherData();
            } else {
              setHistoricalDataPoints([]);
              toast.error("No historical data found for selected date");
            }
          }
        } catch (error) {
          console.error("Error fetching historical data:", error);
          if (!user) {
            await fetchHistoricalWeatherData();
          } else {
            toast.error("Failed to fetch historical data");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      const errorMsg = "Failed to fetch weather data. Please try again later.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHistoricalWeatherData = async () => {
    const { data } = await fetchHistoricalWeather({
      variables: { date: date?.toISOString() },
    });

    if (data?.fetchHistoricalWeatherData?.success) {
      const historicalData = data.fetchHistoricalWeatherData.extra?.weather;
      if (historicalData) {
        setWeatherData(historicalData);
        // Reset historical data points when using the API
        setHistoricalDataPoints([]);
        setShowHistoricalData(false);
        setSelectedHour(null);
        toast.success("Historical weather data loaded");
      } else {
        const errorMsg = "No historical weather data available";
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } else {
      const error =
        data?.fetchHistoricalWeatherData?.errors?.[0]?.message ||
        data?.fetchHistoricalWeatherData?.message ||
        "Failed to load historical weather data";

      if (error.includes("subscription") || error.includes("OpenWeather")) {
        setIsSubscriptionError(true);
        const subscriptionErrorMsg =
          "Historical data requires a paid OpenWeather API subscription. Please use current weather or contact administrator to upgrade.";
        setErrorMessage(subscriptionErrorMsg);
        toast.error(subscriptionErrorMsg);
      } else {
        setErrorMessage(error);
        toast.error(error);
      }
    }
  };

  const saveDataPointAsReport = async (dataPoint: WeatherData) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const pointTime = new Date(dataPoint.timestamp);
      const startTime = new Date(pointTime);
      startTime.setMinutes(pointTime.getMinutes() - 5);
      const endTime = new Date(pointTime);
      endTime.setMinutes(pointTime.getMinutes() + 5);

      const { data } = await generateWeatherReport({
        variables: {
          input: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            title: `Weather Report for ${formatDate(
              pointTime
            )} at ${pointTime.getHours()}:${
              pointTime.getMinutes() < 10 ? "0" : ""
            }${pointTime.getMinutes()}`,
          },
        },
      });

      if (data?.generateWeatherReport?.success) {
        const reportData =
          data.generateWeatherReport.data?.report ||
          data.generateWeatherReport.extra?.report;

        if (reportData) {
          handleReportData(reportData);
        } else {
          toast.success("Weather report saved successfully");
        }
      } else {
        const error =
          data?.generateWeatherReport?.errors?.[0]?.message ||
          data?.generateWeatherReport?.message ||
          "Failed to save data point as report";
        setErrorMessage(error);
        toast.error(error);
      }
    } catch (error) {
      console.error("Error saving data point as report:", error);
      toast.error("Failed to save data point as report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!weatherData) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const reportDate = date || new Date();
      const startOfDay = new Date(reportDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(reportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data } = await generateWeatherReport({
        variables: {
          input: {
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
            title: `Weather Report for ${formatDate(reportDate)}`,
          },
        },
      });

      if (data?.generateWeatherReport?.success) {
        console.log("Generate report response:", data.generateWeatherReport);

        const reportData =
          data.generateWeatherReport.data?.report ||
          data.generateWeatherReport.extra?.report;

        if (reportData) {
          handleReportData(reportData);
        } else {
          try {
            const { data: reportsData } = await refetchWeatherReports();

            if (
              reportsData?.weatherReports &&
              reportsData.weatherReports.length > 0
            ) {
              const reports = [...reportsData.weatherReports];
              reports.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );

              const latestReport = reports[0];
              handleReportData(latestReport);
            } else {
              toast.success(
                "Weather report saved successfully, but couldn't fetch the details"
              );
            }
          } catch (fetchError) {
            console.error(
              "Error fetching reports after generation:",
              fetchError
            );
            toast.success(
              "Weather report saved successfully, but couldn't fetch the details"
            );
          }
        }
      } else {
        const error =
          data?.generateWeatherReport?.errors?.[0]?.message ||
          data?.generateWeatherReport?.message ||
          "Failed to generate weather report";
        setErrorMessage(error);
        toast.error(error);
      }
    } catch (error) {
      console.error("Error generating weather report:", error);
      const errorMsg = "Failed to generate weather report";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportData = (reportData: WeatherReport) => {
    const formattedReport = {
      id: reportData.id,
      title: reportData.title,
      startTime: reportData.startTime,
      endTime: reportData.endTime,
      avgTemperature: reportData.avgTemperature || 0,
      avgPressure: reportData.avgPressure || 0,
      avgHumidity: reportData.avgHumidity || 0,
      avgCloudCover: reportData.avgCloudCover || 0,
      avgWindSpeed: reportData.avgWindSpeed || 0,
      dataPointsCount: reportData.dataPointsCount || 0,
      createdAt: reportData.createdAt,
      updatedAt: reportData.updatedAt,
      timestamp: reportData.createdAt || new Date().toISOString(),
      temperature: reportData.avgTemperature || 0,
      pressure: reportData.avgPressure || 0,
      humidity: reportData.avgHumidity || 0,
      cloudCover: reportData.avgCloudCover || 0,
    };

    addReport(formattedReport);
    toast.success("Weather report saved successfully");
  };

  const handleDataPointsDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "startTime" | "endTime"
  ) => {
    const inputValue = e.target.value; // Format: YYYY-MM-DD

    const date = new Date(inputValue);

    if (field === "startTime") {
      date.setHours(0, 0, 0, 0);
    } else {
      date.setHours(23, 59, 59, 999);
    }

    setDataPointsDateRange((prev) => ({
      ...prev,
      [field]: date,
    }));
    setCurrentPage(1);
  };

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const localDate = new Date(selectedDate);
      localDate.setHours(0, 0, 0, 0);
      setDate(localDate);
    } else {
      setDate(undefined);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        returnUrl="/generate"
        featureName={weatherData ? "Save Weather Report" : "View Weather Data"}
      />

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {showDataPointsView
            ? "Weather Data Points"
            : "Weather Report Generator"}
        </h1>
        <div className="flex items-center space-x-2">
          {user && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowDataPointsView(!showDataPointsView);
                if (!showDataPointsView) {
                  // Switching to data points view
                  // Reset state
                  setCurrentPage(1);
                  setHistoricalDataPoints([]);

                  // Ensure we have valid date range values
                  const today = new Date();
                  const startOfDay = new Date(today);
                  startOfDay.setHours(0, 0, 0, 0);
                  const endOfDay = new Date(today);
                  endOfDay.setHours(23, 59, 59, 999);

                  // Update the date range state first, then fetch data
                  setDataPointsDateRange({
                    startTime: startOfDay,
                    endTime: endOfDay,
                  });

                  // Use a short timeout to ensure state is updated before fetching
                  setTimeout(() => {
                    try {
                      setIsLoading(true);
                      console.log("Fetching data points with range:", {
                        startTime: startOfDay.toISOString(),
                        endTime: endOfDay.toISOString(),
                      });

                      // Call the fetch function directly with the values to avoid state timing issues
                      refetchWeatherDataInRange({
                        variables: {
                          range: {
                            startTime: startOfDay.toISOString(),
                            endTime: endOfDay.toISOString(),
                          },
                          first: pageSize,
                          skip: 0,
                          sortField: sortField,
                          sortOrder: sortOrder,
                        },
                      })
                        .then(({ data: dataPointsData }) => {
                          if (
                            dataPointsData?.weatherDataInRange &&
                            dataPointsData.weatherDataInRange.length > 0
                          ) {
                            setHistoricalDataPoints(
                              dataPointsData.weatherDataInRange
                            );
                            setTotalItems(dataPointsData.weatherDataMeta.count);
                            setTotalPages(
                              Math.ceil(
                                dataPointsData.weatherDataMeta.count / pageSize
                              )
                            );
                            toast.success(
                              `Found ${dataPointsData.weatherDataMeta.count} data points`
                            );
                          } else {
                            setHistoricalDataPoints([]);
                            setTotalItems(0);
                            setTotalPages(1);
                            toast.info(
                              "No data points found for the selected date range"
                            );
                          }
                          setIsLoading(false);
                        })
                        .catch((error) => {
                          console.error("Error fetching data points:", error);
                          setErrorMessage(
                            "Failed to fetch data points. Please try again."
                          );
                          toast.error(
                            "Failed to fetch data points. Please try again."
                          );
                          setIsLoading(false);
                        });
                    } catch (error) {
                      console.error(
                        "Error setting up data points fetch:",
                        error
                      );
                      setIsLoading(false);
                    }
                  }, 0);
                }
              }}
            >
              {showDataPointsView ? "Generate Report" : "View Data Points"}
            </Button>
          )}
          <Link href="/history">
            <Button size="sm" variant="outline">
              View History
            </Button>
          </Link>
        </div>
      </div>

      {showDataPointsView ? (
        // Data Points View
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Date Range Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="startDate" className="text-sm font-medium">
                    Start Date:
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className="border rounded p-2"
                    value={formatDateForInput(dataPointsDateRange.startTime)}
                    onChange={(e) => handleDataPointsDateChange(e, "startTime")}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label htmlFor="endDate" className="text-sm font-medium">
                    End Date:
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    className="border rounded p-2"
                    value={formatDateForInput(dataPointsDateRange.endTime)}
                    onChange={(e) => handleDataPointsDateChange(e, "endTime")}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setCurrentPage(1);
                      setIsLoading(true);

                      try {
                        console.log("Applying filter with range:", {
                          startTime:
                            dataPointsDateRange.startTime.toISOString(),
                          endTime: dataPointsDateRange.endTime.toISOString(),
                        });

                        refetchWeatherDataInRange({
                          variables: {
                            range: {
                              startTime:
                                dataPointsDateRange.startTime.toISOString(),
                              endTime:
                                dataPointsDateRange.endTime.toISOString(),
                            },
                            first: pageSize,
                            skip: 0,
                            sortField: sortField,
                            sortOrder: sortOrder,
                          },
                        })
                          .then(({ data: dataPointsData }) => {
                            if (
                              dataPointsData?.weatherDataInRange &&
                              dataPointsData.weatherDataInRange.length > 0
                            ) {
                              setHistoricalDataPoints(
                                dataPointsData.weatherDataInRange
                              );
                              setTotalItems(
                                dataPointsData.weatherDataMeta.count
                              );
                              setTotalPages(
                                Math.ceil(
                                  dataPointsData.weatherDataMeta.count /
                                    pageSize
                                )
                              );
                              toast.success(
                                `Found ${dataPointsData.weatherDataMeta.count} data points`
                              );
                            } else {
                              setHistoricalDataPoints([]);
                              setTotalItems(0);
                              setTotalPages(1);
                              toast.info(
                                "No data points found for the selected date range"
                              );
                            }
                            setIsLoading(false);
                          })
                          .catch((error) => {
                            console.error("Error applying filter:", error);
                            setIsLoading(false);
                          });
                      } catch (error) {
                        console.error("Error applying filter:", error);
                        setIsLoading(false);
                      }
                    }}
                  >
                    Apply Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  Weather Data Points
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Collected every 5 minutes)
                  </span>
                </span>
                <div className="flex items-center space-x-2">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      handlePageSizeChange(Number(e.target.value));
                      setTimeout(() => {
                        setIsLoading(true);
                        refetchWeatherDataInRange({
                          variables: {
                            range: {
                              startTime:
                                dataPointsDateRange.startTime.toISOString(),
                              endTime:
                                dataPointsDateRange.endTime.toISOString(),
                            },
                            first: Number(e.target.value), // Use the new value directly
                            skip: 0, // Reset to first page
                            sortField: sortField,
                            sortOrder: sortOrder,
                          },
                        })
                          .then(({ data: dataPointsData }) => {
                            if (dataPointsData?.weatherDataInRange) {
                              setHistoricalDataPoints(
                                dataPointsData.weatherDataInRange
                              );
                              setTotalItems(
                                dataPointsData.weatherDataMeta.count
                              );
                              setTotalPages(
                                Math.ceil(
                                  dataPointsData.weatherDataMeta.count /
                                    Number(e.target.value)
                                )
                              );
                              setIsLoading(false);
                            }
                          })
                          .catch((error) => {
                            console.error(
                              "Error with page size change:",
                              error
                            );
                            setIsLoading(false);
                          });
                      }, 0);
                    }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toggleSortOrder();
                      setTimeout(() => {
                        setIsLoading(true);
                        refetchWeatherDataInRange({
                          variables: {
                            range: {
                              startTime:
                                dataPointsDateRange.startTime.toISOString(),
                              endTime:
                                dataPointsDateRange.endTime.toISOString(),
                            },
                            first: pageSize,
                            skip: (currentPage - 1) * pageSize,
                            sortField: sortField,
                            sortOrder: sortOrder === "asc" ? "desc" : "asc", // Toggle from current state
                          },
                        })
                          .then(({ data: dataPointsData }) => {
                            if (dataPointsData?.weatherDataInRange) {
                              setHistoricalDataPoints(
                                dataPointsData.weatherDataInRange
                              );
                              setTotalItems(
                                dataPointsData.weatherDataMeta.count
                              );
                              setTotalPages(
                                Math.ceil(
                                  dataPointsData.weatherDataMeta.count /
                                    pageSize
                                )
                              );
                              setIsLoading(false);
                            }
                          })
                          .catch((error) => {
                            console.error("Error toggling sort order:", error);
                            setIsLoading(false);
                          });
                      }, 0);
                    }}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : errorMessage ? (
                <div className="text-red-500 py-4">
                  Error loading data: {errorMessage}
                </div>
              ) : historicalDataPoints.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Time</th>
                          <th className="border p-2 text-left">
                            Temperature (°C)
                          </th>
                          <th className="border p-2 text-left">
                            Pressure (hPa)
                          </th>
                          <th className="border p-2 text-left">Humidity (%)</th>
                          <th className="border p-2 text-left">
                            Cloud Cover (%)
                          </th>
                          <th className="border p-2 text-left">
                            Wind Speed (m/s)
                          </th>
                          <th className="border p-2 text-left">Condition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicalDataPoints.map((point: WeatherData) => (
                          <tr key={point.id} className="hover:bg-gray-50">
                            <td className="border p-2">
                              {formatDateTime(new Date(point.timestamp))}
                            </td>
                            <td className="border p-2">
                              {point.temperature.toFixed(1)}
                            </td>
                            <td className="border p-2">
                              {point.pressure.toFixed(0)}
                            </td>
                            <td className="border p-2">
                              {point.humidity.toFixed(0)}
                            </td>
                            <td className="border p-2">
                              {point.cloudCover.toFixed(0)}
                            </td>
                            <td className="border p-2">
                              {point.windSpeed?.toFixed(1) || "N/A"}
                            </td>
                            <td className="border p-2">
                              {point.weatherCondition || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handlePageChange(1);
                            setTimeout(() => {
                              setIsLoading(true);
                              refetchWeatherDataInRange({
                                variables: {
                                  range: {
                                    startTime:
                                      dataPointsDateRange.startTime.toISOString(),
                                    endTime:
                                      dataPointsDateRange.endTime.toISOString(),
                                  },
                                  first: pageSize,
                                  skip: 0, // first page
                                  sortField: sortField,
                                  sortOrder: sortOrder,
                                },
                              })
                                .then(({ data: dataPointsData }) => {
                                  if (dataPointsData?.weatherDataInRange) {
                                    setHistoricalDataPoints(
                                      dataPointsData.weatherDataInRange
                                    );
                                    setIsLoading(false);
                                  }
                                })
                                .catch((error) => {
                                  console.error(
                                    "Error fetching first page:",
                                    error
                                  );
                                  setIsLoading(false);
                                });
                            }, 0);
                          }}
                        >
                          First
                        </Button>
                        <Button
                          onClick={() => {
                            handlePageChange(currentPage - 1);
                            setTimeout(() => {
                              setIsLoading(true);
                              refetchWeatherDataInRange({
                                variables: {
                                  range: {
                                    startTime:
                                      dataPointsDateRange.startTime.toISOString(),
                                    endTime:
                                      dataPointsDateRange.endTime.toISOString(),
                                  },
                                  first: pageSize,
                                  skip: (currentPage - 2) * pageSize,
                                  sortField: sortField,
                                  sortOrder: sortOrder,
                                },
                              })
                                .then(({ data: dataPointsData }) => {
                                  if (dataPointsData?.weatherDataInRange) {
                                    setHistoricalDataPoints(
                                      dataPointsData.weatherDataInRange
                                    );
                                    setIsLoading(false);
                                  }
                                })
                                .catch((error) => {
                                  console.error(
                                    "Error fetching previous page:",
                                    error
                                  );
                                  setIsLoading(false);
                                });
                            }, 0);
                          }}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="px-2">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          onClick={() => {
                            handlePageChange(currentPage + 1);
                            setTimeout(() => {
                              setIsLoading(true);
                              refetchWeatherDataInRange({
                                variables: {
                                  range: {
                                    startTime:
                                      dataPointsDateRange.startTime.toISOString(),
                                    endTime:
                                      dataPointsDateRange.endTime.toISOString(),
                                  },
                                  first: pageSize,
                                  skip: currentPage * pageSize,
                                  sortField: sortField,
                                  sortOrder: sortOrder,
                                },
                              })
                                .then(({ data: dataPointsData }) => {
                                  if (dataPointsData?.weatherDataInRange) {
                                    setHistoricalDataPoints(
                                      dataPointsData.weatherDataInRange
                                    );
                                    setIsLoading(false);
                                  }
                                })
                                .catch((error) => {
                                  console.error(
                                    "Error fetching next page:",
                                    error
                                  );
                                  setIsLoading(false);
                                });
                            }, 0);
                          }}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            handlePageChange(totalPages);
                            setTimeout(() => {
                              setIsLoading(true);
                              refetchWeatherDataInRange({
                                variables: {
                                  range: {
                                    startTime:
                                      dataPointsDateRange.startTime.toISOString(),
                                    endTime:
                                      dataPointsDateRange.endTime.toISOString(),
                                  },
                                  first: pageSize,
                                  skip: (totalPages - 1) * pageSize,
                                  sortField: sortField,
                                  sortOrder: sortOrder,
                                },
                              })
                                .then(({ data: dataPointsData }) => {
                                  if (dataPointsData?.weatherDataInRange) {
                                    setHistoricalDataPoints(
                                      dataPointsData.weatherDataInRange
                                    );
                                    setIsLoading(false);
                                  }
                                })
                                .catch((error) => {
                                  console.error(
                                    "Error fetching last page:",
                                    error
                                  );
                                  setIsLoading(false);
                                });
                            }, 0);
                          }}
                          disabled={currentPage === totalPages}
                        >
                          Last
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-500 text-center">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalItems)} of{" "}
                    {totalItems} entries
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No weather data points found for the selected date range.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        // Original Report Generator View - keep existing content here
        <>
          <h1 className="text-3xl font-bold mb-8 text-center">
            Weather Report Generator
          </h1>

          {/* Info banner about historical data */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">About Historical Weather Data</p>
              <p>
                This application is using the OpenWeather API. Currently,
                historical weather data (searching by date) requires a paid
                OpenWeather API subscription plan. If you&apos;re experiencing
                issues with historical data, please use the current weather
                option instead.
              </p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                <div className="space-y-2 flex-1">
                  <label className="text-sm font-medium">
                    Date (leave empty for current time)
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? formatDate(date) : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleCalendarSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {date && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDate(undefined)}
                      className="text-xs text-blue-600"
                    >
                      Clear (Use current time)
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                  className={cn(
                    "px-8",
                    date
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {date ? "Generate Historical Data*" : "Generate Current Data"}
                </Button>
              </div>

              {date && (
                <div className="mt-2 text-xs text-amber-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>
                    Historical data may require a paid API subscription
                  </span>
                </div>
              )}

              {isSubscriptionError && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Subscription Required</p>
                    <p>
                      Historical weather data requires a paid OpenWeather API
                      subscription. Please use current weather data instead or
                      contact administrator.
                    </p>
                    <p className="mt-2">
                      <a
                        href="https://openweathermap.org/price"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        OpenWeather Subscription Plans
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex justify-center my-12">
              <LoadingSpinner />
            </div>
          )}

          {errorMessage && !isLoading && !isSubscriptionError && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {weatherData && !isLoading && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Weather Report</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatDate(new Date(weatherData.timestamp))}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <WeatherMetricCard
                      title="Temperature"
                      value={`${weatherData.temperature.toFixed(1)}°C`}
                      icon="🌡️"
                    />
                    <WeatherMetricCard
                      title="Pressure"
                      value={`${weatherData.pressure.toFixed(0)} hPa`}
                      icon="📊"
                    />
                    <WeatherMetricCard
                      title="Humidity"
                      value={`${weatherData.humidity.toFixed(0)}%`}
                      icon="💧"
                    />
                    <WeatherMetricCard
                      title="Cloud Cover"
                      value={`${weatherData.cloudCover.toFixed(0)}%`}
                      icon="☁️"
                    />
                  </div>

                  {weatherData.weatherCondition && (
                    <div className="mt-6 text-center">
                      <p className="text-lg font-medium">
                        {weatherData.weatherCondition}
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex justify-center">
                    <Button onClick={handleSaveReport} disabled={isLoading}>
                      {user ? "Save Weather Report" : "Save Report"}
                    </Button>
                  </div>

                  {!user && (
                    <div className="mt-4 text-sm text-yellow-600 flex items-center gap-2 bg-yellow-50 p-3 rounded-md">
                      <AlertTriangle size={16} />
                      <span>You must be logged in to save weather reports</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Historical Data Points Section */}
          {showHistoricalData && (
            <Card className="col-span-full mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Weather Data for {date ? formatDate(date) : ""}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={selectedHour === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      filterByHour(null);

                      // Make sure this is updated immediately
                      const selectedDate = new Date(date!);
                      const startOfDay = new Date(selectedDate);
                      startOfDay.setHours(0, 0, 0, 0);
                      const endOfDay = new Date(selectedDate);
                      endOfDay.setHours(23, 59, 59, 999);

                      // Fetch with proper range
                      setIsLoading(true);
                      refetchWeatherDataInRange({
                        variables: {
                          range: {
                            startTime: startOfDay.toISOString(),
                            endTime: endOfDay.toISOString(),
                          },
                          first: pageSize,
                          skip: 0,
                          sortField: sortField,
                          sortOrder: sortOrder,
                        },
                      })
                        .then(({ data: historicalData }) => {
                          if (
                            historicalData?.weatherDataInRange &&
                            historicalData.weatherDataInRange.length > 0
                          ) {
                            setHistoricalDataPoints(
                              historicalData.weatherDataInRange
                            );
                            setTotalItems(historicalData.weatherDataMeta.count);
                            setTotalPages(
                              Math.ceil(
                                historicalData.weatherDataMeta.count / pageSize
                              )
                            );
                          } else {
                            setHistoricalDataPoints([]);
                            setTotalItems(0);
                            setTotalPages(1);
                          }
                          setIsLoading(false);
                        })
                        .catch((error) => {
                          console.error(
                            "Error fetching all hours data:",
                            error
                          );
                          setIsLoading(false);
                        });
                    }}
                  >
                    All Hours
                  </Button>
                  {Array.from(
                    new Set(
                      Array.from({ length: 24 }, (_, i) => i) // Generate all 24 hours
                    )
                  )
                    .sort((a, b) => a - b)
                    .map((hour) => (
                      <Button
                        key={hour}
                        variant={selectedHour === hour ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          filterByHour(hour);

                          // Make sure this is updated immediately
                          const selectedDate = new Date(date!);
                          const hourStart = new Date(selectedDate);
                          hourStart.setHours(hour, 0, 0, 0);
                          const hourEnd = new Date(selectedDate);
                          hourEnd.setHours(hour, 59, 59, 999);

                          // Fetch with proper range
                          setIsLoading(true);
                          refetchWeatherDataInRange({
                            variables: {
                              range: {
                                startTime: hourStart.toISOString(),
                                endTime: hourEnd.toISOString(),
                              },
                              first: pageSize,
                              skip: 0,
                              sortField: sortField,
                              sortOrder: sortOrder,
                            },
                          })
                            .then(({ data: historicalData }) => {
                              if (
                                historicalData?.weatherDataInRange &&
                                historicalData.weatherDataInRange.length > 0
                              ) {
                                setHistoricalDataPoints(
                                  historicalData.weatherDataInRange
                                );
                                setTotalItems(
                                  historicalData.weatherDataMeta.count
                                );
                                setTotalPages(
                                  Math.ceil(
                                    historicalData.weatherDataMeta.count /
                                      pageSize
                                  )
                                );
                              } else {
                                setHistoricalDataPoints([]);
                                setTotalItems(0);
                                setTotalPages(1);
                              }
                              setIsLoading(false);
                            })
                            .catch((error) => {
                              console.error(
                                `Error fetching hour ${hour} data:`,
                                error
                              );
                              setIsLoading(false);
                            });
                        }}
                      >
                        {hour}:00
                      </Button>
                    ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      Items per page:
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) =>
                        handlePageSizeChange(Number(e.target.value))
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10 per page</option>
                      <option value={20}>20 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSortOrder()}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : historicalDataPoints.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th
                              className="border p-2 text-left cursor-pointer hover:bg-gray-200"
                              onClick={() => changeSortField("ts")}
                            >
                              Time{" "}
                              {sortField === "ts" && (
                                <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </th>
                            <th
                              className="border p-2 text-left cursor-pointer hover:bg-gray-200"
                              onClick={() => changeSortField("temperature")}
                            >
                              Temperature (°C){" "}
                              {sortField === "temperature" && (
                                <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </th>
                            <th
                              className="border p-2 text-left cursor-pointer hover:bg-gray-200"
                              onClick={() => changeSortField("humidity")}
                            >
                              Humidity (%){" "}
                              {sortField === "humidity" && (
                                <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </th>
                            <th
                              className="border p-2 text-left cursor-pointer hover:bg-gray-200"
                              onClick={() => changeSortField("pressure")}
                            >
                              Pressure (hPa){" "}
                              {sortField === "pressure" && (
                                <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                              )}
                            </th>
                            <th className="border p-2 text-left">
                              Wind Speed (m/s)
                            </th>
                            <th className="border p-2 text-left">Condition</th>
                            <th className="border p-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historicalDataPoints.map((point) => {
                            const pointTime = new Date(point.timestamp);
                            return (
                              <tr key={point.id} className="hover:bg-gray-50">
                                <td className="border p-2">
                                  {`${pointTime.getHours()}:${
                                    pointTime.getMinutes() < 10 ? "0" : ""
                                  }${pointTime.getMinutes()}`}
                                </td>
                                <td className="border p-2">
                                  {point.temperature.toFixed(1)}
                                </td>
                                <td className="border p-2">{point.humidity}</td>
                                <td className="border p-2">{point.pressure}</td>
                                <td className="border p-2">
                                  {point.windSpeed?.toFixed(1) || "N/A"}
                                </td>
                                <td className="border p-2">
                                  {point.weatherCondition || "N/A"}
                                </td>
                                <td className="border p-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => saveDataPointAsReport(point)}
                                    title="Save this data point as a report"
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex justify-center">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handlePageChange(1);
                              setTimeout(() => {
                                setIsLoading(true);
                                refetchWeatherDataInRange({
                                  variables: {
                                    range: {
                                      startTime:
                                        dataPointsDateRange.startTime.toISOString(),
                                      endTime:
                                        dataPointsDateRange.endTime.toISOString(),
                                    },
                                    first: pageSize,
                                    skip: 0, // first page
                                    sortField: sortField,
                                    sortOrder: sortOrder,
                                  },
                                })
                                  .then(({ data: dataPointsData }) => {
                                    if (dataPointsData?.weatherDataInRange) {
                                      setHistoricalDataPoints(
                                        dataPointsData.weatherDataInRange
                                      );
                                      setIsLoading(false);
                                    }
                                  })
                                  .catch((error) => {
                                    console.error(
                                      "Error fetching first page:",
                                      error
                                    );
                                    setIsLoading(false);
                                  });
                              }, 0);
                            }}
                          >
                            First
                          </Button>
                          <Button
                            onClick={() => {
                              handlePageChange(currentPage - 1);
                              setTimeout(() => {
                                setIsLoading(true);
                                refetchWeatherDataInRange({
                                  variables: {
                                    range: {
                                      startTime:
                                        dataPointsDateRange.startTime.toISOString(),
                                      endTime:
                                        dataPointsDateRange.endTime.toISOString(),
                                    },
                                    first: pageSize,
                                    skip: (currentPage - 2) * pageSize,
                                    sortField: sortField,
                                    sortOrder: sortOrder,
                                  },
                                })
                                  .then(({ data: dataPointsData }) => {
                                    if (dataPointsData?.weatherDataInRange) {
                                      setHistoricalDataPoints(
                                        dataPointsData.weatherDataInRange
                                      );
                                      setIsLoading(false);
                                    }
                                  })
                                  .catch((error) => {
                                    console.error(
                                      "Error fetching previous page:",
                                      error
                                    );
                                    setIsLoading(false);
                                  });
                              }, 0);
                            }}
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="px-2">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            onClick={() => {
                              handlePageChange(currentPage + 1);
                              setTimeout(() => {
                                setIsLoading(true);
                                refetchWeatherDataInRange({
                                  variables: {
                                    range: {
                                      startTime:
                                        dataPointsDateRange.startTime.toISOString(),
                                      endTime:
                                        dataPointsDateRange.endTime.toISOString(),
                                    },
                                    first: pageSize,
                                    skip: currentPage * pageSize,
                                    sortField: sortField,
                                    sortOrder: sortOrder,
                                  },
                                })
                                  .then(({ data: dataPointsData }) => {
                                    if (dataPointsData?.weatherDataInRange) {
                                      setHistoricalDataPoints(
                                        dataPointsData.weatherDataInRange
                                      );
                                      setIsLoading(false);
                                    }
                                  })
                                  .catch((error) => {
                                    console.error(
                                      "Error fetching next page:",
                                      error
                                    );
                                    setIsLoading(false);
                                  });
                              }, 0);
                            }}
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              handlePageChange(totalPages);
                              setTimeout(() => {
                                setIsLoading(true);
                                refetchWeatherDataInRange({
                                  variables: {
                                    range: {
                                      startTime:
                                        dataPointsDateRange.startTime.toISOString(),
                                      endTime:
                                        dataPointsDateRange.endTime.toISOString(),
                                    },
                                    first: pageSize,
                                    skip: (totalPages - 1) * pageSize,
                                    sortField: sortField,
                                    sortOrder: sortOrder,
                                  },
                                })
                                  .then(({ data: dataPointsData }) => {
                                    if (dataPointsData?.weatherDataInRange) {
                                      setHistoricalDataPoints(
                                        dataPointsData.weatherDataInRange
                                      );
                                      setIsLoading(false);
                                    }
                                  })
                                  .catch((error) => {
                                    console.error(
                                      "Error fetching last page:",
                                      error
                                    );
                                    setIsLoading(false);
                                  });
                              }, 0);
                            }}
                            disabled={currentPage === totalPages}
                          >
                            Last
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-sm text-gray-500 text-center">
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, totalItems)} of{" "}
                      {totalItems} entries
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No data points available for the selected date and filter
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function WeatherMetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 flex items-center">
      <div className="mr-4 text-2xl">{icon}</div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
