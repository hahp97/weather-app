import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { ApolloWrapper } from "@/libs/apollo/provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather Report System",
  description: "Changi Airport Weather Report System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <ApolloWrapper>
          <ToastProvider>
            <UserProvider>
              <WeatherProvider>
                <Navbar />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  {children}
                </main>
              </WeatherProvider>
            </UserProvider>
          </ToastProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
