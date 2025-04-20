import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import { useWeather } from "@/context/WeatherContext";
import SaveWeatherReportMutation from "@/graphql/mutation/weather/save-weather-report.gql";
import CurrentWeatherQuery from "@/graphql/query/weather/current-weather.gql";
import GetWeatherDataInRangeQuery from "@/graphql/query/weather/get-weather-data-in-range.gql";
import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import {
  useWeatherReducer,
  WeatherData,
  WeatherReport,
} from "./useWeatherReducer";

export function useWeatherData() {
  // Set this to true if user has premium subscription
  const [isPremiumUser] = useState(false);

  const {
    state,
    setDate,
    setWeatherData,
    setLoading,
    setError,
    setSubscriptionError,
    setShowAuthModal,
    setShowHistoricalData,
    setHistoricalDataPoints,
    setSelectedHour,
    setCurrentPage,
    setPageSize,
    setSortField,
    setSortOrder,
    toggleSortOrder,
    setShowDataPointsView,
    setDataPointsDateRange,
    resetData,
    updatePagination,
  } = useWeatherReducer();

  const { user } = useUser();
  const { addReport } = useWeather();
  const toast = useToast();

  // Set up graphql queries
  const { refetch: refetchCurrentWeather } = useQuery(CurrentWeatherQuery, {
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
          startTime: state.dataPointsDateRange.startTime.toISOString(),
          endTime: state.dataPointsDateRange.endTime.toISOString(),
        },
        first: state.pageSize,
        skip: (state.currentPage - 1) * state.pageSize,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
      },
    }
  );

  const [saveWeatherReport] = useMutation(SaveWeatherReportMutation);

  const filterByHour = async (hour: number | null) => {
    if (!isPremiumUser) {
      setSubscriptionError(true);
      setError(
        "Historical data requires a paid subscription. Please upgrade to access this feature."
      );
      toast.error("Premium subscription required for historical data");
      return;
    }

    setSelectedHour(hour);

    if (!state.date) return;

    const selectedDate = new Date(state.date);

    if (hour === null) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      setLoading(true);
      try {
        const { data: dataPointsData } = await refetchWeatherDataInRange({
          variables: {
            range: {
              startTime: startOfDay.toISOString(),
              endTime: endOfDay.toISOString(),
            },
            first: state.pageSize,
            skip: 0,
            sortField: state.sortField,
            sortOrder: state.sortOrder,
          },
        });

        if (
          dataPointsData?.weatherDataInRange &&
          dataPointsData.weatherDataInRange.length > 0
        ) {
          setHistoricalDataPoints(dataPointsData.weatherDataInRange);
          updatePagination(
            dataPointsData.weatherDataMeta.count,
            state.pageSize
          );
          toast.success(
            `Found ${dataPointsData.weatherDataMeta.count} data points`
          );
        } else {
          setHistoricalDataPoints([]);
          updatePagination(0, state.pageSize);
          toast.info("No data points found for the selected date range");
        }
      } catch (error) {
        console.error("Error fetching data points:", error);
        setError("Failed to fetch data points. Please try again.");
        toast.error("Failed to fetch data points. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      const hourStart = new Date(selectedDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(selectedDate);
      hourEnd.setHours(hour, 59, 59, 999);

      setLoading(true);
      try {
        const { data: historicalData } = await refetchWeatherDataInRange({
          variables: {
            range: {
              startTime: hourStart.toISOString(),
              endTime: hourEnd.toISOString(),
            },
            first: state.pageSize,
            skip: 0,
            sortField: state.sortField,
            sortOrder: state.sortOrder,
          },
        });

        if (
          historicalData?.weatherDataInRange &&
          historicalData.weatherDataInRange.length > 0
        ) {
          setHistoricalDataPoints(historicalData.weatherDataInRange);
          updatePagination(
            historicalData.weatherDataMeta.count,
            state.pageSize
          );
        } else {
          setHistoricalDataPoints([]);
          updatePagination(0, state.pageSize);
        }
      } catch (error) {
        console.error(`Error fetching hour ${hour} data:`, error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleSortOrder = async () => {
    toggleSortOrder();
    setCurrentPage(1);

    setLoading(true);
    try {
      const { data: dataPointsData } = await refetchWeatherDataInRange({
        variables: {
          range: {
            startTime: state.dataPointsDateRange.startTime.toISOString(),
            endTime: state.dataPointsDateRange.endTime.toISOString(),
          },
          first: state.pageSize,
          skip: 0,
          sortField: state.sortField,
          sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
        },
      });

      if (
        dataPointsData?.weatherDataInRange &&
        dataPointsData.weatherDataInRange.length > 0
      ) {
        setHistoricalDataPoints(dataPointsData.weatherDataInRange);
      } else {
        setHistoricalDataPoints([]);
      }
    } catch (error) {
      console.error("Error fetching data with new sort order:", error);
      setError("Failed to update sort order. Please try again.");
      toast.error("Failed to update sort order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeSortField = async (field: string) => {
    if (field === state.sortField) {
      handleToggleSortOrder();
    } else {
      setSortField(field);
      setSortOrder("desc");
      setCurrentPage(1);

      setLoading(true);
      try {
        const { data: dataPointsData } = await refetchWeatherDataInRange({
          variables: {
            range: {
              startTime: state.dataPointsDateRange.startTime.toISOString(),
              endTime: state.dataPointsDateRange.endTime.toISOString(),
            },
            first: state.pageSize,
            skip: 0,
            sortField: field,
            sortOrder: "desc",
          },
        });

        if (
          dataPointsData?.weatherDataInRange &&
          dataPointsData.weatherDataInRange.length > 0
        ) {
          setHistoricalDataPoints(dataPointsData.weatherDataInRange);
        } else {
          setHistoricalDataPoints([]);
        }
      } catch (error) {
        console.error("Error fetching data with new sort field:", error);
        setError("Failed to update sort field. Please try again.");
        toast.error("Failed to update sort field. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = async (page: number) => {
    if (page < 1 || page > state.totalPages) return;
    setCurrentPage(page);

    setLoading(true);
    try {
      const { data: dataPointsData } = await refetchWeatherDataInRange({
        variables: {
          range: {
            startTime: state.dataPointsDateRange.startTime.toISOString(),
            endTime: state.dataPointsDateRange.endTime.toISOString(),
          },
          first: state.pageSize,
          skip: (page - 1) * state.pageSize,
          sortField: state.sortField,
          sortOrder: state.sortOrder,
        },
      });

      if (
        dataPointsData?.weatherDataInRange &&
        dataPointsData.weatherDataInRange.length > 0
      ) {
        setHistoricalDataPoints(dataPointsData.weatherDataInRange);
      } else {
        setHistoricalDataPoints([]);
      }
    } catch (error) {
      console.error("Error fetching page data:", error);
      setError("Failed to fetch page data. Please try again.");
      toast.error("Failed to fetch page data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = async (size: number) => {
    setPageSize(size);
    setCurrentPage(1);

    setLoading(true);
    try {
      const { data: dataPointsData } = await refetchWeatherDataInRange({
        variables: {
          range: {
            startTime: state.dataPointsDateRange.startTime.toISOString(),
            endTime: state.dataPointsDateRange.endTime.toISOString(),
          },
          first: size,
          skip: 0,
          sortField: state.sortField,
          sortOrder: state.sortOrder,
        },
      });

      if (
        dataPointsData?.weatherDataInRange &&
        dataPointsData.weatherDataInRange.length > 0
      ) {
        setHistoricalDataPoints(dataPointsData.weatherDataInRange);
        updatePagination(dataPointsData.weatherDataMeta.count, size);
      } else {
        setHistoricalDataPoints([]);
        updatePagination(0, size);
      }
    } catch (error) {
      console.error("Error fetching data with new page size:", error);
      setError("Failed to update page size. Please try again.");
      toast.error("Failed to update page size. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    resetData();
    setLoading(true);

    try {
      if (!state.date) {
        const { data } = await refetchCurrentWeather();
        if (data?.currentWeather) {
          setWeatherData(data.currentWeather);
          toast.success("Current weather data loaded");
        }
      } else {
        // Check if user has premium subscription for historical data
        if (!isPremiumUser) {
          setSubscriptionError(true);
          setError(
            "Historical data requires a paid subscription. Please upgrade to access this feature."
          );
          setLoading(false);
          toast.error("Premium subscription required for historical data");
          return;
        }

        setShowHistoricalData(true);

        const selectedDate = new Date(state.date);
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
              first: state.pageSize,
              skip: 0,
              sortField: state.sortField,
              sortOrder: state.sortOrder,
            },
          });

          if (
            historicalData?.weatherDataInRange &&
            historicalData.weatherDataInRange.length > 0
          ) {
            setHistoricalDataPoints(historicalData.weatherDataInRange);

            if (historicalData.weatherDataMeta?.count !== undefined) {
              updatePagination(
                historicalData.weatherDataMeta.count,
                state.pageSize
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
            setHistoricalDataPoints([]);
            toast.error("No historical data found for selected date");
          }
        } catch (error) {
          console.error("Error fetching historical data:", error);
          toast.error("Failed to fetch historical data");
        }
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      const errorMsg = "Failed to fetch weather data. Please try again later.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Save a data point as a weather report
  const saveDataPointAsReport = async (dataPoint: WeatherData) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const pointTime = new Date(dataPoint.timestamp);

      // Create time window (5 minutes before and after) in UTC
      const startTime = new Date(pointTime);
      startTime.setMinutes(pointTime.getMinutes() - 5);
      const endTime = new Date(pointTime);
      endTime.setMinutes(pointTime.getMinutes() + 5);

      const formattedTime = pointTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const { data } = await saveWeatherReport({
        variables: {
          input: {
            title: `Weather Report for ${pointTime.toLocaleDateString()} at ${formattedTime}`,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            temperature: dataPoint.temperature,
            pressure: dataPoint.pressure,
            humidity: dataPoint.humidity,
            cloudCover: dataPoint.cloudCover,
          },
        },
      });

      if (data?.saveWeatherReport?.success) {
        const reportData =
          data.saveWeatherReport.data?.report || data.saveWeatherReport.report;

        if (reportData) {
          handleReportData(reportData);
        } else {
          toast.success("Weather report saved successfully");
        }
      } else {
        const error =
          data?.saveWeatherReport?.errors?.[0]?.message ||
          data?.saveWeatherReport?.message ||
          "Failed to save data point as report";
        setError(error);
        toast.error(error);
      }
    } catch (error) {
      console.error("Error saving data point as report:", error);
      toast.error("Failed to save data point as report");
    } finally {
      setLoading(false);
    }
  };

  // Handle saving the weather report
  const handleSaveReport = async () => {
    if (!state.weatherData) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const reportDate = state.date || new Date();
      const startOfDay = new Date(reportDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(reportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data } = await saveWeatherReport({
        variables: {
          input: {
            title: `Weather Report for ${reportDate.toLocaleDateString()}`,
            startTime: startOfDay.toISOString(),
            endTime: endOfDay.toISOString(),
            temperature: state.weatherData.temperature,
            pressure: state.weatherData.pressure,
            humidity: state.weatherData.humidity,
            cloudCover: state.weatherData.cloudCover,
          },
        },
      });

      if (data?.saveWeatherReport?.success) {
        const reportData =
          data.saveWeatherReport.data?.report || data.saveWeatherReport.report;

        if (reportData) {
          handleReportData(reportData);
        } else {
          toast.success("Weather report saved successfully");
        }
      } else {
        const error =
          data?.saveWeatherReport?.errors?.[0]?.message ||
          data?.saveWeatherReport?.message ||
          "Failed to save weather report";
        setError(error);
        toast.error(error);
      }
    } catch (error) {
      console.error("Error saving weather report:", error);
      const errorMsg = "Failed to save weather report";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Process report data and add to context
  const handleReportData = (reportData: WeatherReport) => {
    const createdAt = reportData.createdAt
      ? new Date(reportData.createdAt).toISOString()
      : new Date().toISOString();

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
      createdAt: createdAt,
      updatedAt: reportData.updatedAt,
      timestamp: createdAt,
      temperature: reportData.avgTemperature || 0,
      pressure: reportData.avgPressure || 0,
      humidity: reportData.avgHumidity || 0,
      cloudCover: reportData.avgCloudCover || 0,
    };

    addReport(formattedReport);
    toast.success("Weather report saved successfully");
  };

  // Handle date range changes for data points view
  const handleDataPointsDateChange = (
    field: "startTime" | "endTime",
    date: Date
  ) => {
    setDataPointsDateRange({
      ...state.dataPointsDateRange,
      [field]: date,
    });
    setCurrentPage(1);
  };

  const applyDateRangeFilter = async () => {
    setCurrentPage(1);
    setLoading(true);

    try {
      const { data: dataPointsData } = await refetchWeatherDataInRange({
        variables: {
          range: {
            startTime: state.dataPointsDateRange.startTime.toISOString(),
            endTime: state.dataPointsDateRange.endTime.toISOString(),
          },
          first: state.pageSize,
          skip: 0,
          sortField: state.sortField,
          sortOrder: state.sortOrder,
        },
      });

      if (
        dataPointsData?.weatherDataInRange &&
        dataPointsData.weatherDataInRange.length > 0
      ) {
        setHistoricalDataPoints(dataPointsData.weatherDataInRange);
        updatePagination(dataPointsData.weatherDataMeta.count, state.pageSize);
        toast.success(
          `Found ${dataPointsData.weatherDataMeta.count} data points`
        );
      } else {
        setHistoricalDataPoints([]);
        updatePagination(0, state.pageSize);
        toast.info("No data points found for the selected date range");
      }
    } catch (error) {
      console.error("Error applying filter:", error);
      setError("Failed to apply filter. Please try again.");
      toast.error("Failed to apply filter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle between data points view and report generator view
  const toggleDataPointsView = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const newViewState = !state.showDataPointsView;
    setShowDataPointsView(newViewState);

    if (newViewState) {
      setCurrentPage(1);
      setHistoricalDataPoints([]);

      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      setDataPointsDateRange({
        startTime: startOfDay,
        endTime: endOfDay,
      });

      setLoading(true);
      try {
        const { data: dataPointsData } = await refetchWeatherDataInRange({
          variables: {
            range: {
              startTime: startOfDay.toISOString(),
              endTime: endOfDay.toISOString(),
            },
            first: state.pageSize,
            skip: 0,
            sortField: state.sortField,
            sortOrder: state.sortOrder,
          },
        });

        if (
          dataPointsData?.weatherDataInRange &&
          dataPointsData.weatherDataInRange.length > 0
        ) {
          setHistoricalDataPoints(dataPointsData.weatherDataInRange);
          updatePagination(
            dataPointsData.weatherDataMeta.count,
            state.pageSize
          );
          toast.success(
            `Found ${dataPointsData.weatherDataMeta.count} data points`
          );
        } else {
          setHistoricalDataPoints([]);
          updatePagination(0, state.pageSize);
          toast.info("No data points found for the selected date range");
        }
      } catch (error) {
        console.error("Error fetching data points:", error);
        setError("Failed to fetch data points. Please try again.");
        toast.error("Failed to fetch data points. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle calendar date selection
  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (!isPremiumUser && selectedDate) {
      setSubscriptionError(true);
      setError(
        "Historical data requires a paid subscription. Please upgrade to access this feature."
      );
      toast.error("Premium subscription required");
      return;
    }

    if (selectedDate) {
      const localDate = new Date(selectedDate);
      localDate.setHours(0, 0, 0, 0);
      setDate(localDate);
    } else {
      setDate(undefined);
    }
  };

  return {
    state,
    setDate,
    filterByHour,
    handleToggleSortOrder,
    changeSortField,
    handlePageChange,
    handlePageSizeChange,
    handleGenerateReport,
    saveDataPointAsReport,
    handleSaveReport,
    handleDataPointsDateChange,
    applyDateRangeFilter,
    toggleDataPointsView,
    handleCalendarSelect,
    refetchWeatherDataInRange,
    setShowAuthModal,
    isPremiumUser,
  };
}
