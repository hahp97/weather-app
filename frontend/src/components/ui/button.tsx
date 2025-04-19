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
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",

          // Variants
          variant === "default" && "bg-blue-600 text-white hover:bg-blue-700",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
          variant === "outline" &&
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          variant === "secondary" &&
            "bg-gray-100 text-gray-900 hover:bg-gray-200",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "link" &&
            "text-blue-600 underline-offset-4 hover:underline",

          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 rounded-md px-3 text-xs",
          size === "lg" && "h-11 rounded-md px-8",
          size === "icon" && "h-10 w-10",

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
