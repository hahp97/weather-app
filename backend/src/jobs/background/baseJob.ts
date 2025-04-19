export abstract class BaseBackgroundJob {
  private intervalId: NodeJS.Timeout | null = null;
  private intervalMinutes: number;
  private name: string;
  private isRunning: boolean = false;

  /**
   * @param name name of the job
   * @param intervalMinutes interval in minutes
   */
  constructor(name: string, intervalMinutes: number) {
    this.name = name;
    this.intervalMinutes = intervalMinutes;
  }

  /**
   * Start the background job
   */
  start(): void {
    if (this.isRunning) {
      console.warn(`${this.name} is already running`);
      return;
    }

    console.log(`Starting ${this.name} with ${this.intervalMinutes} minute interval`);
    this.isRunning = true;

    this.executeJob()
      .then(() => console.log(`Initial ${this.name} job completed`))
      .catch((err) => console.error(`Error in initial ${this.name} job:`, err));

    this.intervalId = setInterval(
      () => {
        this.executeJob()
          .then(() => console.log(`${this.name} job completed`))
          .catch((err) => console.error(`Error in ${this.name} job:`, err));
      },
      this.intervalMinutes * 60 * 1000
    );
  }

  /**
   * Stop the background job
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log(`${this.name} stopped`);
    }
  }

  /**
   * Check if the job is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Execute the job - needs to be overridden by the subclass
   */
  protected abstract executeJob(): Promise<void>;
}
