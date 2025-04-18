process.env.TZ = "UTC";

import { setupMongoDBCollections } from "@/database/setupTimeSeriesCollection";
import { createApolloServerMiddleware } from "@/graphql";
import { WeatherDataFetcher } from "@/jobs/weatherDataFetcher";
import { getConfigs } from "@/utils/configs";
import { addTokens, addUser, limiter } from "@/utils/middleware";
import { cleanupExpiredOTPs } from "@/utils/otp";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";

const PORT = getConfigs().port;

async function start() {
  console.log(`======================`);
  console.log(`Initializing Server...`);
  console.log(`======================`);

  // Setup MongoDB Collections before starting the server
  await setupMongoDBCollections();
  console.log(`MongoDB collections initialized`);

  const app = express();
  app.set("trust proxy", 1);
  app.use(cors<cors.CorsRequest>());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser(getConfigs().secretKeyBase));

  app.use(addTokens);
  app.use(addUser);

  app.use("/api", limiter);
  app.use("/graphql", limiter);

  const httpServer = http.createServer(app);
  const apolloServerMiddleware = await createApolloServerMiddleware({ httpServer });

  app.use("/graphql", apolloServerMiddleware);

  // Start the weather data fetcher background job
  const weatherDataFetcher = new WeatherDataFetcher(5); // Fetch every 5 minutes
  weatherDataFetcher.start();

  // Setup OTP cleanup job (runs every 15 minutes)
  const otpCleanupInterval = setInterval(
    () => {
      cleanupExpiredOTPs().catch((err) => {
        console.error("Error cleaning up expired OTPs:", err);
      });
    },
    15 * 60 * 1000
  );

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    weatherDataFetcher.stop();
    clearInterval(otpCleanupInterval);
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

start();
