import Cookies from "universal-cookie";
export const COOKIE_NAMESPACE_KEY = "__koomi_cloud_fnb_dashboard__";

export function setCookie(key: string, value: string) {
  const cookies = new Cookies();
  const currentValues = cookies.get(COOKIE_NAMESPACE_KEY) || {};
  currentValues[key] = value;
  cookies.set(COOKIE_NAMESPACE_KEY, currentValues, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function getCookie(key: string) {
  const cookies = new Cookies();
  const currentValues = cookies.get(COOKIE_NAMESPACE_KEY) || {};
  return currentValues[key];
}

export function clearCookie(key: string) {
  const cookies = new Cookies();
  const currentValues = cookies.get(COOKIE_NAMESPACE_KEY) || {};
  delete currentValues[key];
  cookies.set(COOKIE_NAMESPACE_KEY, currentValues, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function getAllCookies() {
  const cookies = new Cookies();
  const currentValues = cookies.get(COOKIE_NAMESPACE_KEY) || {};
  return currentValues;
}

export function clearAllCookies() {
  const cookies = new Cookies();
  cookies.remove(COOKIE_NAMESPACE_KEY, { path: "/" });
}
