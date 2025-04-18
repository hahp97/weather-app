import { z } from "zod";

export const weatherReportSchema = z.object({
  timestamp: z.string(),
  temperature: z.number(),
  pressure: z.number(),
  humidity: z.number().min(0).max(100),
  cloudCover: z.number().min(0).max(100),
});

export const weatherRequestSchema = z.object({
  date: z.date().optional(),
});

export type WeatherReportFormData = z.infer<typeof weatherReportSchema>;
export type WeatherRequestFormData = z.infer<typeof weatherRequestSchema>;
