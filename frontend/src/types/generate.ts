interface WeatherData {
  id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCover: number;
  windSpeed?: number;
  weatherCondition?: string;
  createdAt?: string;
}

interface WeatherReport {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  avgTemperature: number;
  avgPressure: number;
  avgHumidity: number;
  avgCloudCover: number;
  avgWindSpeed: number;
  dataPointsCount: number;
  createdAt: string;
  updatedAt: string;
}
