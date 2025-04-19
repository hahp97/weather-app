import { prisma } from "@/database/prisma";
import express from "express";

export type TUser = {
  id: string;
  email: string;
  username: string;
  password: string;
  name: string;
  superAdmin: boolean;

  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

export type TCreateToken = (params: {
  user: TUser;
  tokenSecret1: string;
  tokenSecret2: string;
  expiresInToken?: string;
  expiresInRefreshToken?: string;
}) => Promise<[string, string]>;

export type TRefreshTokens = (
  refreshToken: string,
  context: {
    prisma?: any;
  }
) => Promise<{
  token: string;
  refreshToken: string;
  user: TUser;
}>;

export type PrismaInstance = typeof prisma;

export type RequestType = express.Request & {
  token?: string;
  refreshToken?: string;
  user?: any;
  customer?: any;
  headers: any;
  context?: any;
};
type AuthResponse = {
  code: string;
  success: boolean;
};
export type AppContext = {
  authResponse?: AuthResponse;
  prisma: PrismaInstance;
  dataloaders: Map<string, any>;
  authorizedUser?: any;
  networkInfo?: any;
  request?: RequestType;
  response?: express.Response;
};
