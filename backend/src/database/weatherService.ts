import { openWeatherClient, WeatherData } from "@/api/openweather";
import { getConfigs } from "@/utils/configs";
import { PrismaClient } from "@prisma/client";
import { MongoClient, ObjectId } from "mongodb";

const prisma = new PrismaClient();
// Fix the MongoDB connection access
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

// Time intervals for aggregation
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

/**
 * Get aggregated weather data by time interval
 * This is useful for charts and time series visualization
 */
export async function getAggregatedWeatherData(startTime: Date, endTime: Date, interval: TimeInterval = "hour") {
  // Define grouping based on the requested interval
  let groupByTimeField;

  switch (interval) {
    case "minute":
      groupByTimeField = {
        year: { $year: "$ts" },
        month: { $month: "$ts" },
        day: { $dayOfMonth: "$ts" },
        hour: { $hour: "$ts" },
        minute: { $minute: "$ts" },
      };
      break;
    case "hour":
      groupByTimeField = {
        year: { $year: "$ts" },
        month: { $month: "$ts" },
        day: { $dayOfMonth: "$ts" },
        hour: { $hour: "$ts" },
      };
      break;
    case "day":
      groupByTimeField = {
        year: { $year: "$ts" },
        month: { $month: "$ts" },
        day: { $dayOfMonth: "$ts" },
      };
      break;
    case "week":
      groupByTimeField = {
        year: { $year: "$ts" },
        week: { $week: "$ts" },
      };
      break;
    case "month":
      groupByTimeField = {
        year: { $year: "$ts" },
        month: { $month: "$ts" },
      };
      break;
    default:
      groupByTimeField = {
        year: { $year: "$ts" },
        month: { $month: "$ts" },
        day: { $dayOfMonth: "$ts" },
        hour: { $hour: "$ts" },
      };
  }

  // Run the aggregation pipeline
  const mongoDb = await getMongoDb();

  const results = await mongoDb
    .collection("weather_data")
    .aggregate([
      // Match documents in the time range
      {
        $match: {
          ts: { $gte: startTime, $lte: endTime },
        },
      },
      // Group by time interval
      {
        $group: {
          _id: groupByTimeField,
          timestamp: { $first: "$ts" }, // Preserve the first timestamp for reference
          avgTemperature: { $avg: "$temperature" },
          minTemperature: { $min: "$temperature" },
          maxTemperature: { $max: "$temperature" },
          avgPressure: { $avg: "$pressure" },
          avgHumidity: { $avg: "$humidity" },
          avgCloudCover: { $avg: "$cloudCover" },
          avgWindSpeed: { $avg: "$windSpeed" },
          count: { $sum: 1 },
        },
      },
      // Sort by timestamp
      { $sort: { timestamp: 1 } },
    ])
    .toArray();

  // Format the result
  return results.map((item: any) => ({
    id: item._id.toString(),
    timestamp: item.timestamp,
    temperature: item.avgTemperature,
    minTemperature: item.minTemperature,
    maxTemperature: item.maxTemperature,
    pressure: item.avgPressure,
    humidity: item.avgHumidity,
    cloudCover: item.avgCloudCover,
    windSpeed: item.avgWindSpeed,
    count: item.count,
    interval: interval,
    location: {
      latitude: 1.3586,
      longitude: 103.9899,
      name: "Changi Airport",
    },
  }));
}

/**
 * Calculate aggregated weather report for a time range
 * Uses MongoDB aggregation for efficient calculation
 */
