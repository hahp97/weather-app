import type { PrismaInstance } from "@/types";
import DataLoader from "dataloader";

async function batchGetUserByIds(prisma: PrismaInstance, keys: readonly string[]) {
  return await prisma.user.findMany({
    where: {
      id: {
        in: keys.filter(Boolean),
      },
    },
  });
}

export default function UserLoader(prisma: PrismaInstance, datamap = new Map()) {
  datamap.set(
    "userByIdLoader",
    new DataLoader(
      (keys: readonly string[]) => {
        const promise = batchGetUserByIds(prisma, keys);
        return Promise.all(
          keys.map(async (key) => {
            const result = await promise;
            return result.find((record) => record.id.toString() === key.toString());
          })
        );
      },
      { cacheKeyFn: String }
    )
  );
  return datamap;
}
