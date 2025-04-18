"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export interface WeatherReport {
  id: string;
  timestamp: string;
  temperature: number;
  pressure: number;
  humidity: number;
  cloudCover: number;
}

interface WeatherContextType {
  reports: WeatherReport[];
  selectedReports: WeatherReport[];
  addReport: (report: WeatherReport) => void;
  setReports: (reports: WeatherReport[]) => void;
  selectReport: (report: WeatherReport) => void;
  deselectReport: (reportId: string) => void;
  clearSelectedReports: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<WeatherReport[]>([]);
  const [selectedReports, setSelectedReports] = useState<WeatherReport[]>([]);

  const addReport = useCallback((report: WeatherReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const selectReport = useCallback((report: WeatherReport) => {
    setSelectedReports((prev) => {
      if (prev.length >= 2) {
        return [prev[1], report];
      }
      return [...prev, report];
    });
  }, []);

  const deselectReport = useCallback((reportId: string) => {
    setSelectedReports((prev) =>
      prev.filter((report) => report.id !== reportId)
    );
  }, []);

  const clearSelectedReports = useCallback(() => {
    setSelectedReports([]);
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        reports,
        selectedReports,
        addReport,
        setReports,
        selectReport,
        deselectReport,
        clearSelectedReports,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
