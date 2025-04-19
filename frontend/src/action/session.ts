"use server";

import { getServerTokens } from "@/action/auth";
import GetMeGql from "@/graphql/query/user/me.gql";
import { getApolloClient } from "@/libs/apollo/client";
import { RedirectType, redirect } from "next/navigation";

export async function checkAuthentication() {
  const { token, refreshToken } = await getServerTokens();
  if (!token || !refreshToken) {
    redirect("/login", RedirectType.replace);
  }

  const session = await getSession();

  return session;
}

export async function getSession() {
  const me = await ssrGetMe();

  return {
    me: me || null,
  };
}

export async function checkAuthenticated() {
  const { token, refreshToken } = await getServerTokens();
  if (!token || !refreshToken) {
    return;
  }

  const session = await getSession();
  if (session.me) {
    redirect("/", RedirectType.replace);
  }

  return session;
}

export async function ssrGetMe() {
  let me;
  try {
    const response = await getApolloClient().query({
      query: GetMeGql,
      fetchPolicy: "no-cache",
    });
    me = response.data?.myProfile;
  } catch (error) {
    console.log("[SERVER ERROR] getMe", error);
  }
  return me;
}
