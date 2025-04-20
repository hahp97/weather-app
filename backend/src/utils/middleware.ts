import { prisma } from "@/database/prisma";
import { refreshTokens } from "@/libs/auth";
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

// This middleware checks if the user is an admin and rejects the request if not
export const requireAdmin: MiddlewareFunction = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { id: req.user.id, active: true },
  });

  if (!user || !user.superAdmin) {
    res.status(403).json({
      success: false,
      message: "Admin privileges required",
    });
    return;
  }

  next();
};

// Rate limiter to prevent brute force attacks
export const limiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // allow 100 requests per window without delay
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  },
  maxDelayMs: 20000, // max delay is 20 seconds
  skip: (req) => {
    // Skip rate limiting for trusted IPs or development environment
    const { appEnv } = getConfigs();
    return appEnv === "development";
  },
});
