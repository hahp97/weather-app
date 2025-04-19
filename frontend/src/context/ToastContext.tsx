"use client";

import { ReactNode } from "react";
import { Toaster, toast } from "sonner";

export type ToastType = "success" | "error" | "info" | "warning";

// Trả về toast object từ sonner
export function useToast() {
  return toast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
}
