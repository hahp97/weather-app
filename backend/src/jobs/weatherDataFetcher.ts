import { openWeatherClient } from "@/api/openweather";
import { storeWeatherData } from "@/database/weatherService";
import { setInterval } from "timers";

/**
 * Background job that fetches weather data periodically
 * and stores it in the time series collection
 */
export class WeatherDataFetcher {
  private intervalId: NodeJS.Timeout | null = null;
  private intervalMinutes: number;

  constructor(intervalMinutes = 5) {
    this.intervalMinutes = intervalMinutes;
  }

  /**
   * Start the background job
   */
  start(): void {
    if (this.intervalId) {
      console.warn("Weather data fetcher is already running");
      return;
    }

    console.log(`Starting weather data fetcher with ${this.intervalMinutes} minute interval`);

    // Run immediately on start
    this.fetchAndStore()
      .then(() => console.log("Initial weather data fetch completed"))
      .catch((err) => console.error("Error in initial weather data fetch:", err));

    // Then run on interval
    this.intervalId = setInterval(
      () => {
        this.fetchAndStore()
          .then(() => console.log("Weather data fetch completed"))
          .catch((err) => console.error("Error fetching weather data:", err));
      },
      this.intervalMinutes * 60 * 1000 // Convert minutes to milliseconds
    );
  }

  /**
   * Stop the background job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Weather data fetcher stopped");
    }
  }

  /**
   * Fetch weather data and store it in database
   */
  private async fetchAndStore(): Promise<void> {
    try {
      const data = await openWeatherClient.getCurrentWeather();
      await storeWeatherData(data);
      console.log(`Weather data stored for ${data.timestamp.toISOString()}`);
    } catch (error) {
      console.error("Error in fetchAndStore:", error);
      throw error;
    }
  }
}