export async function generateWeatherReport(startTime: Date, endTime: Date, userId?: string, title?: string) {
  // Use aggregation pipeline for efficient calculation
  const mongoDb = await getMongoDb();

  const aggregationResults = await mongoDb
    .collection("weather_data")
    .aggregate([
      {
        $match: {
          ts: { $gte: startTime, $lte: endTime },
        },
      },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: "$temperature" },
          avgPressure: { $avg: "$pressure" },
          avgHumidity: { $avg: "$humidity" },
          avgCloudCover: { $avg: "$cloudCover" },
          avgWindSpeed: { $avg: "$windSpeed" },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();

  // If no data points found
  if (aggregationResults.length === 0 || aggregationResults[0].count === 0) {
    throw new Error("No weather data available for the specified time range");
  }

  const metrics = aggregationResults[0];

  // Create and save the report using MongoDB directly
  const reportData = {
    title: title || `Weather Report from ${startTime.toISOString()} to ${endTime.toISOString()}`,
    startTime,
    endTime,
    avgTemperature: metrics.avgTemperature,
    avgPressure: metrics.avgPressure,
    avgHumidity: metrics.avgHumidity,
    avgCloudCover: metrics.avgCloudCover,
    avgWindSpeed: metrics.avgWindSpeed,
    dataPointsCount: metrics.count,
    userId: userId ? new ObjectId(userId) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await mongoDb.collection("weather_reports").insertOne(reportData);

  // Return the created report with id
  return {
    id: result.insertedId.toString(),
    ...reportData,
  };
}

/**
 * Get weather statistics for dashboard
 */
export async function getWeatherStatistics(days: number = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const mongoDb = await getMongoDb();
  const result = await mongoDb
    .collection("weather_data")
    .aggregate([
      {
        $match: {
          ts: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: "$temperature" },
          minTemperature: { $min: "$temperature" },
          maxTemperature: { $max: "$temperature" },
          avgPressure: { $avg: "$pressure" },
          minPressure: { $min: "$pressure" },
          maxPressure: { $max: "$pressure" },
          avgHumidity: { $avg: "$humidity" },
          avgCloudCover: { $avg: "$cloudCover" },
          avgWindSpeed: { $avg: "$windSpeed" },
          recordsCount: { $sum: 1 },
        },
      },
    ])
    .toArray();

  if (result.length === 0) {
    return {
      avgTemperature: 0,
      minTemperature: 0,
      maxTemperature: 0,
      avgPressure: 0,
      minPressure: 0,
      maxPressure: 0,
      avgHumidity: 0,
      avgCloudCover: 0,
      avgWindSpeed: 0,
      recordsCount: 0,
      period: `${days} days`,
    };
  }

  const stats = result[0];
  return {
    ...stats,
    period: `${days} days`,
  };
}

/**
 * Transform filter object to MongoDB query
 */
function buildFilterQuery(filter?: WeatherReportFilter): any {
  if (!filter) return {};

  const query: any = {};

  if (filter.title_contains) {
    query.title = { $regex: filter.title_contains, $options: "i" };
  }

  if (filter.startTime_gte || filter.startTime_lte) {
    query.startTime = {};
    if (filter.startTime_gte) query.startTime.$gte = filter.startTime_gte;
    if (filter.startTime_lte) query.startTime.$lte = filter.startTime_lte;
  }

  if (filter.endTime_gte || filter.endTime_lte) {
    query.endTime = {};
    if (filter.endTime_gte) query.endTime.$gte = filter.endTime_gte;
    if (filter.endTime_lte) query.endTime.$lte = filter.endTime_lte;
  }

  if (filter.createdAt_gte || filter.createdAt_lte) {
    query.createdAt = {};
    if (filter.createdAt_gte) query.createdAt.$gte = filter.createdAt_gte;
    if (filter.createdAt_lte) query.createdAt.$lte = filter.createdAt_lte;
  }

  if (filter.AND && filter.AND.length > 0) {
    query.$and = filter.AND.map((subFilter) => buildFilterQuery(subFilter));
  }

  if (filter.OR && filter.OR.length > 0) {
    query.$or = filter.OR.map((subFilter) => buildFilterQuery(subFilter));
  }

  return query;
}

/**
 * Build sort object from orderBy array
 */
function buildSortObject(orderBy?: string[]): any {
  if (!orderBy || orderBy.length === 0) {
    return { createdAt: -1 }; // Default sort
  }

  const sortObj: any = {};

  orderBy.forEach((order) => {
    const [field, direction] = order.split("_");
    sortObj[field] = direction === "ASC" ? 1 : -1;
  });

  return sortObj;
}

/**
 * Format MongoDB document to match GraphQL type
 */
function formatWeatherReport(doc: any) {
  if (!doc) return null;

  return {
    id: doc._id.toString(),
    title: doc.title,
    startTime: doc.startTime,
    endTime: doc.endTime,
    avgTemperature: doc.avgTemperature,
    avgPressure: doc.avgPressure,
    avgHumidity: doc.avgHumidity,
    avgCloudCover: doc.avgCloudCover,
    avgWindSpeed: doc.avgWindSpeed,
    dataPointsCount: doc.dataPointsCount,
    userId: doc.userId?.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Get all saved weather reports with filtering, sorting, and pagination
 */
export async function getAllWeatherReports(
  userId?: string,
  first?: number,
  skip?: number,
  filter?: WeatherReportFilter,
  orderBy?: string[]
) {
  // Base filter
  const baseFilter: any = userId ? { userId: new ObjectId(userId) } : {};

  // Add additional filters
  const filterQuery = buildFilterQuery(filter);

  // Combine filters
  const where = { ...baseFilter, ...filterQuery };

  // Build sort object
  const sort = buildSortObject(orderBy);

  // Use MongoDB for fetching reports
  const mongoDb = await getMongoDb();
  const results = await mongoDb
    .collection("weather_reports")
    .find(where)
    .sort(sort)
    .skip(skip || 0)
    .limit(first || 100)
    .toArray();

  // Format for GraphQL
  return results.map(formatWeatherReport);
}

/**
 * Count weather reports matching a filter
 */
export async function countWeatherReports(filter?: WeatherReportFilter) {
  const filterQuery = buildFilterQuery(filter);

  const mongoDb = await getMongoDb();
  return mongoDb.collection("weather_reports").countDocuments(filterQuery);
}

/**
 * Get a specific weather report by ID
 */
export async function getWeatherReportById(reportId: string) {
  const mongoDb = await getMongoDb();
  const result = await mongoDb.collection("weather_reports").findOne({
    _id: new ObjectId(reportId),
  });

  return formatWeatherReport(result);
}

/**
 * Compare two weather reports and calculate deviations
 */
export async function compareWeatherReports(reportId1: string, reportId2: string) {
  const report1 = await getWeatherReportById(reportId1);
  const report2 = await getWeatherReportById(reportId2);

  if (!report1 || !report2) {
    throw new Error("One or both reports not found");
  }

  return {
    report1,
    report2,
    deviations: {
      temperature: Math.abs((report2.avgTemperature || 0) - (report1.avgTemperature || 0)),
      pressure: Math.abs((report2.avgPressure || 0) - (report1.avgPressure || 0)),
      humidity: Math.abs((report2.avgHumidity || 0) - (report1.avgHumidity || 0)),
      cloudCover: Math.abs((report2.avgCloudCover || 0) - (report1.avgCloudCover || 0)),
      windSpeed: Math.abs((report2.avgWindSpeed || 0) - (report1.avgWindSpeed || 0)),
    },
  };
}
