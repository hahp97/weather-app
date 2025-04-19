import { OTPCleanupJob } from "./otpCleanupJob";
import { WeatherDataFetcher } from "./weatherDataFetcher";

/**
 * Class managing all background jobs
 * Provides a single point of access to start and stop all background jobs
 */
class BackgroundJobManager {
  private weatherDataFetcher: WeatherDataFetcher;
  private otpCleanupJob: OTPCleanupJob;

  constructor() {
    this.weatherDataFetcher = new WeatherDataFetcher(5);
    this.otpCleanupJob = new OTPCleanupJob(15);
  }

  /**
   * Start all background jobs
   */
  startAll(): void {
    console.log("Starting all background jobs...");
    this.weatherDataFetcher.start();
    this.otpCleanupJob.start();
  }

  /**
   * Stop all background jobs
   */
  stopAll(): void {
    console.log("Stopping all background jobs...");
    this.weatherDataFetcher.stop();
    this.otpCleanupJob.stop();
  }

  /**
   * Get a list of all job instances
   */
  getJobs() {
    return {
      weatherDataFetcher: this.weatherDataFetcher,
      otpCleanupJob: this.otpCleanupJob,
    };
  }
}

export { OTPCleanupJob, WeatherDataFetcher };
export default new BackgroundJobManager();
