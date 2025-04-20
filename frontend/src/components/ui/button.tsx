import { cn } from "@/utils/common";
import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

          // Variants
          variant === "default" &&
            "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md",
          variant === "destructive" &&
            "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md",
          variant === "outline" &&
            "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 hover:text-gray-900",
          variant === "secondary" &&
            "bg-gray-100 text-gray-800 hover:bg-gray-200 shadow-sm",
          variant === "ghost" && "hover:bg-gray-100 text-gray-700",
          variant === "link" &&
            "text-blue-600 underline-offset-4 hover:underline p-0 h-auto",

          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-12 rounded-md px-8 text-base",
          size === "icon" && "h-10 w-10 p-2",

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
