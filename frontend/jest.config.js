const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.ts and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // Handle module aliases
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/pages/(.*)$": "<rootDir>/src/app/$1",
    "^@/hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@/utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@/libs/(.*)$": "<rootDir>/src/libs/$1",
    "^@/graphql/(.*)$": "<rootDir>/src/graphql/$1",
    "^@/context/(.*)$": "<rootDir>/src/context/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testMatch: [
    "**/__tests__/**/*.test.(ts|tsx)",
    "**/?(*.)+(spec|test).(ts|tsx)",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
