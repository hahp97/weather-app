import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/constants";
import type { AppContext } from "@/types";
import buildPrismaOrder from "@/utils/buildPrismaOrder";

export type NormalizedQueryArgs = {
  first: number;
  skip: number;
  filter: any;
  orderBy: string | string[];
};

export function normalizeQueryArgs({ first, skip, filter, orderBy }: NormalizedQueryArgs, context?: AppContext) {
  return {
    first: Math.min(Math.max(Number(first) || 0, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE),
    skip: Math.max(Number(skip) || 0, 0),
    filter,
    orderBy: buildPrismaOrder(orderBy),
  };
}
