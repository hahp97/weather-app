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
  userId: string;
  createdAt: string;
  updatedAt: string;
}
