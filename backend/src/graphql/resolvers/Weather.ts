import { openWeatherClient } from "@/api/openweather";
import * as weatherService from "@/database/weatherService";
import { GraphQLError } from "graphql";

interface DateRangeInput {
  startTime: Date;
  endTime: Date;
}

interface AggregationInput {
  startTime: Date;
  endTime: Date;
  interval?: string;
}

interface GenerateWeatherReportInput {
  startTime: Date;
  endTime: Date;
  title?: string;
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

interface QueryWeatherReportsArgs {
  first?: number;
  skip?: number;
  filter?: WeatherReportFilter;
  orderBy?: string[];
}

export default {
  Query: {
    currentWeather: async () => {
      try {
        const data = await openWeatherClient.getCurrentWeather();

        // Weather data from client already has all the required fields
        return {
          id: "current", // Since this is just the current weather and not stored in DB
          ...data,
        };
      } catch (error) {
        console.error("Error fetching current weather:", error);
        throw new GraphQLError("Failed to fetch current weather data", {
          extensions: { code: "EXTERNAL_SERVICE_ERROR" },
        });
      }
    },

    weatherDataInRange: async (_: any, { range }: { range: DateRangeInput }) => {
      try {
        return await weatherService.getWeatherDataInRange(new Date(range.startTime), new Date(range.endTime));
      } catch (error) {
        console.error("Error fetching weather data range:", error);
        throw new GraphQLError("Failed to fetch weather data for the specified range", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    aggregatedWeatherData: async (_: any, { aggregation }: { aggregation: AggregationInput }) => {
      try {
        const { startTime, endTime, interval } = aggregation;
        return await weatherService.getAggregatedWeatherData(
          new Date(startTime),
          new Date(endTime),
          (interval as any) || "hour"
        );
      } catch (error) {
        console.error("Error fetching aggregated weather data:", error);
        throw new GraphQLError("Failed to fetch aggregated weather data", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    weatherStatistics: async (_: any, { days }: { days?: number }) => {
      try {
        return await weatherService.getWeatherStatistics(days || 7);
      } catch (error) {
        console.error("Error fetching weather statistics:", error);
        throw new GraphQLError("Failed to fetch weather statistics", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    weatherReports: async (_: any, args: QueryWeatherReportsArgs, { user }: { user?: any }) => {
      try {
        const { first, skip, filter, orderBy } = args;
        // If user is authenticated, get their reports, otherwise get all public reports
        const userId = user?.id;
        return await weatherService.getAllWeatherReports(userId, first, skip, filter, orderBy);
      } catch (error) {
        console.error("Error fetching weather reports:", error);
        throw new GraphQLError("Failed to fetch weather reports", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    weatherReportsMeta: async (_: any, { filter }: { filter?: WeatherReportFilter }) => {
      try {
        const count = await weatherService.countWeatherReports(filter);
        return { count };
      } catch (error) {
        console.error("Error fetching weather reports meta:", error);
        throw new GraphQLError("Failed to fetch weather reports meta", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    weatherReport: async (_: any, { id }: { id: string }) => {
      try {
        return await weatherService.getWeatherReportById(id);
      } catch (error) {
        console.error("Error fetching weather report:", error);
        throw new GraphQLError("Failed to fetch weather report", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    compareWeatherReports: async (_: any, { reportId1, reportId2 }: { reportId1: string; reportId2: string }) => {
      try {
        return await weatherService.compareWeatherReports(reportId1, reportId2);
      } catch (error) {
        console.error("Error comparing weather reports:", error);
        throw new GraphQLError("Failed to compare weather reports", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  Mutation: {
    generateWeatherReport: async (
      _: any,
      { input }: { input: GenerateWeatherReportInput },
      { user }: { user?: any }
    ) => {
      try {
        const userId = user?.id; // Will be undefined if user is not authenticated
        const report = await weatherService.generateWeatherReport(
          new Date(input.startTime),
          new Date(input.endTime),
          userId,
          input.title
        );

        return {
          success: true,
          message: "Weather report generated successfully",
          data: { report },
        };
      } catch (error) {
        console.error("Error generating weather report:", error);
        return {
          success: false,
          message: "Failed to generate weather report",
          errors: [{ message: error instanceof Error ? error.message : "Unknown error" }],
        };
      }
    },

    fetchAndStoreWeatherData: async () => {
      try {
        const data = await weatherService.fetchAndStoreCurrentWeather();

        return {
          success: true,
          message: "Weather data fetched and stored successfully",
          data: { weather: data },
        };
      } catch (error) {
        console.error("Error fetching and storing weather data:", error);
        return {
          success: false,
          message: "Failed to fetch and store weather data",
          errors: [{ message: error instanceof Error ? error.message : "Unknown error" }],
        };
      }
    },

    fetchHistoricalWeatherData: async (_: any, { date }: { date: string | Date }) => {
      try {
        const dateObj = new Date(date);

        if (isNaN(dateObj.getTime())) {
          return {
            success: false,
            message: "Invalid date format",
            errors: [{ message: "The provided date is not valid" }],
          };
        }

        const data = await weatherService.fetchAndStoreHistoricalWeather(dateObj);

        return {
          success: true,
          message: "Historical weather data fetched and stored successfully",
          data: { weather: data },
        };
      } catch (error) {
        console.error("Error fetching historical weather data:", error);
        return {
          success: false,
          message: "Failed to fetch historical weather data",
          errors: [{ message: error instanceof Error ? error.message : "Unknown error" }],
        };
      }
    },
  },
};
