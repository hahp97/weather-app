import { getConfigs } from "@/utils/configs";

export const REDIS_CONNECTION = getConfigs().redisUrl || {
  host: getConfigs().redisHost,
  port: getConfigs().redisPort,
  username: getConfigs().redisUsername || undefined,
  password: getConfigs().redisPassword || undefined,
  retryStrategy: (times: number) => Math.max(times * 100, 3000),
  maxRetriesPerRequest: null,
  monitor: false,
};

export const MAX_PAGE_SIZE = 1000;
export const DEFAULT_PAGE_SIZE = 5;
export const DEFAULT_PAGE_NUMBER = 1;
