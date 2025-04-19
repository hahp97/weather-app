export interface BackendConfig {
  apiBaseUrl: string;
  subscriptionUrl: string;
  appCode: string;
}

export function getConfigs(): BackendConfig {
  return {
    apiBaseUrl:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/graphql",
    subscriptionUrl:
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000/graphql",
    appCode: process.env.NEXT_PUBLIC_APP_CODE || "weather_report",
  };
}
