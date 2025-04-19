export default `#graphql
type SystemConfig {
  id: ID
  key: String
  value: String
  createdAt: DateTime
  updatedAt: DateTime
}

enum SystemConfigOrder {
  key_ASC
  key_DESC
  value_ASC
  value_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

input SystemConfigFilter {
  AND: [SystemConfigFilter!]
  OR: [SystemConfigFilter!]
  key_regex: String
  value_regex: String
  createdAt_gte: DateTime
  createdAt_lte: DateTime
}

type Query {
  systemConfigs(first: Int, skip: Int, filter: SystemConfigFilter, orderBy: [SystemConfigOrder]): [SystemConfig]
  systemConfigsMeta(filter: SystemConfigFilter): ObjectMeta
  systemConfig(key: String!): SystemConfig
}

input UpdateSystemConfigInput {
  key: String!
  value: String!
}

type Mutation {
  updateSystemConfig(input: UpdateSystemConfigInput!): SystemConfigResponse
}

type SystemConfigResponse {
  success: Boolean
  message: String
  config: SystemConfig
  errors: [Error!]
}

type SystemConfigSubscriptionPayload {
  mutation: _ModelMutationType!
  node: SystemConfig
}

type Subscription {
  SystemConfig(filter: SubscriptionFilter, dataFilter: SystemConfigFilter): SystemConfigSubscriptionPayload
}
`;
