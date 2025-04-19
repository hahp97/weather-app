interface BackendReport {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  avgTemperature: number;
  avgPressure: number;
  avgHumidity: number;
  avgCloudCover: number;
  dataPointsCount: number;
  createdAt: string;
}

interface ComparisonData {
  report1: BackendReport;
  report2: BackendReport;
  deviations: {
    temperature: number;
    pressure: number;
    humidity: number;
    cloudCover: number;
    windSpeed: number;
  };
}
