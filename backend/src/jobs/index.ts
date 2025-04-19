import backgroundJobs from "./background";
import EmailJob from "./mailer/index";

class JobManager {
  private jobs: Record<string, any> = {};

  constructor() {
    this.registerJob("email-job", EmailJob);
  }

  registerJob(id: string, jobHandler: any) {
    this.jobs[id] = jobHandler;
  }

  async perform(jobConfig: { id: string }, data: any) {
    const { id } = jobConfig;
    const jobHandler = this.jobs[id];

    if (!jobHandler) {
      console.error(`No job handler found for job id: ${id}`);
      return;
    }

    try {
      return await jobHandler.perform(data);
    } catch (error) {
      console.error(`Error performing job ${id}:`, error);
    }
  }

  /**
   * Lấy tất cả các background jobs
   */
  getBackgroundJobs() {
    return backgroundJobs;
  }
}

export { backgroundJobs };
export default new JobManager();
