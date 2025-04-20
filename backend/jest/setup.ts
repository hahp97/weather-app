import "regenerator-runtime/runtime";

// Global test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "mongodb://localhost/weather_report_test?directConnection=true";
process.env.SECRET1 = "test_secret_1";
process.env.SECRET2 = "test_secret_2";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.PORT = "4001"; // Different from dev port
process.env.OPEN_WEATHER_API_KEY = "test_api_key";

// Global teardown
afterAll(async () => {
  // Add any cleanup tasks here
});
