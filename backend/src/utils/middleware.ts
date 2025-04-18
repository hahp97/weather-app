import { prisma } from "@/database/prisma";
import { refreshCustomerTokens, refreshTokens } from "@/lib/auth";
import { RequestType } from "@/types";
import { getConfigs } from "@/utils/configs";
import { getCookies } from "@/utils/cookie";
import { NextFunction, Response } from "express";
import { slowDown } from "express-slow-down";
import jwt from "jsonwebtoken";

export type MiddlewareFunction = (req: RequestType, res: Response, next: NextFunction) => Promise<void>;

export const addTokens: MiddlewareFunction = async (req, res, next) => {
  let token = req.headers["x-token"];
  let refreshToken = req.headers["x-refresh-token"];
  const cookies = getCookies({ request: req });

  if (req.headers.host == (req.headers.origin || "").replace("https://", "").replace("http://", "") && cookies?.token) {
    token = cookies.token;
    refreshToken = cookies.refreshToken;
  }

  req.token = token;
  req.refreshToken = refreshToken;

  next();
};

export const addUser: MiddlewareFunction = async (req, res, next) => {
  const { secret1 } = getConfigs();
  const token = req.token;
  const refreshToken = req.refreshToken;

  if (!token) {
    return next();
  }

  try {
    const jwtData = jwt.verify(token, secret1 as string) as any;
    req.user = jwtData.user;
  } catch (err) {
    if (!refreshToken) return next();

    const newTokens = await refreshTokens(refreshToken as string, { prisma: prisma });
    if (newTokens.token && newTokens.refreshToken) {
      res.set("Access-Control-Expose-Headers", "x-token, x-refresh-token");
      res.set("x-token", newTokens.token);
      res.set("x-refresh-token", newTokens.refreshToken);
    }
    req.user = newTokens.user;
  }

  next();
};

export const addCustomer: MiddlewareFunction = async (req, res, next) => {
  const { secret1 } = getConfigs();
  const token = req.token;
  const refreshToken = req.refreshToken;
  if (!token) {
    return next();
  }

  try {
    const jwtData = jwt.verify(token, secret1 as string) as any;
    req.customer = jwtData.customer;
  } catch (err) {
    if (!refreshToken) return next();

    const newTokens = await refreshCustomerTokens(refreshToken as string, { prisma: prisma });
    if (newTokens.token && newTokens.refreshToken) {
      res.set("Access-Control-Expose-Headers", "x-token, x-refresh-token");
      res.set("x-token", newTokens.token);
      res.set("x-refresh-token", newTokens.refreshToken);
    }
    req.customer = newTokens.customer;
  }

  next();
};

export const limiter = slowDown({
  windowMs: 10 * 60 * 1000,
  delayAfter: 100,
  delayMs: (hits) => hits * 50,
  maxDelayMs: 1000,
  keyGenerator: (req): string | Promise<string> => {
    if (!req.ip) {
      console.error("Warning: request.ip is missing!");
      return req.socket.remoteAddress as string;
    }

    return req.ip.replace(/:\d+[^:]*$/, "");
  },
});
