export default `#graphql
scalar PhoneNumberObject

type CommonResponse {
  success: Boolean
  message: String
  code: String
  errors: [Error!]
  extra: JSON
}

type Error {
  path: String
  field: String
  message: String
}

type ObjectMeta {
  count: Int
}

enum _ModelMutationType {
  CREATED
  UPDATED
  DELETED
}

input SubscriptionFilter {
  mutation_in: [_ModelMutationType!]
}
`;
