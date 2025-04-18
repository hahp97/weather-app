import { ApolloServer, GraphQLRequestContext, GraphQLRequestContextExecutionDidStart } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { useServer } from "graphql-ws/lib/use/ws";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { WebSocketServer } from "ws";

import { prisma } from "@/database/prisma";
import { buildDataloaders } from "@/dataloaders";
import { refreshTokens } from "@/libs/auth";
import type { AppContext, PrismaInstance, RequestType } from "@/types/index";
import { getConfigs } from "@/utils/configs";
import { setCookies } from "@/utils/cookie";
import express from "express";
import { GraphQLError } from "graphql";
import { schema } from "./schema";

const { secret1, secret2 } = getConfigs();

export async function createApolloServerMiddleware({ httpServer }: { httpServer: http.Server }) {
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async ({ connectionParams }, msg, args) => {
        return await buildAppContext(
          {
            token: connectionParams?.token as string,
            refreshToken: connectionParams?.refreshToken as string,
          },
          {}
        );
      },
      onDisconnect(ctx, code, reason) {
        console.log("Subscription Server Disconnected!");
      },
    },
    wsServer
  );

  const server = new ApolloServer<AppContext>({
    schema: schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          console.log("Apollo Server is starting...");
          return {
            async drainServer() {
              console.log("Apollo Server is stopping...");
              await serverCleanup.dispose();
            },
          };
        },
      },
      {
        async requestDidStart(initialRequestContext: GraphQLRequestContext<AppContext>) {
          return {
            async executionDidStart(executionRequestContext: GraphQLRequestContextExecutionDidStart<AppContext>) {
              return {
                willResolveField({ source, args, contextValue, info }) {
                  return (error, result) => {
                    if (!error && `${info.parentType.name}.${info.fieldName}` === "Mutation.signIn" && result.success) {
                      try {
                        const { response, request } = contextValue;
                        const { token, refreshToken } = result;
                        setCookies({ token, refreshToken }, { request, response });
                      } catch (error) {
                        // DO NOTHING
                        console.log("error when set cookie, skip");
                      }
                    }
                  };
                },
              };
            },
          };
        },
      },
    ],
    // cache: createCacheStore(),
    allowBatchedHttpRequests: true,
    introspection: getConfigs().appEnv !== "production",
  });

  await server.start();

  return expressMiddleware(server, {
    context: async ({ req, res }) => {
      const appCode = req.headers["x-app-code"] as string;
      const subdomain = req.headers["x-subdomain"] as string;
      const qrCode = req.headers["x-qr-code"] as string;

      return await buildAppContext(
        {
          appCode: appCode,
          subdomain: subdomain,
          qrCode: qrCode,
        },
        {
          request: req,
          response: res,
        }
      );
    },
  });
}

export async function buildAppContext(
  {
    token,
    refreshToken,
    subdomain,
    qrCode,
    appCode,
  }: {
    token?: string;
    refreshToken?: string;
    subdomain?: string;
    appCode?: string;
    qrCode?: string;
  },
  { request, response }: { request?: RequestType; response?: express.Response }
): Promise<AppContext> {
  let user = request?.user;

  if (!user) {
    user = await getUserFromTokens({ token, refreshToken }, { prisma });
  } else {
    user = await prisma.user.findFirst({ where: { id: user.id, active: true } });
  }

  const networkInfo = {
    ip: request?.ip,
    userAgent: request?.headers["user-agent"],
    referer: request?.headers["referer"],
    host: request?.headers["host"],
    origin: request?.headers["origin"],
    timezone: request?.headers["customer-timezone"] ? JSON.parse(request?.headers["customer-timezone"]) : null,
    hostname: request?.hostname,
    originalUrl: request?.originalUrl,
    method: request?.method,
    xhr: request?.xhr,
  };

  const authResponse = await checkToken(request?.refreshToken as string, { secret2 });

  return {
    authResponse: authResponse,
    authorizedUser: user || null,
    prisma: prisma,
    networkInfo,
    request,
    response,
    dataloaders: buildDataloaders(prisma),
  };
}

export async function checkToken(refreshToken: string, context: any) {
  const { secret2 } = context;
  if (!refreshToken) return { success: true, code: "NOT_FOUND_TOKEN" };

  try {
    const decodedToken = jwt.verify(refreshToken, secret2) as JwtPayload;

    if (!decodedToken.exp) {
      return { success: false, code: "INVALID_TOKEN" };
    }

    return { success: true, code: "VALID_TOKEN" };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, code: "TOKEN_EXPIRED" };
    } else if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, code: "INVALID_TOKEN" };
    } else if (error instanceof GraphQLError) {
      return { success: false, code: error.message };
    } else {
      return { success: false, code: "INTERNAL_SERVER_ERROR" };
    }
  }
}

export async function getUserFromTokens(
  { token, refreshToken }: { token?: string; refreshToken?: string },
  { prisma }: { prisma: PrismaInstance }
) {
  if (!token) return null;

  let user = null;

  try {
    const decode: any = jwt.verify(token, secret1 as string);
    user = decode.user;
  } catch (error: any) {
    if (!refreshToken) return null;
    const newTokens = await refreshTokens(refreshToken, { prisma });
    user = newTokens.user;
  }

  if (!user?.id) return null;

  return await prisma.user.findFirst({
    where: { id: user.id, active: true },
  });
}
