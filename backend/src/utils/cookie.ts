import { RequestType } from "@/types";
import { getConfigs } from "@/utils/configs";
import express from "express";

export function getCookies({ request }: { request?: RequestType }) {
  try {
    return JSON.parse(request?.signedCookies[getConfigs().appNamespace + "-server"]);
  } catch (error) {
    return {};
  }
}
export function setCookies(
  objValue: object,
  { request, response }: { request?: RequestType; response?: express.Response }
) {
  response?.cookie(
    getConfigs().appNamespace + "-server",
    JSON.stringify({
      ...getCookies({ request }),
      ...objValue,
    }),
    {
      signed: true,
    }
  );
}
