import { cleanupExpiredOTPs } from "@/utils/otp";
import { BaseBackgroundJob } from "./baseJob";

export class OTPCleanupJob extends BaseBackgroundJob {
  /**
   * @param intervalMinutes interval between cleanup (minutes)
   */
  constructor(intervalMinutes = 15) {
    super("OTPCleanupJob", intervalMinutes);
  }

  /**
   * Execute the cleanup job
   */
  protected async executeJob(): Promise<void> {
    try {
      const result = await cleanupExpiredOTPs();
      if (result.deletedCount > 0) {
        console.log(`Removed ${result.deletedCount} expired OTPs`);
      } else {
        console.log("No expired OTPs found");
      }
    } catch (error) {
      console.error("Error cleaning up expired OTPs:", error);
      throw error;
    }
  }
}
