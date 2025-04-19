# Changi Airport Weather Report System - Backend

This backend service provides the API and data management layer for the Changi Airport Weather Report System, handling weather data collection, storage, and analysis.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Features](#core-features)
- [Technical Implementation](#technical-implementation)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Data Models](#data-models)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development and Extension](#development-and-extension)

## Architecture Overview

The backend follows a modern Node.js architecture using TypeScript, Express, GraphQL, and MongoDB:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  OpenWeather    │     │   Backend API   │     │    Frontend     │
│      API        │◄────┤  (GraphQL)      │◄────┤   Application   │
└─────────────────┘     └───────┬─────────┘     └─────────────────┘
                               │
                      ┌────────▼────────┐
                      │    MongoDB      │
                      │  (Time Series)  │
                      └─────────────────┘
```

- **API Layer**: GraphQL with Apollo Server
- **Data Layer**: MongoDB with time-series collections
- **ORM**: Prisma for type-safe database access
- **Authentication**: JWT-based with secure password hashing
- **Background Jobs**: Scheduled data collection using Node.js schedulers

## Core Features

### 1. Weather Data Collection

- Automated collection from OpenWeather API at 5-minute intervals
- Support for both current and historical weather data
- Error handling and retry mechanisms for API failures

### 2. Data Management

- Efficient storage using MongoDB time-series collections
- Data aggregation for reporting and analysis
- Data validation and sanitization

### 3. Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password encryption and secure storage
- Role-based access control

### 4. Report Generation

- On-demand weather report creation
- Historical data retrieval and analysis
- Comparative analysis between different time periods

### 5. GraphQL API

- Type-safe API with comprehensive schema definitions
- Efficient data fetching with DataLoaders
- Real-time subscriptions for live data updates

## Technical Implementation

### GraphQL Layer

The API is built using Apollo Server with a modular schema approach, allowing for:

- Type-safe operations with TypeScript integration
- Efficient querying with field-level resolution
- Built-in documentation through GraphQL's introspection
- Optimized database access patterns

### Database Design

We use MongoDB with time-series collections to efficiently store and query temporal weather data:

- Time-based indexing for fast historical queries
- Bucketing strategy for optimized storage
- Schema validation at the database level

### Authentication Flow

1. User signs up/logs in with email and password
2. Backend validates credentials and issues a JWT
3. JWT is stored in HTTP-only cookies for security
4. All authorized requests include the JWT for validation

### Background Job System

The system includes a robust job scheduling framework for:

- Regular weather data collection
- Database maintenance and cleanup
- Report generation and email notifications

## Project Structure

```
backend/
├── prisma/                   # Prisma schema and migrations
├── src/
│   ├── api/                  # External API integrations
│   │   └── openweather/      # OpenWeather API client
│   ├── configs/              # Application configuration
│   ├── constants/            # Application constants
│   ├── database/             # Database connection and services
│   ├── dataloaders/          # GraphQL data loaders
│   ├── graphql/              # GraphQL schema and resolvers
│   │   ├── resolvers/        # Query and mutation resolvers
│   │   └── types/            # GraphQL type definitions
│   ├── helpers/              # Helper functions
│   ├── jobs/                 # Background job definitions
│   │   └── background/       # Scheduled background tasks
│   ├── libs/                 # Library code
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   │   ├── auth.ts           # Authentication utilities
│   │   └── ...
│   ├── validators/           # Input validation schemas
│   └── index.ts              # Application entry point
```

## API Documentation

### GraphQL Schema

The API provides the following main operations:

#### Queries

- `currentWeather`: Get current weather data for Changi Airport
- `weatherHistory`: Get historical weather data for a specified time range
- `report`: Get a specific weather report by ID
- `reports`: Get all reports with optional filtering
- `user`: Get user information

#### Mutations

- `generateReport`: Create a new weather report for a specified time
- `compareReports`: Compare two reports and generate deviation data
- `registerUser`: Create a new user account
- `login`: Authenticate a user and issue JWT
- `updateUserPreferences`: Update user settings

#### Subscriptions

- `weatherUpdates`: Real-time updates for current weather

## Data Models

### Weather Data

```typescript
type WeatherData {
  timestamp: DateTime!
  temperature: Float!
  pressure: Float!
  humidity: Float!
  cloudCover: Float!
}
```

### Weather Report

```typescript
type WeatherReport {
  id: ID!
  createdAt: DateTime!
  timestamp: DateTime!
  temperature: Float!
  pressure: Float!
  humidity: Float!
  cloudCover: Float!
  createdBy: User
}
```

### User

```typescript
type User {
  id: ID!
  email: String!
  name: String
  reports: [WeatherReport!]!
}
```

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB v5+ (with time series collections support)
- OpenWeather API key

### Installation

1. Clone the repository
2. Install dependencies

   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables by creating a `.env` file:

   ```
   DATABASE_URL="mongodb://localhost/weather_report_development?directConnection=true"
   SECRET1="your_secret_key_1"
   SECRET2="your_secret_key_2"
   JWT_SECRET="your_jwt_secret"
   FRONTEND_URL="http://localhost:3000"
   PORT=4000
   NODE_ENV="development"
   OPEN_WEATHER_API_KEY="your_openweather_api_key"
   ```

4. Generate Prisma client

   ```bash
   npx prisma generate
   ```

5. Set up the database (creates time-series collections)

   ```bash
   npm run db:setup
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

The GraphQL server will be available at http://localhost:4000/graphql

## Configuration

### Environment Variables

| Variable               | Description                          | Default                                          |
| ---------------------- | ------------------------------------ | ------------------------------------------------ |
| `DATABASE_URL`         | MongoDB connection string            | `mongodb://localhost/weather_report_development` |
| `PORT`                 | Server port                          | `4000`                                           |
| `NODE_ENV`             | Environment (development/production) | `development`                                    |
| `JWT_SECRET`           | Secret for JWT signing               | -                                                |
| `OPEN_WEATHER_API_KEY` | OpenWeather API key                  | -                                                |
| `EMAIL_HOST`           | SMTP server for emails               | -                                                |
| `EMAIL_PORT`           | SMTP port                            | `587`                                            |
| `EMAIL_USER`           | SMTP username                        | -                                                |
| `EMAIL_PASS`           | SMTP password                        | -                                                |
| `EMAIL_FROM`           | Sender email address                 | `noreply@weatherreport.com`                      |
| `FRONTEND_URL`         | URL of frontend application          | `http://localhost:3000`                          |

## Development and Extension

### Adding New Features

The modular architecture makes it easy to extend the system:

1. **New Data Points**: Update the Prisma schema and GraphQL types
2. **Additional APIs**: Add new clients in the `api/` directory
3. **New GraphQL Operations**: Add resolvers and types in the `graphql/` directory

### Background Jobs

To add new background jobs:

1. Create a new job file in `jobs/background/`
2. Register the job in `jobs/index.ts`
3. Configure the schedule as needed

### Testing

Run the test suite with:

```bash
npm test
```

The backend includes unit tests for:

- GraphQL resolvers
- Database services
- Authentication logic
- Background jobs
