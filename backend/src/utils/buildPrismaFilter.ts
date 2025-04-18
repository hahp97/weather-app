import type { AppContext } from "@/types";

/**
 * Builds a filter object for Prisma queries with common conditions
 * @param filter - Input filter object
 * @param options - Additional options like context
 * @returns Filter object compatible with Prisma
 */
const buildPrismaFilter = (filter: Record<string, any>, options?: { context?: AppContext }) => {
  const { context } = options || {};

  // Add deletedAt filter to ensure we only get non-deleted records
  const enhancedFilter = {
    ...filter,
    deletedAt: null,
  };

  return enhancedFilter;
};

export default buildPrismaFilter;
