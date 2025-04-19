import { PrismaClient } from "@prisma/client";

export interface User {
  id: string;
  role: string;
}

export interface Context {
  prisma: PrismaClient;
  user?: User;
}
