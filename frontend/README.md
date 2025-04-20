# Changi Airport Weather Report System - Frontend

This frontend application provides the user interface for the Changi Airport Weather Report System, allowing users to generate weather reports, view historical data, and compare reports over time.

## Table of Contents

- [User Interface Overview](#user-interface-overview)
- [Core Features](#core-features)
- [Technical Implementation](#technical-implementation)
- [Project Structure](#project-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [User Flows](#user-flows)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Development and Extension](#development-and-extension)

## User Interface Overview

The frontend provides a modern, responsive interface built with Next.js and React, featuring:

- **Dynamic Dashboard**: Real-time Changi Airport weather data visualization
- **Report Generation**: Interactive tools for creating current and historical reports
- **History View**: Sortable and filterable table of historical reports
- **Comparison Tool**: Side-by-side report comparison with deviation analysis
- **User Authentication**: Secure login and account management

## Core Features

### 1. Weather Dashboard

- Real-time weather display for Changi Airport
- Visual indicators for temperature, pressure, humidity, and cloud cover
- Auto-refresh capability with configurable intervals
- Responsive design for mobile and desktop viewing

### 2. Report Generation

- Generate reports for current weather conditions
- Create reports for specific historical dates and times
- Validation to prevent duplicate report creation
- Success/error feedback to users

### 3. History Management

- Tabular view of all previously generated reports
- Sort functionality by timestamp and weather metrics
- Filter reports by date ranges and specific criteria
- Select reports for detailed view or comparison
- Pagination for efficient navigation of large datasets

### 4. Report Comparison

- Side-by-side comparison of two selected reports
- Automatic calculation of deviations between metrics
- Visual highlighting of significant differences
- Option to save comparison results

### 5. User Authentication

- Secure login and registration
- Password reset functionality
- Profile management
- JWT-based session management
- Protected routes for authenticated users

## Technical Implementation

### Next.js Application

The frontend leverages Next.js 13+ with App Router for:

- Server-side rendering for improved performance and SEO
- Client-side navigation for smooth user experience
- API routes for server-side operations
- Optimized image handling
- TypeScript integration for type safety

### GraphQL Data Fetching

Data is fetched using Apollo Client, providing:

- Efficient data retrieval with GraphQL queries
- Cache management for improved performance
- Real-time updates with GraphQL subscriptions
- Type-safe operations with TypeScript integration

### Component Architecture

The UI is built with:

- Reusable and composable React components
- Responsive design using Tailwind CSS
- Custom hooks for encapsulated business logic
- Form handling with validation
- Loading states and error handling

### State Management

- Context API for global state
- Custom hooks for component-specific state
- Apollo Client cache for server data state

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── action/             # Server actions (Next.js)
│   ├── app/                # Next.js application routes
│   │   ├── comparison/     # Report comparison pages
│   │   ├── generate/       # Report generation pages
│   │   ├── history/        # Historical reports pages
│   │   ├── login/          # Authentication pages
│   │   └── signup/         # User registration pages
│   ├── components/         # React components
│   │   ├── home/           # Home page components
│   │   ├── layout/         # Layout components
│   │   ├── modal/          # Modal components
│   │   ├── ui/             # UI components
│   │   └── weather/        # Weather-specific components
│   ├── context/            # React context providers
│   ├── graphql/            # GraphQL queries and mutations
│   │   ├── fragment/       # GraphQL fragments
│   │   ├── mutation/       # GraphQL mutations
│   │   └── query/          # GraphQL queries
│   ├── hooks/              # Custom React hooks
│   ├── libs/               # Utility libraries
│   ├── schemas/            # Validation schemas
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
```

## Component Architecture

The frontend uses a component hierarchy that promotes reusability and maintainability:

```
└── Layout (Navbar, Footer)
    ├── Dashboard
    │   └── WeatherPanel
    │       ├── WeatherMetric
    │       └── RefreshControl
    ├── GeneratePage
    │   ├── ReportForm
    │   └── ReportDisplay
    ├── HistoryPage
    │   ├── FilterControls
    │   ├── ReportTable
    │   └── SelectionControls
    └── ComparisonPage
        ├── ReportSelector
        └── ComparisonTable
            └── DeviationDisplay
```

## State Management

The application uses several context providers:

- **UserContext**: Manages authentication state and user data
- **WeatherContext**: Handles weather data and report state
- **ToastContext**: Manages application-wide notifications

Custom hooks abstract complex logic:

- **useWeatherData**: Fetches and manages weather data
- **useWeatherReducer**: Handles state transitions for weather data
- **useAuth**: Manages authentication and user sessions

## User Flows

### Report Generation Flow

1. User navigates to Generate page
2. User selects current time or specifies a historical date/time
3. System fetches data from the OpenWeather API via the backend
4. Report is generated and displayed to the user
5. User can save the report to history or discard it

### Report Comparison Flow

1. User navigates to History page
2. User selects two reports for comparison
3. System navigates to Comparison page
4. Reports are displayed side-by-side with calculated deviations
5. User can save the comparison, print it, or return to history

### Authentication Flow

1. User visits login page
2. User enters credentials or signs up for a new account
3. System authenticates via backend JWT service
4. User is redirected to dashboard with authenticated session
5. Protected routes are now accessible

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository
2. Install dependencies

   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

## Configuration

### Environment Variables

| Variable              | Description          | Default                         |
| --------------------- | -------------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL` | GraphQL API endpoint | `http://localhost:4000/graphql` |

## Development and Extension

### Adding New Features

The modular architecture makes it easy to extend the system:

1. **New Pages**: Add new route directories in the `app/` folder
2. **New Components**: Create components in the relevant directory
3. **New GraphQL Operations**: Add queries or mutations in the `graphql/` directory

### UI Customization

The design can be customized by:

- Modifying Tailwind configuration
- Updating component styles
- Adding new UI components

### Testing

Run the test suite with:

```bash
npm test
```

The frontend includes:

- Component tests using React Testing Library
- Hook tests for custom React hooks
- E2E tests with Playwright (optional)

## BACKEND

- [Backend Documentation](./backend/README.md)
