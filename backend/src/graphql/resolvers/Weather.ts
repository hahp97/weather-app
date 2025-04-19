import { openWeatherClient } from "@/api/openweather";
import * as weatherService from "@/database/weatherService";
import { AppContext } from "@/types";
import buildPrismaFilter from "@/utils/buildPrismaFilter";
import buildPrismaOrder from "@/utils/buildPrismaOrder";
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
  WeatherData: {
    user: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;
      return prisma.user.findFirst({
        where: { id: parent.userId },
      });
    },
  },
  Query: {
    currentWeather: async () => {
      try {
        const data = await openWeatherClient.getCurrentWeather();

        return {
          id: "current",
          ...data,
        };
      } catch (error) {
        console.error("Error fetching current weather:", error);
        throw new GraphQLError("Failed to fetch current weather data", {
          extensions: { code: "EXTERNAL_SERVICE_ERROR" },
        });
      }
    },
    weatherDataInRange: async (
      _: any,
      {
        range,
        first,
        skip,
        sortField,
        sortOrder,
      }: {
        range: DateRangeInput;
        first?: number;
        skip?: number;
        sortField?: string;
        sortOrder?: string;
      }
    ) => {
      try {
        return await weatherService.getWeatherDataInRange(
          new Date(range.startTime),
          new Date(range.endTime),
          first || 100,
          skip || 0,
          sortField || "ts",
          sortOrder || "desc"
        );
      } catch (error) {
        console.error("Error fetching weather data range:", error);
        throw new GraphQLError("Failed to fetch weather data for the specified range", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    weatherReports: async (_: any, args: QueryWeatherReportsArgs, context: AppContext) => {
      const { authorizedUser, prisma } = context;

      if (!authorizedUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const { first, skip, filter, orderBy } = args;
        // Get reports for the authenticated user
        const userId = authorizedUser.id;

        const reports = await prisma.weatherReport.findMany({
          where: buildPrismaFilter({
            ...filter,
            userId,
          }),
          orderBy: buildPrismaOrder(orderBy || []),
          take: first || 100,
          skip: skip || 0,
        });

        return reports.map((report) => ({
          ...report,
          startTime: report.startTime.toISOString(),
          endTime: report.endTime.toISOString(),
        }));
      } catch (error) {
        console.error("Error fetching weather reports:", error);
        throw new GraphQLError("Failed to fetch weather reports", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    weatherReportsMeta: async (_: any, { filter }: { filter?: WeatherReportFilter }, context: AppContext) => {
      const { authorizedUser, prisma } = context;

      if (!authorizedUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const count = await prisma.weatherReport.count({
          where: buildPrismaFilter({
            ...filter,
            userId: authorizedUser.id,
          }),
        });

        return { count };
      } catch (error) {
        console.error("Error fetching weather reports meta:", error);
        throw new GraphQLError("Failed to fetch weather reports meta", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    weatherReport: async (_: any, { id }: { id: string }, context: AppContext) => {
      const { authorizedUser, prisma } = context;

      if (!authorizedUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const report = await prisma.weatherReport.findFirst({
          where: buildPrismaFilter({
            id,
            userId: authorizedUser.id,
          }),
        });

        if (!report) {
          throw new GraphQLError("Weather report not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return {
          ...report,
          startTime: report.startTime.toISOString(),
          endTime: report.endTime.toISOString(),
        };
      } catch (error) {
        console.error("Error fetching weather report:", error);
        throw new GraphQLError("Failed to fetch weather report", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    compareWeatherReports: async (
      _: any,
      { reportId1, reportId2 }: { reportId1: string; reportId2: string },
      context: AppContext
    ) => {
      const { authorizedUser, prisma } = context;
      // Require authentication for comparing reports
      if (!authorizedUser) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const [report1, report2] = await prisma.weatherReport.findMany({
          where: {
            OR: [
              { id: reportId1, userId: authorizedUser.id },
              { id: reportId2, userId: authorizedUser.id },
            ],
          },
        });

        if (!report1 || !report2) {
          throw new GraphQLError("One or both reports not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        if (!report1 || !report2) {
          throw new GraphQLError("One or both reports not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        const comparison = {
          report1: {
            ...report1,
            startTime: report1.startTime.toISOString(),
            endTime: report1.endTime.toISOString(),
          },
          report2: {
            ...report2,
            startTime: report2.startTime.toISOString(),
            endTime: report2.endTime.toISOString(),
          },
          deviations: {
            temperature: Math.abs((report2.avgTemperature || 0) - (report1.avgTemperature || 0)),
            pressure: Math.abs((report2.avgPressure || 0) - (report1.avgPressure || 0)),
            humidity: Math.abs((report2.avgHumidity || 0) - (report1.avgHumidity || 0)),
            cloudCover: Math.abs((report2.avgCloudCover || 0) - (report1.avgCloudCover || 0)),
          },
        };

        return comparison;
      } catch (error) {
        console.error("Error comparing weather reports:", error);
        throw new GraphQLError("Failed to compare weather reports", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
    weatherDataMeta: async (_: any, { range }: { range: DateRangeInput }) => {
      try {
        const count = await weatherService.countWeatherData(new Date(range.startTime), new Date(range.endTime));
        return { count };
      } catch (error) {
        console.error("Error fetching weather data meta:", error);
        throw new GraphQLError("Failed to fetch weather data meta", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
  Mutation: {
    saveWeatherReport: async (_: any, { input }: { input: any }, context: AppContext) => {
      const { prisma, authorizedUser } = context;

      try {
        if (!authorizedUser) {
          return {
            success: false,
            message: "Authentication required",
            errors: [{ message: "Authentication required" }],
          };
        }

        const userId = authorizedUser.id;
        const { title, startTime, endTime, temperature, pressure, humidity, cloudCover } = input;

        // Create a simplified report with user data
        const reportData = {
          title: title,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          avgTemperature: temperature,
          avgPressure: pressure,
          avgHumidity: humidity,
          avgCloudCover: cloudCover,
          dataPointsCount: 1,
          userId: userId,
        };

        await prisma.weatherReport.create({
          data: reportData,
        });

        return {
          success: true,
          message: "Weather report saved successfully",
        };
      } catch (error) {
        console.error("Error saving weather report:", error);
        return {
          success: false,
          message: "Failed to save weather report",
          errors: [{ message: error instanceof Error ? error.message : "Unknown error" }],
        };
      }
    },
  },
};
