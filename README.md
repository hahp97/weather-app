# Changi Airport Weather Report System (Scanner)

A comprehensive full-stack application for monitoring, analyzing, and comparing weather data at Changi Airport, Singapore (Latitude: 1.3586° N, Longitude: 103.9899° E).

![Weather Report Dashboard](image.png)

## Overview

This system fulfills the requirements of the Scanner Technical Assessment, providing a robust solution for real-time and historical weather monitoring at Changi Airport. The application enables users to generate reports of current weather conditions, store these reports for future reference, and perform comparative analysis between different time periods.

## Key Features

- **Weather Data Collection**: Automated retrieval of weather metrics from OpenWeather API
- **Report Generation**: On-demand creation of weather reports with key metrics
- **Historical Data**: Browsing and filtering of previously generated reports
- **Comparison Tools**: Side-by-side comparison of reports with deviation calculation
- **User Authentication**: Secure login and account management for personalized experience

## Assessment Requirements Implementation

| Requirement                     | Implementation                                                  |
| ------------------------------- | --------------------------------------------------------------- |
| **Weather Report Generation**   | ✅ UI for generating reports for current or selected timestamps |
| **History Page**                | ✅ Tabular view with timestamp and all required metrics         |
| **Comparison Page**             | ✅ Side-by-side comparison with deviation calculations          |
| **OpenWeather API Integration** | ✅ Secure backend integration with error handling               |
| **Data Storage**                | ✅ Efficient MongoDB time-series collections                    |
| **Navigation & UX**             | ✅ Intuitive navigation with loading states                     |

## System Architecture

The system follows a modern full-stack architecture, leveraging:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  OpenWeather    │     │  Backend API    │     │    Frontend     │
│      API        │◄────┤  (GraphQL)      │◄────┤  (Next.js)      │
└─────────────────┘     └───────┬─────────┘     └─────────────────┘
                               │
                      ┌────────▼────────┐
                      │    MongoDB      │
                      │  (Time Series)  │
                      └─────────────────┘
```

For detailed implementation information, please refer to:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

### Technology Stack

#### Frontend

- **Next.js** with React for server-rendered UI
- **Apollo Client** for GraphQL data fetching
- **Tailwind CSS** for responsive design
- **TypeScript** for type safety

#### Backend

- **Node.js** with Express
- **GraphQL** with Apollo Server
- **MongoDB** with time-series collections
- **Prisma ORM** for database access
- **JWT** for authentication

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (v5+ with time series collections support)
- OpenWeather API key (sign up at [OpenWeather](https://openweathermap.org/))

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/weather_report.git
   cd weather_report
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install

   # Configure environment variables (see below)
   # Then generate Prisma client and start the server
   npx prisma generate
   npm run dev
   ```

3. **Set up the frontend**

   ```bash
   cd ../frontend
   npm install

   # Configure environment variables (see below)
   # Then start the development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - GraphQL API: http://localhost:4000/graphql

### Environment Configuration

#### Backend (.env)

```
DATABASE_URL="mongodb://localhost/weather_report_development?directConnection=true"
SECRET1="your_secret_key_1"
SECRET2="your_secret_key_2"
JWT_SECRET="your_jwt_secret"
FRONTEND_URL="http://localhost:3000"
PORT=4000
NODE_ENV="development"
OPEN_WEATHER_API_KEY="your_openweather_api_key"
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT=587
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_FROM="noreply@weatherreport.com"
```

#### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

## Project Structure

The project is organized into two main directories:

- **[Backend](./backend/README.md)**: Node.js/GraphQL server with MongoDB
- **[Frontend](./frontend/README.md)**: Next.js/React application

Each directory has its own detailed README with specific implementation details.

## Technical Documentation

### Project Approach

This implementation follows modern web development practices with a focus on:

1. **Type Safety**: TypeScript throughout the codebase ensures type safety and improves developer experience
2. **Component-Based Architecture**: Modular components for UI and backend services
3. **API-First Design**: GraphQL schema defines the contract between frontend and backend
4. **Automated Data Collection**: Background jobs ensure consistent weather data collection

### Additional Features

Beyond the core requirements, the implementation includes:

#### Enhanced Security

- JWT-based authentication
- HTTP-only cookies for token storage
- Password hashing with bcrypt
- Rate limiting for API endpoints
- Input validation with Zod

#### Performance Optimizations

- MongoDB time-series collections for efficient temporal data storage
- GraphQL data loaders for batching and caching
- Apollo Client cache for reduced network requests
- Server-side rendering for improved initial load time

#### Developer Experience

- Comprehensive TypeScript types
- Modular code structure
- Detailed documentation
- Consistent code style and formatting

#### User Experience

- Responsive design for all device sizes
- Intuitive navigation
- Loading states and error handling
- Form validation and feedback

## Testing

The project includes comprehensive testing:

### Backend Tests

- Unit tests for API resolvers
- Integration tests for database services
- Authentication tests for security features

### Frontend Tests

- Component tests with React Testing Library
- Custom hook tests
- End-to-end flows with Playwright

Run tests with:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Future Enhancements

The system is designed to be extensible for future requirements:

1. **Administrative Dashboard**: User management and system monitoring
2. **Extended Metrics**: Additional weather data points beyond the core requirements
3. **Subscription Model**: Premium features for paid users
4. **Mobile Applications**: Native mobile apps for iOS and Android
5. **Advanced Analytics**: Statistical analysis and weather prediction
6. **Containerization**: Docker setup for easier deployment
7. **Cloud Deployment**: AWS/GCP/Azure deployment configurations

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential.

---
