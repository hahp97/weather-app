export type PrismaOrderField = Record<string, "asc" | "desc">;
export type PrismaOrder = PrismaOrderField | PrismaOrderField[];

export default function buildPrismaOrder(orderBy: string | string[]): PrismaOrder {
  if (!orderBy) {
    return [];
  }
  if (typeof orderBy === "string") {
    const orderByField = orderBy.replace(/(_ASC|_DESC)$/, "");
    const [, orderByDirection] = orderBy.match(/_(ASC|DESC)$/) || ["", "asc"];

    return { [orderByField]: orderByDirection.toLocaleLowerCase() as "asc" | "desc" };
  } else if (Array.isArray(orderBy)) {
    return orderBy.map((o) => buildPrismaOrder(o) as PrismaOrderField);
  } else {
    return [];
  }
}
