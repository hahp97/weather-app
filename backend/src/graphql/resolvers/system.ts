import { compareObject } from "@/helpers/model";
import type { AppContext } from "@/types";
import { getConfigs } from "@/utils/configs";
import pubsub from "@/utils/pubsub";
import { normalizeQueryArgs } from "@/utils/query";
import { normalizeErrors } from "@/utils/zod";
import { updateSystemConfigSchema } from "@/validators/system";
import { withFilter } from "graphql-subscriptions";

export default {
  Subscription: {
    SystemConfig: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(getConfigs().appNamespace + "-SystemConfig"),
        (payload, args) => {
          if (!payload) {
            return false;
          }
          return compareObject(payload.SystemConfig.node, args.dataFilter);
        }
      ),
    },
  },
  Query: {
    systemConfigs: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;
      const { first, skip, filter, orderBy } = normalizeQueryArgs(args);

      return prisma.systemConfig.findMany({
        take: first,
        skip: skip,
        where: filter,
        orderBy: orderBy,
      });
    },
    systemConfigsMeta: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;
      const { filter } = normalizeQueryArgs(args);

      const count = await prisma.systemConfig.count({
        where: filter,
      });

      return {
        count,
      };
    },
    systemConfig: async (parent: any, args: any, context: AppContext, info: any) => {
      const { prisma } = context;
      const { key } = args;

      return prisma.systemConfig.findFirst({
        where: {
          key,
        },
      });
    },
  },
  Mutation: {
    updateSystemConfig: async (parent: any, args: any, context: AppContext, info: any) => {
      try {
        const { prisma, authorizedUser } = context;

        if (!authorizedUser || !authorizedUser.superAdmin) {
          return {
            success: false,
            message: "Admin privileges required",
          };
        }

        const { error, data } = updateSystemConfigSchema.safeParse(args.input);

        if (error) {
          return {
            success: false,
            message: "Invalid input",
            errors: normalizeErrors(error.errors),
          };
        }

        const { key, value } = data;

        const config = await prisma.systemConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });

        await pubsub.publish(getConfigs().appNamespace + "-SystemConfig", {
          SystemConfig: {
            mutation: "UPDATED",
            node: config,
          },
        });

        return {
          success: true,
          message: "System configuration updated successfully",
          config,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message,
        };
      }
    },
  },
};
