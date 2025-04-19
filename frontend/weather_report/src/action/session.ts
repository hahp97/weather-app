"use server";

import { getServerTokens } from "@/action/auth";
import { createApolloClient } from "@/libs/apollo/client";
import { GetMeGql } from "@/libs/apollo/queries";
import { getConfigs } from "@/utils/configs";
import { ApolloClient } from "@apollo/client";
import { RedirectType, redirect } from "next/navigation";

export async function checkAuthentication() {
  const { token, refreshToken } = await getServerTokens();
  if (!token || !refreshToken) {
    redirect("/login", RedirectType.replace);
  }

  // TODO: skip checking session for now, this make slow the page
  const session = await getSession();
  // if (!session.me) {
  //   redirect("/login", RedirectType.replace);
  // }

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

let apolloClient: ApolloClient<Record<string, unknown>>;

function getApolloClient() {
  if (apolloClient) return apolloClient;
  apolloClient = createApolloClient({ ssr: true, config: getConfigs() });
  return apolloClient;
}
