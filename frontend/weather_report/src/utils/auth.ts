import Cookies from "universal-cookie";

// Client-side cookies
const cookies = new Cookies();

export function getTokens() {
  const token = cookies.get("x-token");
  const refreshToken = cookies.get("x-refresh-token");
  return { token, refreshToken };
}

export function setTokens({
  token,
  refreshToken,
}: {
  token: string;
  refreshToken: string;
}) {
  cookies.set("x-token", token, { path: "/" });
  cookies.set("x-refresh-token", refreshToken, { path: "/" });
}

export function clearTokens() {
  cookies.remove("x-token", { path: "/" });
  cookies.remove("x-refresh-token", { path: "/" });
}

export function isAuthenticated() {
  const { token, refreshToken } = getTokens();
  return !!token && !!refreshToken;
}
