import {
  clearServerCookie,
  getServerCookie,
  setServerCookie,
} from "@/action/server-cookie";

export async function getServerTokens() {
  const token = await getServerCookie("x-token");
  const refreshToken = await getServerCookie("x-refresh-token");
  return { token, refreshToken };
}

export function setServerTokens({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) {
  setServerCookie("x-token", token);
  setServerCookie("x-refresh-token", refreshToken);
}

export async function clearServerTokens() {
  await clearServerCookie("x-token");
  await clearServerCookie("x-refresh-token");
}
