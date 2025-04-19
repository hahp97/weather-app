"use client";

import { getConfigs } from "@/utils/configs";
import { ApolloProvider } from "@apollo/client";
import { ReactNode, useMemo } from "react";
import { createApolloClient } from "./client";

interface ApolloWrapperProps {
  children: ReactNode;
}

export function ApolloWrapper({ children }: ApolloWrapperProps) {
  const client = useMemo(() => {
    return createApolloClient({
      ssr: false,
      config: getConfigs(),
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
