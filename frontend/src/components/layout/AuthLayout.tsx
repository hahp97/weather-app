import { PageSkeleton } from "@/components/ui/skeleton";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  loading?: boolean;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  loading = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="mx-auto bg-gradient-to-r from-sky-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
            <div className="bg-white py-8 px-6 shadow rounded-lg border border-gray-100">
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
