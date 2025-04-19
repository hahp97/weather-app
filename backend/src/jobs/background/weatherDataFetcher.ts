import { openWeatherClient } from "@/api/openweather";
import { storeWeatherData } from "@/database/weatherService";
import { BaseBackgroundJob } from "@/jobs/background/baseJob";

export class WeatherDataFetcher extends BaseBackgroundJob {
  /**
   * @param intervalMinutes
   */
  constructor(intervalMinutes = 5) {
    super("WeatherDataFetcher", intervalMinutes);
  }

  /**
   * Execute the main job
   */
  protected async executeJob(): Promise<void> {
    try {
      const data = await openWeatherClient.getCurrentWeather();
      await storeWeatherData(data);
      console.log(`Weather data stored for ${data.timestamp.toISOString()}`);
    } catch (error) {
      console.error("Error in WeatherDataFetcher:", error);
      throw error;
    }
  }
}
