import { getServerTokens } from "@/action/auth";
import { getTokens } from "@/utils/auth";
import { getConfigs } from "@/utils/configs";
import axios, { Axios } from "axios";

let defaultAxios: Axios;

export function getAxios({ ssr = false, backendConfig = null }) {
  if (defaultAxios) return defaultAxios;
  const apiConfig = backendConfig || getConfigs();

  defaultAxios = axios.create({
    baseURL: apiConfig.apiBaseHost,
    headers: {
      "Content-Type": "application/json",
    },
  });

  defaultAxios.interceptors.request.use(async (config) => {
    let token, refreshToken;
    if (!ssr) {
      ({ token, refreshToken } = getTokens());
    } else {
      ({ token, refreshToken } = await getServerTokens());
    }
    config.headers["x-app-code"] = apiConfig.appCode;
    config.headers["x-token"] = token;
    config.headers["x-refresh-token"] = refreshToken;
    return config;
  });
  return defaultAxios;
}
