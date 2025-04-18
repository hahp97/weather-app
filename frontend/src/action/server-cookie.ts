"use server";

import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { cookies } from "next/headers";

export async function getServerCookie(name: string) {
  return getCookie(name, { cookies });
}

export async function setServerCookie(name: string, value: string) {
  setCookie(name, value, {
    cookies,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export async function clearServerCookie(name: string) {
  deleteCookie(name, { cookies, path: "/" });
}
