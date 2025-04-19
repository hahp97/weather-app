"use client";

import type { WeatherRequestFormData } from "@/schemas/weather";
import { weatherRequestSchema } from "@/schemas/weather";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

interface DatePickerFormProps {
  onSubmit: (data: WeatherRequestFormData) => void;
  isLoading?: boolean;
}

export function DatePickerForm({
  onSubmit,
  isLoading = false,
}: DatePickerFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WeatherRequestFormData>({
    resolver: zodResolver(weatherRequestSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const handleFormSubmit = (data: WeatherRequestFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700"
        >
          Select Date (optional)
        </label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <div>
              <input
                id="date"
                type="date"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={
                  field.value
                    ? new Date(field.value).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const date = e.target.value
                    ? new Date(e.target.value)
                    : new Date();
                  field.onChange(date);
                }}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.date.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Generate Weather Report"}
        </button>
      </div>
    </form>
  );
}
