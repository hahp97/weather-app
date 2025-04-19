import { ApolloClient, InMemoryCache, from, split } from "@apollo/client";

import { getServerTokens } from "@/action/auth";
import { getTokens } from "@/utils/auth";
import { BackendConfig, getConfigs } from "@/utils/configs";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const removeTypenameLink = removeTypenameFromVariables();

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

export type ApolloClientConfiguration = {
  initialState?: Record<string, unknown>;
  ssr?: boolean;
  config: BackendConfig;
};

export function createApolloClient({
  initialState = {},
  ssr = false,
  config,
}: ApolloClientConfiguration) {
  const authLink = setContext(async (_, { headers }) => {
    let token, refreshToken;

    if (!ssr) {
      ({ token, refreshToken } = getTokens());
    } else {
      ({ token, refreshToken } = await getServerTokens());
    }

    return {
      headers: {
        ...headers,
        "x-app-code": config.appCode,
        "x-token": token,
        "x-refresh-token": refreshToken,
      },
    };
  });

  const batchLink = new BatchHttpLink({
    uri: config.apiBaseUrl,
    batchMax: 5,
    batchInterval: 20,
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: config.subscriptionUrl,
      connectionParams: () => ({
        appCode: config.appCode,
        ...getTokens(),
      }),
    })
  );

  const splitLink = !ssr
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        batchLink
      )
    : batchLink;

  // Log any GraphQL errors or network error that occurred
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const link = from([authLink, removeTypenameLink, errorLink, splitLink]);

  return new ApolloClient({
    ssrMode: ssr,
    link,
    cache: new InMemoryCache(initialState),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
}

let apolloClient: ApolloClient<Record<string, unknown>>;

export function getApolloClient() {
  if (apolloClient) return apolloClient;
  apolloClient = createApolloClient({ ssr: true, config: getConfigs() });
  return apolloClient;
}
