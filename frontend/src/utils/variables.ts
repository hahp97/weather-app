export type AppVariables = {
  NODE_ENV: string;
  APP_ENV: string;
  APP_NAME: string;
  APP_CODE: string;
  APP_VERSION: string;
  APP_NAMESPACE?: string;
  API_BASE_HOST: string;
  API_BASE_URL: string;
  SUBSCRIPTION_URL: string;
};

const defaultConfigs: AppVariables = {
  NODE_ENV: "development",
  APP_ENV: "development",
  APP_NAME: "Weather Report",
  APP_CODE: "Weather Report",
  APP_VERSION: "1.0.0",
  API_BASE_HOST: "http://localhost:4000",
  API_BASE_URL: "http://localhost:4000/graphql",
  SUBSCRIPTION_URL: "ws://localhost:4000/graphql",
};

export function getVariables(): AppVariables {
  const {
    NODE_ENV = defaultConfigs.NODE_ENV,
    APP_NAME = defaultConfigs.APP_NAME,
    APP_CODE = defaultConfigs.APP_CODE,
    APP_ENV = defaultConfigs.APP_ENV,
    APP_VERSION = defaultConfigs.APP_VERSION,
    API_BASE_HOST = defaultConfigs.API_BASE_HOST,
    API_BASE_URL = defaultConfigs.API_BASE_URL,
    SUBSCRIPTION_URL = defaultConfigs.SUBSCRIPTION_URL,
  } = process.env || {};

  const configs: AppVariables = {
    NODE_ENV: NODE_ENV,
    APP_NAME: APP_NAME,
    APP_CODE: APP_CODE,
    APP_ENV: APP_ENV,
    APP_VERSION: APP_VERSION,
    APP_NAMESPACE: [APP_NAME, APP_ENV, APP_VERSION].join("-"),
    API_BASE_HOST: API_BASE_HOST,
    API_BASE_URL: API_BASE_URL,
    SUBSCRIPTION_URL: SUBSCRIPTION_URL,
  };
  return configs;
}
