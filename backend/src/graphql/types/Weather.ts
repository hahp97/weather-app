export default `#graphql
type Location {
  latitude: Float!
  longitude: Float!
  name: String!
}

type WeatherData {
  id: ID
  timestamp: DateTime
  temperature: Float
  pressure: Float
  humidity: Float
  cloudCover: Float
  windSpeed: Float
  windDirection: Float
  visibility: Float
  weatherCondition: String
  rainAmount: Float
  location: Location
  period: String
  createdAt: DateTime
}

type AggregatedWeatherData {
  id: ID
  timestamp: DateTime
  temperature: Float
  minTemperature: Float
  maxTemperature: Float
  pressure: Float
  humidity: Float
  cloudCover: Float
  windSpeed: Float
  count: Int
  interval: String
  location: Location
}

type WeatherReport {
  id: ID
  title: String
  startTime: DateTime
  endTime: DateTime
  avgTemperature: Float
  avgPressure: Float
  avgHumidity: Float
  avgCloudCover: Float
  avgWindSpeed: Float
  dataPointsCount: Int
  userId: ID
  createdAt: DateTime
  updatedAt: DateTime
}

type WeatherDeviations {
  temperature: Float
  pressure: Float
  humidity: Float
  cloudCover: Float
  windSpeed: Float
}

type WeatherStatistics {
  avgTemperature: Float
  minTemperature: Float
  maxTemperature: Float
  avgPressure: Float
  minPressure: Float
  maxPressure: Float
  avgHumidity: Float
  avgCloudCover: Float
  avgWindSpeed: Float
  recordsCount: Int
  period: String
}

type WeatherReportComparison {
  report1: WeatherReport
  report2: WeatherReport
  deviations: WeatherDeviations
}

input DateRangeInput {
  startTime: DateTime!
  endTime: DateTime!
}

input AggregationInput {
  startTime: DateTime!
  endTime: DateTime!
  interval: String
}

enum WeatherReportOrder {
  createdAt_ASC
  createdAt_DESC
  startTime_ASC
  startTime_DESC
  endTime_ASC
  endTime_DESC
}

input WeatherReportFilter {
  AND: [WeatherReportFilter!]
  OR: [WeatherReportFilter!]
  title_contains: String
  startTime_gte: DateTime
  startTime_lte: DateTime
  endTime_gte: DateTime
  endTime_lte: DateTime
  createdAt_gte: DateTime
  createdAt_lte: DateTime
}

type Query {
  # Get current weather data
  currentWeather: WeatherData
  
  # Get weather data for a time range
  weatherDataInRange(range: DateRangeInput!): [WeatherData]
  
  # Get aggregated weather data (for charts)
  aggregatedWeatherData(aggregation: AggregationInput!): [AggregatedWeatherData]
  
  # Get weather statistics for dashboard
  weatherStatistics(days: Int): WeatherStatistics
  
  # Get all weather reports with optional filtering and pagination
  weatherReports(first: Int, skip: Int, filter: WeatherReportFilter, orderBy: [WeatherReportOrder]): [WeatherReport]
  weatherReportsMeta(filter: WeatherReportFilter): ObjectMeta
  
  # Get a specific weather report
  weatherReport(id: ID!): WeatherReport
  
  # Compare two weather reports
  compareWeatherReports(reportId1: ID!, reportId2: ID!): WeatherReportComparison
}

input GenerateWeatherReportInput {
  startTime: DateTime!
  endTime: DateTime!
  title: String
}

type Mutation {
  # Generate a weather report for a specific time range
  generateWeatherReport(input: GenerateWeatherReportInput!): CommonResponse
  
  # Fetch latest weather data and store it
  fetchAndStoreWeatherData: CommonResponse
  
  # Fetch historical weather data for a specific date and store it
  fetchHistoricalWeatherData(date: DateTime!): CommonResponse
}

type WeatherDataSubscriptionPayload {
  mutation: _ModelMutationType!
  node: WeatherData
}

type WeatherReportSubscriptionPayload {
  mutation: _ModelMutationType!
  node: WeatherReport
}

type Subscription {
  WeatherData(filter: SubscriptionFilter): WeatherDataSubscriptionPayload
  WeatherReport(filter: SubscriptionFilter, dataFilter: WeatherReportFilter): WeatherReportSubscriptionPayload
}`;
