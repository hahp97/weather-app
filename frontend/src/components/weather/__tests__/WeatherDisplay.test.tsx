import { useQuery } from "@apollo/client";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { useUser } from "../../../context/UserContext";
import WeatherDisplay from "../WeatherDisplay";

// Mock the modules
jest.mock("@apollo/client", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/context/UserContext", () => ({
  useUser: jest.fn(),
}));

// Mock component dependencies
jest.mock("@/components/LoadingSpinner", () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

describe("WeatherDisplay Component", () => {
  const mockRefetch = jest.fn();
  const mockWeatherData = {
    id: "123",
    timestamp: "2025-04-20T10:00:00Z",
    temperature: 28,
    pressure: 1013,
    humidity: 75,
    cloudCover: 40,
    windSpeed: 5,
    weatherCondition: "Partly cloudy",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading spinner when loading", () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: true,
      error: null,
      data: null,
      refetch: mockRefetch,
    });

    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<WeatherDisplay />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should display error message when there is an error", () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: new Error("Failed to fetch weather data"),
      data: null,
      refetch: mockRefetch,
    });

    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<WeatherDisplay />);

    expect(screen.getByText("Error loading weather data")).toBeInTheDocument();
    expect(
      screen.getByText("Please refresh and try again")
    ).toBeInTheDocument();
  });

  it("should display weather data correctly", () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      data: { currentWeather: mockWeatherData },
      refetch: mockRefetch,
    });

    (useUser as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<WeatherDisplay />);

    // Check for weather data display
    expect(
      screen.getByText("Current Weather at Changi Airport")
    ).toBeInTheDocument();
    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
    expect(screen.getByText("28°C")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByText("5 m/s")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(screen.getByText("1013 hPa")).toBeInTheDocument();

    // Check for last updated text
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText("Updates every 2 hours")).toBeInTheDocument();
  });

  it("should show refresh button and faster update interval for logged in users", () => {
    (useQuery as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      data: { currentWeather: mockWeatherData },
      refetch: mockRefetch,
    });

    (useUser as jest.Mock).mockReturnValue({
      user: { id: "user1", email: "test@example.com" },
    });

    render(<WeatherDisplay />);

    // Refresh button should be visible for logged in users
    const refreshButton = screen.getByLabelText("Refresh weather data");
    expect(refreshButton).toBeInTheDocument();

    // Update interval text should reflect logged in status
    expect(screen.getByText("Updates every 5 minutes")).toBeInTheDocument();

    // Test refresh button click
    fireEvent.click(refreshButton);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
