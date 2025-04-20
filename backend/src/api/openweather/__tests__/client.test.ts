import axios from "axios";
import { openWeatherClient } from "../client";
import { openWeatherConfig } from "../config";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("OpenWeather Client", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the cache before each test
    openWeatherClient.clearCache();
  });

  describe("getCurrentWeather", () => {
    it("should fetch current weather data successfully", async () => {
      // Mock successful response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          main: {
            temp: 25,
            pressure: 1013,
            humidity: 60,
          },
          clouds: { all: 40 },
          wind: { speed: 5, deg: 180 },
          visibility: 10000,
          weather: [{ description: "scattered clouds" }],
          dt: 1713696000, // April 20, 2025
        },
      });

      const result = await openWeatherClient.getCurrentWeather();

      // Check if axios was called with correct parameters
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/weather",
        expect.objectContaining({
          baseURL: openWeatherConfig.baseUrl,
          params: expect.objectContaining({
            lat: openWeatherConfig.location.lat,
            lon: openWeatherConfig.location.lon,
            appid: openWeatherConfig.apiKey,
          }),
        })
      );

      // Check if the response is transformed correctly
      expect(result).toEqual(
        expect.objectContaining({
          temperature: 25,
          pressure: 1013,
          humidity: 60,
          cloudCover: 40,
          windSpeed: 5,
          windDirection: 180,
          visibility: 10000,
          weatherCondition: "scattered clouds",
          rainAmount: 0,
        })
      );

      // Check if timestamp is a Date object
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should use cached data on subsequent calls", async () => {
      // Mock successful response for first call
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          main: { temp: 25, pressure: 1013, humidity: 60 },
          clouds: { all: 40 },
          wind: { speed: 5, deg: 180 },
          visibility: 10000,
          weather: [{ description: "scattered clouds" }],
          dt: 1713696000,
        },
      });

      // First call should make an API request
      await openWeatherClient.getCurrentWeather();

      // Second call should use cached data
      await openWeatherClient.getCurrentWeather();

      // Axios should only be called once
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should retry on network errors", async () => {
      // Mock network error for first attempt, success for second
      mockedAxios.get.mockRejectedValueOnce(new Error("Network error")).mockResolvedValueOnce({
        data: {
          main: { temp: 25, pressure: 1013, humidity: 60 },
          clouds: { all: 40 },
          wind: { speed: 5, deg: 180 },
          visibility: 10000,
          weather: [{ description: "scattered clouds" }],
          dt: 1713696000,
        },
      });

      const result = await openWeatherClient.getCurrentWeather();

      // Axios should be called twice (initial + retry)
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(result.temperature).toBe(25);
    });
  });

  describe("getHistoricalWeather", () => {
    it("should fetch historical weather data successfully", async () => {
      // Mock successful response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [
            {
              temp: 22,
              pressure: 1010,
              humidity: 65,
              clouds: 30,
              wind_speed: 4,
              wind_deg: 200,
              visibility: 9000,
              weather: [{ description: "light rain" }],
              rain: { "1h": 0.5 },
              dt: 1713609600, // April 19, 2025
            },
          ],
        },
      });

      const testDate = new Date("2025-04-19T12:00:00Z");
      const result = await openWeatherClient.getHistoricalWeather(testDate);

      // Check API call params
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/onecall/timemachine",
        expect.objectContaining({
          params: expect.objectContaining({
            dt: Math.floor(testDate.getTime() / 1000),
          }),
        })
      );

      // Check transformed response
      expect(result).toEqual(
        expect.objectContaining({
          temperature: 22,
          pressure: 1010,
          humidity: 65,
          cloudCover: 30,
          windSpeed: 4,
          windDirection: 200,
          visibility: 9000,
          weatherCondition: "light rain",
          rainAmount: 0.5,
        })
      );
    });

    it("should throw error when no historical data available", async () => {
      // Mock response with empty data array
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: [],
        },
      });

      const testDate = new Date("2025-04-19T12:00:00Z");

      await expect(openWeatherClient.getHistoricalWeather(testDate)).rejects.toThrow("No historical data available");
    });
  });
});
