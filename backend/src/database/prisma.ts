import { PrismaClient, Prisma } from "@prisma/client";
import { createSoftDeleteExtension } from "prisma-extension-soft-delete";

const softDeleteModels = Prisma.dmmf.datamodel.models.reduce((models: string[], modelDef) => {
  if (modelDef.fields.some((field) => field.name === "deletedAt" && field.type === "DateTime")) {
    return [...models, modelDef.name];
  }
  return models;
}, []);

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error", "query"],
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
  },
})
  .$extends({
    name: "auto-set-deleted-at-null",
    query: {
      $allOperations({ model, operation, args, query }) {
        if (!softDeleteModels.includes(String(model))) return query(args);

        if (["create"].includes(operation)) {
          args.data = {
            ...(args.data || {}),
            deletedAt: null,
          };
        } else if (["createMany"].includes(operation)) {
          args.data = (args.data as Array<any>).map((e) => ({
            ...(e || {}),
            deletedAt: null,
          }));
        } else if (operation === "upsert") {
          args.create = {
            ...(args.create || {}),
            deletedAt: null,
          };
          args.update = {
            ...(args.update || {}),
            deletedAt: null,
          };
        }
        return query(args);
      },
    },
  })
  .$extends(
    createSoftDeleteExtension({
      models: softDeleteModels.reduce(
        (models: Record<string, boolean>, modelName: string) => ({ ...models, [modelName]: true }),
        {}
      ),
      defaultConfig: {
        field: "deletedAt",
        createValue: (deleted) => (deleted ? new Date() : null),
        allowToOneUpdates: true,
        allowCompoundUniqueIndexWhere: true,
      },
    })
  )
  .$extends({
    model: {
      $allModels: {
        async exists<T>(this: T, where: Prisma.Args<T, "findFirst">["where"]): Promise<boolean> {
          const context = Prisma.getExtensionContext(this);
          const result = await (context as any).findFirst({ where });
          return result !== null;
        },
      },
    },
  });
