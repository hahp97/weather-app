import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/Navbar";
import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";
import { WeatherProvider } from "@/context/WeatherContext";
import { ApolloWrapper } from "@/libs/apollo/provider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 no-scrollbar flex flex-col min-h-screen">
        <ApolloWrapper>
          <ToastProvider>
            <UserProvider>
              <WeatherProvider>
                <div className="sticky top-0 z-50">
                  <NavBar />
                </div>
                <main className="flex-grow">{children}</main>
                <Footer />
              </WeatherProvider>
            </UserProvider>
          </ToastProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
