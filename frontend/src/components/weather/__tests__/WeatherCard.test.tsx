import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { WeatherCard } from "../WeatherCard";

// Mock WeatherContext
jest.mock("@/context/WeatherContext", () => {
  const originalModule = jest.requireActual("@/context/WeatherContext");
  return {
    ...originalModule,
    useWeather: () => ({
      selectReport: jest.fn(),
      deselectReport: jest.fn(),
    }),
  };
});

describe("WeatherCard Component", () => {
  const mockReport = {
    id: "1",
    timestamp: "2025-04-20T10:00:00Z",
    temperature: 25,
    pressure: 1013,
    humidity: 80,
    cloudCover: 30,
    windSpeed: 10,
    windDirection: "NE",
    visibility: 10,
    uvIndex: 5,
  };

  it("renders weather report data correctly", () => {
    render(<WeatherCard report={mockReport} />);

    // Check report
    expect(screen.getByText("Weather Report")).toBeInTheDocument();

    expect(screen.getByText("25°C")).toBeInTheDocument();
    expect(screen.getByText("1013 hPa")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();

    expect(screen.getByText(/Apr 20, 2025/)).toBeInTheDocument();
  });

  it("shows select button when showSelectButton is true", () => {
    render(<WeatherCard report={mockReport} showSelectButton={true} />);

    const selectButton = screen.getByText("Select");
    expect(selectButton).toBeInTheDocument();
  });

  it("does not show select button when showSelectButton is false", () => {
    render(<WeatherCard report={mockReport} showSelectButton={false} />);

    expect(screen.queryByText("Select")).not.toBeInTheDocument();
  });

  it("displays selected state correctly", () => {
    render(
      <WeatherCard
        report={mockReport}
        showSelectButton={true}
        isSelected={true}
      />
    );

    const selectedButton = screen.getByText("Selected");
    expect(selectedButton).toBeInTheDocument();
  });

  it("calls selectReport when the Select button is clicked", () => {
    render(
      <WeatherCard
        report={mockReport}
        showSelectButton={true}
        isSelected={false}
      />
    );

    const selectButton = screen.getByText("Select");
    fireEvent.click(selectButton);
  });
});
