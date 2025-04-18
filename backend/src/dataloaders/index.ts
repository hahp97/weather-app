import type { PrismaInstance } from "@/types";
import * as loaderFunctions from "./loaders";
export type BuildLoaderFunction = typeof buildDataloaders;

export function buildDataloaders(prisma: PrismaInstance, datamap = new Map()) {
  (Object.values(loaderFunctions).map((e) => e.default) as BuildLoaderFunction[]).forEach(
    (loader: BuildLoaderFunction) => {
      loader(prisma, datamap);
    }
  );
  return datamap;
}
