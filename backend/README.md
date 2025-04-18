# Weather Report System Backend

Backend API for the Changi Airport weather reporting system, providing APIs for weather data retrieval, report generation, and user management.

## Installation

```bash
# Clone repository
git clone <repository-url>

# Move to backend directory
cd backend

# Install dependencies
yarn install

# Create .env file from .env.example and update environment variables
cp .env.example .env

# Run migration and create database
npx prisma generate

# Run server in development environment
yarn dev
```

## Authentication and User Permissions System

### User Types

The system has two types of users:

1. **Admin (superAdmin = true)**

   - Has full access to manage all users and reports in the system
   - Can create other admin accounts
   - Can access and manage all weather reports
   - Can configure system settings including weather API update intervals

2. **Regular User (superAdmin = false)**
   - Can create and view personal weather reports
   - Can manage personal information
   - Cannot access other users' resources

### Authentication Flow

#### User Self-Registration

1. User fills in registration information: email, username, password, name, and phone number
2. Backend checks if email and username already exist
3. If not exists, creates a new user account with regular user permissions (superAdmin = false)
4. Sends verification email to the registered email address
5. User clicks verification link to complete registration
6. System updates isEmailVerified status to true

```graphql
mutation SignUp($input: SignUpInput!) {
  signUp(input: $input) {
    success
    message
    errors {
      message
      field
    }
  }
}
```

#### Email Verification

1. User clicks verification link in email
2. Frontend redirects to verification page with token
3. Frontend calls email verification API with token

```graphql
query VerifyEmail($token: String!) {
  verifyEmail(token: $token) {
    success
    message
  }
}
```

#### Login

1. User enters email/username and password
2. Backend authenticates and returns JWT token and refresh token
3. Frontend stores token and uses it for subsequent API requests

```graphql
mutation SignIn($identifier: String!, $password: String!) {
  signIn(identifier: $identifier, password: $password) {
    success
    message
    token
    refreshToken
    errors {
      message
    }
  }
}
```

#### Forgot Password

1. User enters email to request password reset
2. Backend sends email with password reset link
3. User clicks link and sets new password

```graphql
mutation ForgotPassword($email: String!, $callbackUrl: String!) {
  forgotPassword(email: $email, callbackUrl: $callbackUrl) {
    success
    message
  }
}
```

#### Reset Password

```graphql
mutation ResetPassword($code: String!, $newPassword: String!, $callbackUrl: String!) {
  resetPassword(code: $code, newPassword: $newPassword, callbackUrl: $callbackUrl) {
    success
    message
  }
}
```

### Permissions and Features

#### Common Features

| Feature                     | Admin | Regular User |
| --------------------------- | ----- | ------------ |
| Login                       | ✅    | ✅           |
| Register Account            | ✅    | ✅           |
| Forgot Password             | ✅    | ✅           |
| View Personal Information   | ✅    | ✅           |
| Update Personal Information | ✅    | ✅           |

#### Weather Report Features

| Feature               | Admin | Regular User          |
| --------------------- | ----- | --------------------- |
| View Current Weather  | ✅    | ✅                    |
| Create Weather Report | ✅    | ✅                    |
| View Own Reports      | ✅    | ✅                    |
| View Others' Reports  | ✅    | ❌                    |
| Compare Reports       | ✅    | ✅ (own reports only) |

#### User Management Features

| Feature                           | Admin | Regular User |
| --------------------------------- | ----- | ------------ |
| View User List                    | ✅    | ❌           |
| Create Accounts (including admin) | ✅    | ❌           |
| Enable/Disable Accounts           | ✅    | ❌           |
| Update User Information           | ✅    | ❌           |

### Security

- JWT tokens used for API authentication
- Tokens have limited lifetime (access token: 4 days, refresh token: 7 days)
- Passwords are encrypted before database storage
- API rate limiting to prevent brute force attacks
- Email verification for account registration and password reset

## API GraphQL

Backend provides GraphQL API at `/graphql` endpoint with main queries and mutations:

### Weather API

- `currentWeather`: Get current weather data
- `generateWeatherReport`: Generate weather report
- `weatherReports`: Get list of weather reports
- `compareWeatherReports`: Compare two weather reports
- `updateWeatherInterval`: Configure weather API update interval (admin only)

### User API

- `signUp`: Register new account
- `signIn`: Login
- `me`: Get current user information
- `updateProfile`: Update personal information
- `users`: Get user list (admin only)
- `createUser`: Create user account (admin only)

## Directory Structure

```
backend/
│
├── prisma/          # Prisma schema and migrations
├── src/
│   ├── api/         # API clients (OpenWeather)
│   ├── configs/     # Application configurations
│   ├── constants/   # Constants
│   ├── database/    # Database connection and services
│   ├── graphql/     # GraphQL schema and resolvers
│   ├── helpers/     # Helper functions
│   ├── jobs/        # Background jobs (email, weather fetcher)
│   ├── libs/        # Libraries (auth, etc.)
│   ├── types/       # TypeScript type definitions
│   ├── utils/       # Utility functions
│   ├── validators/  # Zod validators
│   └── index.ts     # Entry point
```

## Phone Number Validation

The system supports phone numbers from two countries:

1. Singapore (Country Code: 65)

   - Format: 8 digits
   - Example: 65-12345678

2. Vietnam (Country Code: 84)
   - Format: 9-10 digits (excluding country code)
   - Examples: 84-912345678, 84-1234567890
