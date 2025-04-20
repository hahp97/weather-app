import { openWeatherClient, WeatherData } from "@/api/openweather";
import { getConfigs } from "@/utils/configs";
import { MongoClient } from "mongodb";

let db: any = null;

// Initialize MongoDB connection
async function getMongoDb() {
  if (!db) {
    const dbUrl = getConfigs().databaseUrl || "";
    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const client = new MongoClient(dbUrl);
    await client.connect();
    db = client.db();
  }
  return db;
}

interface WeatherReportFilter {
  AND?: WeatherReportFilter[];
  OR?: WeatherReportFilter[];
  title_contains?: string;
  startTime_gte?: Date;
  startTime_lte?: Date;
  endTime_gte?: Date;
  endTime_lte?: Date;
  createdAt_gte?: Date;
  createdAt_lte?: Date;
}

type TimeInterval = "minute" | "hour" | "day" | "week" | "month";

/**
 * Store weather data in the time series collection
 * Using direct MongoDB driver since Prisma doesn't fully support time series collections
 */
export async function storeWeatherData(data: WeatherData): Promise<void> {
  // Get MongoDB instance
  const mongoDb = await getMongoDb();

  // Insert the data directly using MongoDB driver
  await mongoDb.collection("weather_data").insertOne({
    ts: data.timestamp,
    temperature: data.temperature,
    pressure: data.pressure,
    humidity: data.humidity,
    cloudCover: data.cloudCover,
    windSpeed: data.windSpeed,
    windDirection: data.windDirection,
    visibility: data.visibility,
    weatherCondition: data.weatherCondition,
    rainAmount: data.rainAmount,
    metadata: {
      source: "OpenWeather",
      location: {
        latitude: 1.3586,
        longitude: 103.9899,
        name: "Changi Airport",
      },
      period: "minute",
    },
    createdAt: new Date(),
  });
}

/**
 * Fetch current weather data from API and store it
 */
export async function fetchAndStoreCurrentWeather(): Promise<WeatherData> {
  const weatherData = await openWeatherClient.getCurrentWeather();
  await storeWeatherData(weatherData);
  return weatherData;
}

/**
 * Fetch historical weather data from API and store it
 * Note: This requires a paid OpenWeather subscription
 */
export async function fetchAndStoreHistoricalWeather(date: Date): Promise<WeatherData> {
  const weatherData = await openWeatherClient.getHistoricalWeather(date);
  await storeWeatherData(weatherData);
  return weatherData;
}

/**
 * Retrieve weather data for a specific time range using MongoDB find
 * with pagination and sorting support
 */
export async function getWeatherDataInRange(
  startTime: Date,
  endTime: Date,
  limit: number = 100,
  offset: number = 0,
  sortField: string = "ts",
  sortOrder: string = "desc"
) {
  const mongoDb = await getMongoDb();

  // Create sort object
  const sort: any = {};
  sort[sortField] = sortOrder.toLowerCase() === "asc" ? 1 : -1;

  const results = await mongoDb
    .collection("weather_data")
    .find({
      ts: {
        $gte: startTime,
        $lte: endTime,
      },
    })
    .sort(sort)
    .skip(offset)
    .limit(limit)
    .toArray();

  // Transform to match our GraphQL schema
  return results.map((item: any) => ({
    id: item._id.toString(),
    timestamp: item.ts,
    temperature: item.temperature,
    pressure: item.pressure,
    humidity: item.humidity,
    cloudCover: item.cloudCover,
    windSpeed: item.windSpeed,
    windDirection: item.windDirection,
    visibility: item.visibility,
    weatherCondition: item.weatherCondition,
    rainAmount: item.rainAmount,
    location: item.metadata.location,
    period: item.metadata.period,
    createdAt: item.createdAt,
  }));
}

/**
 * Count weather data entries for a specific time range
 */
export async function countWeatherData(startTime: Date, endTime: Date) {
  const mongoDb = await getMongoDb();

  return await mongoDb.collection("weather_data").countDocuments({
    ts: {
      $gte: startTime,
      $lte: endTime,
    },
  });
}
