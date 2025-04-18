import { getConfigs } from "@/utils/configs";
import { MongoClient } from "mongodb";

/**
 * Setup MongoDB Collections for Weather Data and Reports
 * This script should run on application startup to ensure collections exist
 */
export async function setupTimeSeriesCollection(): Promise<void> {
  const dbUrl = getConfigs().databaseUrl || "";

  if (!dbUrl) {
    console.error("DATABASE_URL environment variable is not set");
    return;
  }

  const client = new MongoClient(dbUrl);

  try {
    await client.connect();
    console.log("Connected to MongoDB to setup collections");

    const db = client.db();

    // Setup time series collection for weather data
    try {
      await db.createCollection("weather_data", {
        timeseries: {
          timeField: "ts",
          metaField: "metadata",
          granularity: "minutes",
        },
        // Optional: set expiry policy for data older than X days
        // expireAfterSeconds: 60 * 60 * 24 * 30 // 30 days
      });
      console.log('✅ Time series collection "weather_data" created successfully');
    } catch (error: any) {
      // Collection might already exist which is fine
      if (error.code === 48) {
        // Error code for "NamespaceExists"
        console.log('Time series collection "weather_data" already exists');
      } else {
        console.error("Error creating time series collection:", error);
      }
    }

    // Create indexes for better performance
    try {
      await db.collection("weather_data").createIndex({ ts: 1 }, { name: "timestamp_index" });
      console.log("✅ Created index on timestamp field");
    } catch (error) {
      console.error("Error creating index:", error);
    }

    // Setup weather_reports collection and indexes
    try {
      // Create indexes for weather_reports collection
      await db.collection("weather_reports").createIndex({ startTime: 1, endTime: 1 }, { name: "time_range_index" });
      await db.collection("weather_reports").createIndex({ createdAt: -1 }, { name: "created_at_index" });
      await db.collection("weather_reports").createIndex({ userId: 1 }, { name: "user_index", sparse: true });
      console.log("✅ Created indexes for weather_reports collection");
    } catch (error) {
      console.error("Error creating indexes for weather_reports:", error);
    }
  } finally {
    await client.close();
    console.log("MongoDB connection closed after setup");
  }
}

/**
 * Rename the method for clarity
 */
export async function setupMongoDBCollections(): Promise<void> {
  return setupTimeSeriesCollection();
}

// Allow running this directly as a script
if (require.main === module) {
  setupTimeSeriesCollection()
    .then(() => console.log("Setup complete"))
    .catch((error) => console.error("Setup failed:", error))
    .finally(() => process.exit());
}
