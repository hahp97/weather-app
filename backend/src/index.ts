process.env.TZ = "UTC";

import { setupMongoDBCollections } from "@/database/setupTimeSeriesCollection";
import { createApolloServerMiddleware } from "@/graphql";
import { backgroundJobs } from "@/jobs";
import { getConfigs } from "@/utils/configs";
import { addTokens, addUser, limiter } from "@/utils/middleware";
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

  // Start all background jobs
  backgroundJobs.startAll();

  // Handle graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    backgroundJobs.stopAll();
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

start();
