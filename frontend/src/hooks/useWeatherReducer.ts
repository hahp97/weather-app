import { useReducer } from "react";

interface WeatherData {
  id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCover: number;
  windSpeed?: number;
  weatherCondition?: string;
}

interface WeatherReport {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  avgTemperature: number;
  avgPressure: number;
  avgHumidity: number;
  avgCloudCover: number;
  avgWindSpeed: number;
  dataPointsCount: number;
  createdAt: string;
  updatedAt: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCover: number;
}

interface DateRange {
  startTime: Date;
  endTime: Date;
}

interface WeatherState {
  date: Date | undefined;
  weatherData: WeatherData | null;
  isLoading: boolean;
  errorMessage: string | null;
  isSubscriptionError: boolean;
  showAuthModal: boolean;
  showHistoricalData: boolean;
  historicalDataPoints: WeatherData[];
  selectedHour: number | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  sortField: string;
  sortOrder: "asc" | "desc";
  showDataPointsView: boolean;
  dataPointsDateRange: DateRange;
}

type WeatherAction =
  | { type: "SET_DATE"; payload: Date | undefined }
  | { type: "SET_WEATHER_DATA"; payload: WeatherData | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SUBSCRIPTION_ERROR"; payload: boolean }
  | { type: "SET_SHOW_AUTH_MODAL"; payload: boolean }
  | { type: "SET_SHOW_HISTORICAL_DATA"; payload: boolean }
  | { type: "SET_HISTORICAL_DATA_POINTS"; payload: WeatherData[] }
  | { type: "SET_SELECTED_HOUR"; payload: number | null }
  | { type: "SET_CURRENT_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "SET_TOTAL_ITEMS"; payload: number }
  | { type: "SET_TOTAL_PAGES"; payload: number }
  | { type: "SET_SORT_FIELD"; payload: string }
  | { type: "SET_SORT_ORDER"; payload: "asc" | "desc" }
  | { type: "TOGGLE_SORT_ORDER" }
  | { type: "SET_SHOW_DATA_POINTS_VIEW"; payload: boolean }
  | { type: "SET_DATA_POINTS_DATE_RANGE"; payload: DateRange }
  | { type: "RESET_DATA" }
  | {
      type: "UPDATE_PAGINATION";
      payload: { totalItems: number; pageSize: number };
    };

const initialState: WeatherState = {
  date: undefined,
  weatherData: null,
  isLoading: false,
  errorMessage: null,
  isSubscriptionError: false,
  showAuthModal: false,
  showHistoricalData: false,
  historicalDataPoints: [],
  selectedHour: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  sortField: "ts",
  sortOrder: "desc",
  showDataPointsView: false,
  dataPointsDateRange: {
    startTime: new Date(new Date().setHours(0, 0, 0, 0)),
    endTime: new Date(new Date().setHours(23, 59, 59, 999)),
  },
};

function weatherReducer(
  state: WeatherState,
  action: WeatherAction
): WeatherState {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, date: action.payload };
    case "SET_WEATHER_DATA":
      return { ...state, weatherData: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, errorMessage: action.payload };
    case "SET_SUBSCRIPTION_ERROR":
      return { ...state, isSubscriptionError: action.payload };
    case "SET_SHOW_AUTH_MODAL":
      return { ...state, showAuthModal: action.payload };
    case "SET_SHOW_HISTORICAL_DATA":
      return { ...state, showHistoricalData: action.payload };
    case "SET_HISTORICAL_DATA_POINTS":
      return { ...state, historicalDataPoints: action.payload };
    case "SET_SELECTED_HOUR":
      return { ...state, selectedHour: action.payload };
    case "SET_CURRENT_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload };
    case "SET_TOTAL_ITEMS":
      return { ...state, totalItems: action.payload };
    case "SET_TOTAL_PAGES":
      return { ...state, totalPages: action.payload };
    case "SET_SORT_FIELD":
      return { ...state, sortField: action.payload };
    case "SET_SORT_ORDER":
      return { ...state, sortOrder: action.payload };
    case "TOGGLE_SORT_ORDER":
      return {
        ...state,
        sortOrder: state.sortOrder === "asc" ? "desc" : "asc",
      };
    case "SET_SHOW_DATA_POINTS_VIEW":
      return { ...state, showDataPointsView: action.payload };
    case "SET_DATA_POINTS_DATE_RANGE":
      return { ...state, dataPointsDateRange: action.payload };
    case "RESET_DATA":
      return {
        ...state,
        errorMessage: null,
        isSubscriptionError: false,
        weatherData: null,
        historicalDataPoints: [],
        showHistoricalData: false,
      };
    case "UPDATE_PAGINATION":
      return {
        ...state,
        totalItems: action.payload.totalItems,
        totalPages: Math.ceil(
          action.payload.totalItems / action.payload.pageSize
        ),
      };
    default:
      return state;
  }
}

export function useWeatherReducer() {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  const setDate = (date: Date | undefined) => {
    dispatch({ type: "SET_DATE", payload: date });
  };

  const setWeatherData = (data: WeatherData | null) => {
    dispatch({ type: "SET_WEATHER_DATA", payload: data });
  };

  const setLoading = (isLoading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: isLoading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const setSubscriptionError = (isError: boolean) => {
    dispatch({ type: "SET_SUBSCRIPTION_ERROR", payload: isError });
  };

  const setShowAuthModal = (show: boolean) => {
    dispatch({ type: "SET_SHOW_AUTH_MODAL", payload: show });
  };

  const setShowHistoricalData = (show: boolean) => {
    dispatch({ type: "SET_SHOW_HISTORICAL_DATA", payload: show });
  };

  const setHistoricalDataPoints = (dataPoints: WeatherData[]) => {
    dispatch({ type: "SET_HISTORICAL_DATA_POINTS", payload: dataPoints });
  };

  const setSelectedHour = (hour: number | null) => {
    dispatch({ type: "SET_SELECTED_HOUR", payload: hour });
  };

  const setCurrentPage = (page: number) => {
    dispatch({ type: "SET_CURRENT_PAGE", payload: page });
  };

  const setPageSize = (size: number) => {
    dispatch({ type: "SET_PAGE_SIZE", payload: size });
  };

  const setSortField = (field: string) => {
    dispatch({ type: "SET_SORT_FIELD", payload: field });
  };

  const setSortOrder = (order: "asc" | "desc") => {
    dispatch({ type: "SET_SORT_ORDER", payload: order });
  };

  const toggleSortOrder = () => {
    dispatch({ type: "TOGGLE_SORT_ORDER" });
  };

  const setShowDataPointsView = (show: boolean) => {
    dispatch({ type: "SET_SHOW_DATA_POINTS_VIEW", payload: show });
  };

  const setDataPointsDateRange = (range: DateRange) => {
    dispatch({ type: "SET_DATA_POINTS_DATE_RANGE", payload: range });
  };

  const resetData = () => {
    dispatch({ type: "RESET_DATA" });
  };

  const updatePagination = (totalItems: number, pageSize: number) => {
    dispatch({ type: "UPDATE_PAGINATION", payload: { totalItems, pageSize } });
  };

  return {
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
  };
}

export type { DateRange, WeatherData, WeatherReport };
