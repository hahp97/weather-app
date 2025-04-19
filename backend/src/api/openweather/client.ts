import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { openWeatherConfig } from "./config";
import { OpenWeatherCurrentResponse, OpenWeatherHistoricalResponse, WeatherData } from "./types";

const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // Cache 1 minute (ms)

const callApi = async <T>(endpoint: string, params: Record<string, any> = {}, cacheKey?: string): Promise<T> => {
  const apiParams = {
    ...params,
    appid: openWeatherConfig.apiKey,
    units: openWeatherConfig.units,
  };

  if (cacheKey && cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    console.log(`[OpenWeather] Using cached data for: ${cacheKey}`);
    return cache[cacheKey].data as T;
  }

  const options: AxiosRequestConfig = {
    baseURL: openWeatherConfig.baseUrl,
    params: apiParams,
    timeout: openWeatherConfig.requestTimeout,
  };

  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < openWeatherConfig.maxRetries) {
    try {
      attempts++;

      if (attempts > 1) {
        console.log(`[OpenWeather] Retry attempt ${attempts} for ${endpoint}`);
      }

      const response = await axios.get<T>(`${endpoint}`, options);

      if (cacheKey) {
        cache[cacheKey] = {
          data: response.data,
          timestamp: Date.now(),
        };
      }

      return response.data;
    } catch (error) {
      lastError = error as Error;

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error(`[OpenWeather] API Error: ${axiosError.message}`);

        if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
          break;
        }
      } else {
        console.error(`[OpenWeather] Unknown error: ${error}`);
      }

      if (attempts < openWeatherConfig.maxRetries) {
        const delayMs = Math.pow(2, attempts) * 500;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error(`Failed to call OpenWeather API after ${openWeatherConfig.maxRetries} attempts`);
};

export const getCurrentWeather = async (): Promise<WeatherData> => {
  const cacheKey = "current_weather";

  const response = await callApi<OpenWeatherCurrentResponse>(
    "/weather",
    {
      lat: openWeatherConfig.location.lat,
      lon: openWeatherConfig.location.lon,
    },
    cacheKey
  );

  return {
    temperature: response.main.temp,
    pressure: response.main.pressure,
    humidity: response.main.humidity,
    cloudCover: response.clouds.all,
    windSpeed: response.wind.speed,
    windDirection: response.wind.deg,
    visibility: response.visibility,
    weatherCondition: response.weather[0]?.description,
    rainAmount: response.rain?.["1h"] || 0,
    timestamp: new Date(response.dt * 1000),
  };
};

export const getHistoricalWeather = async (date: Date): Promise<WeatherData> => {
  const timestamp = Math.floor(date.getTime() / 1000);
  const cacheKey = `historical_weather_${timestamp}`;

  try {
    const response = await callApi<OpenWeatherHistoricalResponse>(
      "/onecall/timemachine",
      {
        lat: openWeatherConfig.location.lat,
        lon: openWeatherConfig.location.lon,
        dt: timestamp,
      },
      cacheKey
    );

    const dataPoint = response.data[0];

    if (!dataPoint) {
      throw new Error("No historical data available for the requested date");
    }

    return {
      temperature: dataPoint.temp,
      pressure: dataPoint.pressure,
      humidity: dataPoint.humidity,
      cloudCover: dataPoint.clouds,
      windSpeed: dataPoint.wind_speed,
      windDirection: dataPoint.wind_deg,
      visibility: dataPoint.visibility,
      weatherCondition: dataPoint.weather[0]?.description,
      rainAmount: dataPoint.rain?.["1h"] || 0,
      timestamp: new Date(dataPoint.dt * 1000),
    };
  } catch (error) {
    console.error(`Failed to get historical weather: ${error}`);
    throw new Error(
      "Failed to fetch historical weather data. Note that this feature may require a paid OpenWeather subscription."
    );
  }
};

export const clearCache = (): void => {
  Object.keys(cache).forEach((key) => delete cache[key]);
  console.log("[OpenWeather] Cache cleared");
};

export const openWeatherClient = {
  getCurrentWeather,
  getHistoricalWeather,
  clearCache,
};
