import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { resolvers as scalarResolvers, typeDefs as scalarTypeDefs } from "graphql-scalars";
import path from "path";

import { makeExecutableSchema } from "@graphql-tools/schema";

const typeDefs = mergeTypeDefs([scalarTypeDefs, loadFilesSync(path.join(__dirname, "./types"))]);
const resolvers = mergeResolvers([scalarResolvers, ...loadFilesSync(path.join(__dirname, "./resolvers"))]);
export const schema = makeExecutableSchema({ typeDefs, resolvers });
