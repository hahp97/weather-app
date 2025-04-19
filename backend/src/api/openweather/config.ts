import { getConfigs } from "@/utils/configs";

export const openWeatherConfig = {
  apiKey: getConfigs().openWeatherApiKey,

  baseUrl: "https://api.openweathermap.org/data/2.5",

  // Changi Airport (1.3586° N, 103.9899° E)
  location: {
    lat: 1.3586,
    lon: 103.9899,
    name: "Changi Airport",
  },

  units: "metric",

  requestTimeout: 10000,
  maxRetries: 3,

  defaultFetchInterval: 5, // minutes
};
