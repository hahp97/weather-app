export default `#graphql
type User {
  id: ID
  email: String
  username: String
  name: String
  
  lastSignedInAt: DateTime
  isEmailVerified: Boolean

  createdAt: DateTime
  updatedAt: DateTime
  mobile: PhoneNumberObject
  active: Boolean
  superAdmin: Boolean
}

enum UserOrder {
  email_ASC
  email_DESC
  username_ASC
  username_DESC
  name_ASC
  name_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

input UserFilter {
  AND: [UserFilter!]
  OR: [UserFilter!]
  email_regex: String
  username_regex: String
  name_regex: String
  createdAt_gte: DateTime
  createdAt_lte: DateTime
  mobile_is: FilterMobile
}

input FilterMobile {
  code: String
  country: String
  number_contains: String
}

type Query {
  users(first: Int, skip: Int, filter: UserFilter, orderBy: [UserOrder]): [User]
  usersMeta(filter: UserFilter): ObjectMeta
  user(id: ID!): User
  me: User
  resetPasswordInfo(code: String!): CommonResponse
  createPasswordInfo(code:String!) : CommonResponse
  verifyEmail(token: String!): CommonResponse
}

input merchantRole {
  role: String!
  merchantId: String!
  id: String
}

input CreateUserInput {
  email: String!
  username: String!
  name: String!
  superAdmin: Boolean
  callbackUrl: String!
  merchantRoles: [merchantRole]
  mobile: PhoneNumberObject!
  active: Boolean
}

input SignUpInput {
  email: String!
  username: String!
  password: String!
  name: String!
  mobile: PhoneNumberObject!
}

input UpdateUserInput {
  name: String
  email: String
  merchantRoles: [merchantRole]
  merchantId: String
  mobile: PhoneNumberObject
  active: Boolean
}

input VerifyOTPInput {
  email: String!
  otp: String!
}

type SignInResponse{
  token: String
  refreshToken: String
  success:Boolean
  message:String 
  errors:[Error!]
}

type OTPResponse {
  success: Boolean!
  message: String!
  errors: [Error!]
}

input UpdateProfileInput{
  name: String
  currentPassword: String
  newPassword: String
  mobile: PhoneNumberObject
}

type Mutation {
  createUser(input: CreateUserInput!): CommonResponse
  updateUser(id: ID!, input: UpdateUserInput!): CommonResponse
  signIn(identifier: String!, password: String!): SignInResponse
  signUp(input: SignUpInput!): CommonResponse
  updateProfile(input: UpdateProfileInput!): CommonResponse
  resendNewUser(id: ID!,callbackUrl: String!): CommonResponse
  createPassword(code: String!, newPassword: String!): CommonResponse
  forgotPassword(email: String!, callbackUrl: String!): CommonResponse
  resetPassword(code: String!, newPassword: String!, callbackUrl: String!): CommonResponse
  verifyEmailRequest(email: String!): CommonResponse
  
  # OTP related mutations
  sendOTP(email: String!): OTPResponse
  verifyOTP(input: VerifyOTPInput!): OTPResponse
  resetPasswordWithOTP(email: String!, otp: String!, newPassword: String!): OTPResponse
}

type UserSubscriptionPayload {
  mutation: _ModelMutationType!
  node: User
}

type Subscription {
  User(filter: SubscriptionFilter, dataFilter: UserFilter): UserSubscriptionPayload
}
`;
