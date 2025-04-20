"use client";

import { cn } from "@/utils/common";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
};

export default function LoadingSpinner({
  size = "md",
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinnerElement = (
    <div
      className={cn(
        "animate-spin rounded-full border-solid border-blue-500 border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          {spinnerElement}
          <p className="text-sm font-medium text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">{spinnerElement}</div>
  );
}
