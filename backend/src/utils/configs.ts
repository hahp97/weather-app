const defaultConfigs = {
  nodeEnv: "development",
  appEnv: "development",
  appName: "weather_report_backend",
  appVersion: "1.0.0",
  port: 4000,
  emailSender: null,
  emailName: null,
  secret1: null,
  secret2: null,
};

export function getConfigs() {
  const {
    NODE_ENV = defaultConfigs.nodeEnv,
    APP_NAME = defaultConfigs.appName,
    APP_ENV = defaultConfigs.appEnv,
    PORT = defaultConfigs.port,
    DATABASE_URL,
    SECRET_KEY_BASE,
    S3_BUCKET,
    S3_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    EMAIL_SENDER = defaultConfigs.emailSender,
    EMAIL_NAME = defaultConfigs.emailName,
    SECRET1,
    SECRET2,
  } = process.env || {};

  const configs = {
    nodeEnv: NODE_ENV,
    appName: APP_NAME,
    appEnv: APP_ENV,
    port: PORT,
    secretKeyBase: SECRET_KEY_BASE,
    databaseUrl: DATABASE_URL,
    s3Bucket: S3_BUCKET,
    s3Region: S3_REGION,
    awsAccessKeyId: AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: AWS_SECRET_ACCESS_KEY,
    emailSender: EMAIL_SENDER,
    emailName: EMAIL_NAME,
    secret1: SECRET1,
    secret2: SECRET2,
  };
  return configs;
}
