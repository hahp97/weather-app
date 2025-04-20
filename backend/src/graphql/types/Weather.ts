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

  # resolver
  user: User
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
  userId: ID
}

input WeatherReportInput {
  title: String!
  startTime: DateTime!
  endTime: DateTime!
  temperature: Float
  pressure: Float
  humidity: Float
  cloudCover: Float
}

type Query {
  # Get current weather data
  currentWeather: WeatherData
  
  # Get weather data for a time range
  weatherDataInRange(range: DateRangeInput!, first: Int, skip: Int, sortField: String, sortOrder: String): [WeatherData]
  
  # Get all weather reports with optional filtering and pagination
  weatherReports(first: Int, skip: Int, filter: WeatherReportFilter, orderBy: [WeatherReportOrder]): [WeatherReport]
  weatherReportsMeta(filter: WeatherReportFilter): ObjectMeta
  
  # Get weather data meta information (count)
  weatherDataMeta(range: DateRangeInput!): ObjectMeta
  
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
  # Save a weather report directly
  saveWeatherReport(input: WeatherReportInput!): CommonResponse
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
