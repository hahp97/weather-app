import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeHeader } from "@/components/home/HomeHeader";
import { WeatherDisplayWrapper } from "@/components/home/WeatherDisplayWrapper";
import AirportMap from "@/components/weather/AirportMap";
import { metadata } from "./metadata";

export default function Home() {
  return (
    <div className="py-10 bg-gradient-to-b from-white via-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeHeader />
        <WeatherDisplayWrapper />
        <HomeFeatures />
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Weather Forecast Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-700">
                Stay informed about the weather conditions in your area with
                live updates.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Daily Planning
              </h3>
              <p className="text-gray-700">
                Plan your day with accurate weather forecasts and hourly
                predictions.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-red-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Severe Weather Alerts
              </h3>
              <p className="text-gray-700">
                Get timely alerts for severe weather conditions to stay safe.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-purple-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Data Visualization
              </h3>
              <p className="text-gray-700">
                Access real-time weather data with intuitive charts and
                forecasts.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-yellow-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Weather News
              </h3>
              <p className="text-gray-700">
                Stay updated with the latest weather news and information.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-teal-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Location-based Forecasts
              </h3>
              <p className="text-gray-700">
                Get personalized weather updates based on your exact location.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Changi Airport Location
          </h2>
          <div className="flex justify-center">
            <AirportMap height="400px" />
          </div>
        </div>
      </main>
    </div>
  );
}

export { metadata };
