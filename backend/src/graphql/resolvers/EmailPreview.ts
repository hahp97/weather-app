import { getConfigs } from "@/utils/configs";
import { getEmailPreviews, getLatestEmailPreview } from "@/utils/emailPreview";

// Only enable preview URLs in development environment
const isDev = getConfigs().nodeEnv === "development";

export default {
  Query: {
    getEmailPreviews: async (_: any, args: any) => {
      const { email } = args;

      // Only allow in development
      if (!isDev) {
        return [];
      }

      return getEmailPreviews(email);
    },

    getLatestEmailPreview: async (_: any, args: any) => {
      const { email } = args;

      // Only allow in development
      if (!isDev) {
        return null;
      }

      return getLatestEmailPreview(email);
    },
  },
};
